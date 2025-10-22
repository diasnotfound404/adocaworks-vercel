-- NEW FEATURE - Reviews and Rating System
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating_communication INTEGER NOT NULL CHECK (rating_communication >= 1 AND rating_communication <= 5),
  rating_quality INTEGER NOT NULL CHECK (rating_quality >= 1 AND rating_quality <= 5),
  rating_deadline INTEGER NOT NULL CHECK (rating_deadline >= 1 AND rating_deadline <= 5),
  rating_overall NUMERIC GENERATED ALWAYS AS (
    (rating_communication + rating_quality + rating_deadline)::NUMERIC / 3.0
  ) STORED,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, reviewer_id, reviewee_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_project ON reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating_overall);

-- Function to update profile rating after review
CREATE OR REPLACE FUNCTION update_profile_rating_after_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reviewee's rating and total reviews
  UPDATE profiles
  SET 
    rating = (
      SELECT AVG(rating_overall)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewee_id = NEW.reviewee_id
    )
  WHERE id = NEW.reviewee_id;
  
  -- Check for excellence achievement (5.0 rating)
  DECLARE
    v_rating NUMERIC;
  BEGIN
    SELECT rating INTO v_rating FROM profiles WHERE id = NEW.reviewee_id;
    IF v_rating >= 5.0 THEN
      PERFORM award_achievement(NEW.reviewee_id, 'excelencia');
    END IF;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_rating ON reviews;
CREATE TRIGGER trigger_update_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_rating_after_review();

-- Update trigger for reviews
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();
