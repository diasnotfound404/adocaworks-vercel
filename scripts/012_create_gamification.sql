-- NEW FEATURE - Gamification System
-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT, -- Icon name from lucide-react
  badge_color TEXT DEFAULT '#FFD700', -- Gold color for badges
  requirement_type TEXT NOT NULL, -- 'projects_completed', 'rating_average', 'earnings_total', 'consecutive_5stars'
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 0, -- Points awarded for this achievement
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Add gamification fields to profiles
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS projects_completed INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);

-- Insert default achievements
INSERT INTO achievements (name, slug, description, icon, badge_color, requirement_type, requirement_value, points) VALUES
  ('Primeiro Passo', 'primeiro-passo', 'Complete seu primeiro projeto', 'Award', '#3B82F6', 'projects_completed', 1, 10),
  ('Profissional Dedicado', 'profissional-dedicado', 'Complete 10 projetos', 'Trophy', '#8B5CF6', 'projects_completed', 10, 50),
  ('Mestre do Ofício', 'mestre-oficio', 'Complete 50 projetos', 'Crown', '#F59E0B', 'projects_completed', 50, 200),
  ('Especialista', 'especialista', 'Complete 100 projetos', 'Star', '#EF4444', 'projects_completed', 100, 500),
  ('Excelência', 'excelencia', 'Mantenha avaliação média de 5 estrelas', 'Sparkles', '#10B981', 'rating_average', 5, 100),
  ('Cinco Estrelas Consecutivas', 'cinco-estrelas-consecutivas', 'Receba 5 avaliações de 5 estrelas seguidas', 'Zap', '#EC4899', 'consecutive_5stars', 5, 150)
ON CONFLICT (slug) DO NOTHING;

-- Function to calculate user level based on experience points
CREATE OR REPLACE FUNCTION calculate_user_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- Level 1: 0-99 XP
  -- Level 2: 100-399 XP
  -- Level 3: 400-899 XP
  -- Level 4: 900-1599 XP
  -- etc.
  RETURN FLOOR(SQRT(xp::FLOAT / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to award achievement to user
CREATE OR REPLACE FUNCTION award_achievement(p_user_id UUID, p_achievement_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_achievement_id UUID;
  v_points INTEGER;
  v_already_earned BOOLEAN;
BEGIN
  -- Get achievement details
  SELECT id, points INTO v_achievement_id, v_points
  FROM achievements
  WHERE slug = p_achievement_slug;
  
  IF v_achievement_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already has this achievement
  SELECT EXISTS(
    SELECT 1 FROM user_achievements 
    WHERE user_id = p_user_id AND achievement_id = v_achievement_id
  ) INTO v_already_earned;
  
  IF v_already_earned THEN
    RETURN FALSE;
  END IF;
  
  -- Award achievement
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, v_achievement_id);
  
  -- Add experience points
  UPDATE profiles
  SET 
    experience_points = experience_points + v_points,
    level = calculate_user_level(experience_points + v_points)
  WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements after project completion
CREATE OR REPLACE FUNCTION check_achievements_after_project()
RETURNS TRIGGER AS $$
DECLARE
  v_freelancer_id UUID;
  v_projects_count INTEGER;
BEGIN
  -- Only process when milestone is marked as paid
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Get freelancer from project
    SELECT p.selected_proposal_id INTO v_freelancer_id
    FROM projects p
    JOIN proposals pr ON pr.id = p.selected_proposal_id
    WHERE p.id = NEW.project_id;
    
    IF v_freelancer_id IS NOT NULL THEN
      -- Get proposal to find freelancer
      SELECT freelancer_id INTO v_freelancer_id
      FROM proposals
      WHERE id = (SELECT selected_proposal_id FROM projects WHERE id = NEW.project_id);
      
      -- Increment projects completed
      UPDATE profiles
      SET projects_completed = projects_completed + 1
      WHERE id = v_freelancer_id;
      
      -- Get updated count
      SELECT projects_completed INTO v_projects_count
      FROM profiles
      WHERE id = v_freelancer_id;
      
      -- Check for project completion achievements
      IF v_projects_count = 1 THEN
        PERFORM award_achievement(v_freelancer_id, 'primeiro-passo');
      ELSIF v_projects_count = 10 THEN
        PERFORM award_achievement(v_freelancer_id, 'profissional-dedicado');
      ELSIF v_projects_count = 50 THEN
        PERFORM award_achievement(v_freelancer_id, 'mestre-oficio');
      ELSIF v_projects_count = 100 THEN
        PERFORM award_achievement(v_freelancer_id, 'especialista');
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for achievement checking
DROP TRIGGER IF EXISTS trigger_check_achievements ON milestones;
CREATE TRIGGER trigger_check_achievements
  AFTER UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION check_achievements_after_project();
