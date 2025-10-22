import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/actions/audit"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get("transaction_id")

  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID required" }, { status: 400 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Get transaction
  const { data: transaction } = await supabase
    .from("transactions")
    .select(
      `
      *,
      milestone:milestones (
        id,
        project_id
      )
    `,
    )
    .eq("id", transactionId)
    .single()

  if (!transaction || transaction.payer_id !== user.id) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
  }

  // In a real implementation, this would:
  // 1. Create a Mercado Pago preference
  // 2. Redirect to Mercado Pago checkout
  // 3. Handle webhook confirmation
  // 4. Update transaction and milestone status

  // For now, simulate successful payment
  await supabase
    .from("transactions")
    .update({
      status: "completed",
      mercadopago_payment_id: `SIMULATED_${Date.now()}`,
    })
    .eq("id", transactionId)

  // Update milestone status
  await supabase
    .from("milestones")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", transaction.milestone_id)

  // Update freelancer balance
  await supabase.rpc("increment_balance", {
    user_id: transaction.payee_id,
    amount: transaction.amount,
  })

  // Create audit log
  await createAuditLog({
    action: "complete_payment",
    entityType: "transaction",
    entityId: transaction.id,
    entityCode: transaction.code,
    details: { amount: transaction.amount },
  })

  // Redirect back to milestones page
  return NextResponse.redirect(new URL(`/projects/${transaction.milestone.project_id}/milestones`, request.url))
}
