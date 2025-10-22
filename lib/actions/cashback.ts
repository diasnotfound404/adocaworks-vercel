// NEW FEATURE - Cashback Actions
"use server"

import { createServerClient } from "@/lib/supabase/server"
import type { CashbackTransaction, CashbackSummary } from "@/lib/types/cashback"

export async function getCashbackBalance(userId: string): Promise<number> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("profiles").select("cashback_balance").eq("id", userId).single()

  if (error || !data) {
    console.error("[v0] Error fetching cashback balance:", error)
    return 0
  }

  return Number(data.cashback_balance) || 0
}

export async function getCashbackTransactions(userId: string): Promise<CashbackTransaction[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("cashback_transactions")
    .select(`
      *,
      project:projects (
        id,
        title,
        code
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("[v0] Error fetching cashback transactions:", error)
    return []
  }

  return data || []
}

export async function getCashbackSummary(userId: string): Promise<CashbackSummary> {
  const supabase = await createServerClient()

  const [balance, transactions] = await Promise.all([getCashbackBalance(userId), getCashbackTransactions(userId)])

  const totalEarned = transactions.filter((t) => t.type === "earned").reduce((sum, t) => sum + Number(t.amount), 0)

  const totalUsed = transactions.filter((t) => t.type === "used").reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    balance,
    total_earned: totalEarned,
    total_used: totalUsed,
    recent_transactions: transactions.slice(0, 10),
  }
}

export async function useCashback(projectId: string, amount: number) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  if (amount <= 0) {
    return { error: "Valor inválido" }
  }

  // Use the database function
  const { data, error } = await supabase.rpc("use_cashback", {
    p_user_id: user.id,
    p_amount: amount,
    p_project_id: projectId,
  })

  if (error || !data) {
    console.error("[v0] Error using cashback:", error)
    return { error: "Saldo insuficiente ou erro ao usar cashback" }
  }

  return { success: true }
}
