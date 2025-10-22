// NEW FEATURE - Receipt Generation API
import { createServerClient } from "@/lib/supabase/server"
import { generateReceiptHTML } from "@/lib/utils/pdf-generator"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Get transaction with all related data
    const { data: transaction, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        project:projects (
          id,
          title,
          code
        ),
        payer:profiles!payer_id (
          full_name,
          email,
          cpf
        ),
        payee:profiles!payee_id (
          full_name,
          email,
          cpf
        ),
        milestone:milestones (
          title,
          description
        )
      `,
      )
      .eq("id", params.id)
      .single()

    if (error || !transaction) {
      return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    // Verify user has access to this transaction
    if (transaction.payer_id !== user.id && transaction.payee_id !== user.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    // Generate HTML receipt
    const html = generateReceiptHTML({
      transaction: {
        id: transaction.id,
        code: transaction.code,
        amount: Number(transaction.amount),
        status: transaction.status,
        payment_method: transaction.payment_method,
        created_at: transaction.created_at,
      },
      project: transaction.project,
      payer: transaction.payer,
      payee: transaction.payee,
      milestone: transaction.milestone,
    })

    // Return HTML (can be converted to PDF by browser or external service)
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="recibo-${transaction.code}.html"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating receipt:", error)
    return NextResponse.json({ error: "Erro ao gerar recibo" }, { status: 500 })
  }
}
