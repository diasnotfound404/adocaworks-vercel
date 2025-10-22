export type UserType = "client" | "freelancer" | "admin"

export type ProjectStatus = "open" | "in_progress" | "completed" | "cancelled" | "disputed"

export type ProposalStatus = "pending" | "accepted" | "rejected" | "withdrawn"

export type MilestoneStatus = "pending" | "in_progress" | "completed" | "paid"

export type TransactionType = "escrow" | "release" | "refund" | "payout"

export type TransactionStatus = "pending" | "processing" | "completed" | "failed" | "cancelled"

export type DisputeStatus = "open" | "under_review" | "resolved" | "closed"

export type KYCStatus = "pending" | "approved" | "rejected"

export interface Profile {
  id: string
  email: string
  full_name: string | null
  user_type: UserType
  phone: string | null
  cpf: string | null
  avatar_url: string | null
  bio: string | null
  skills: string[] | null
  portfolio_url: string | null
  rating: number
  total_reviews: number
  balance: number
  kyc_verified: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  code: string
  client_id: string
  title: string
  description: string
  category: string
  budget_min: number | null
  budget_max: number | null
  deadline: string | null
  status: ProjectStatus
  selected_proposal_id: string | null
  attachments: any[]
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  code: string
  project_id: string
  freelancer_id: string
  amount: number
  delivery_days: number
  cover_letter: string
  status: ProposalStatus
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  code: string
  project_id: string
  title: string
  description: string | null
  amount: number
  order_index: number
  status: MilestoneStatus
  due_date: string | null
  completed_at: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  code: string
  project_id: string
  milestone_id: string | null
  payer_id: string
  payee_id: string | null
  amount: number
  type: TransactionType
  status: TransactionStatus
  mercadopago_payment_id: string | null
  mercadopago_preference_id: string | null
  payment_method: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Dispute {
  id: string
  code: string
  project_id: string
  milestone_id: string | null
  raised_by: string
  reason: string
  description: string
  status: DisputeStatus
  resolution: string | null
  resolved_by: string | null
  resolved_at: string | null
  attachments: any[]
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  entity_code: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface KYCData {
  id: string
  user_id: string
  document_type: "cpf" | "cnpj" | "rg" | "passport"
  document_number: string
  document_front_url: string | null
  document_back_url: string | null
  selfie_url: string | null
  status: KYCStatus
  rejection_reason: string | null
  verified_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
}
