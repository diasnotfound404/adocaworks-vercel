// NEW FEATURE - Gamification Types
export interface Achievement {
  id: string
  name: string
  slug: string
  description: string
  icon?: string
  badge_color?: string
  requirement_type: string
  requirement_value: number
  points: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  achievement?: Achievement
}

export interface UserLevel {
  level: number
  experience_points: number
  projects_completed: number
  next_level_xp: number
  progress_percentage: number
}
