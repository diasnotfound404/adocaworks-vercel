// NEW FEATURE - Reviews Types
export interface Review {
  id: string
  project_id: string
  reviewer_id: string
  reviewee_id: string
  rating_communication: number
  rating_quality: number
  rating_deadline: number
  rating_overall: number
  comment?: string
  created_at: string
  updated_at: string
  reviewer?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  project?: {
    id: string
    title: string
    code: string
  }
}
