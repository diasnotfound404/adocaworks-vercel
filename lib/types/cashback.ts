// NEW FEATURE - Cashback Types
export interface CashbackTransaction {
  id: string
  user_id: string
  amount: number
  type: "earned" | "used"
  source_transaction_id?: string
  project_id?: string
  description?: string
  created_at: string
  project?: {
    id: string
    title: string
    code: string
  }
}

export interface CashbackSummary {
  balance: number
  total_earned: number
  total_used: number
  recent_transactions: CashbackTransaction[]
}
