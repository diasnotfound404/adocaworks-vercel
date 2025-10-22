import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { createAuditLog } from "@/lib/actions/audit"

// Webhook endpoint for Mercado Pago payment notifications
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Verify webhook signature (in production, validate with Mercado Pago secret)
    // const signature = request.headers.get("x-signature")
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    const { type, data } = body

    if (type === "payment") {
      const paymentId = data.id

      // Get payment details from Mercado Pago API
      // const paymentDetails = await fetchPaymentFromMercadoPago(paymentId)

      const supabase = await createClient()

      // Find transaction by Mercado Pago payment ID
      const { data: transaction } = await supabase
        .from("transactions")
        .select("*")
        .eq("mercadopago_payment_id", paymentId)
        .single()

      if (!transaction) {
        console.error("[v0] Transaction not found for payment:", paymentId)
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }

      // Update transaction status based on payment status
      const paymentStatus = "approved" // In real implementation, get from paymentDetails.status

      if (paymentStatus === "approved") {
        // Update transaction
        await supabase
          .from("transactions")
          .update({
            status: "completed",
            payment_method: "mercadopago", // Get from paymentDetails
          })
          .eq("id", transaction.id)

        // Update milestone
        await supabase
          .from("milestones")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
          })
          .eq("id", transaction.milestone_id)

        // Update freelancer balance
        if (transaction.payee_id) {
          await supabase.rpc("increment_balance", {
            user_id: transaction.payee_id,
            amount: transaction.amount,
          })
        }

        // Create audit log
        await createAuditLog({
          action: "webhook_payment_confirmed",
          entityType: "transaction",
          entityId: transaction.id,
          entityCode: transaction.code,
          details: { payment_id: paymentId, status: paymentStatus },
        })
      } else if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
        await supabase.from("transactions").update({ status: "failed" }).eq("id", transaction.id)

        await createAuditLog({
          action: "webhook_payment_failed",
          entityType: "transaction",
          entityId: transaction.id,
          entityCode: transaction.code,
          details: { payment_id: paymentId, status: paymentStatus },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
