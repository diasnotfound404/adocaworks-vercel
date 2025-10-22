import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { DownloadReceiptButton } from "@/components/download-receipt-button"

export default async function TransactionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get user's transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      *,
      project:projects (
        title,
        code
      ),
      milestone:milestones (
        title,
        code
      )
    `,
    )
    .or(`payer_id.eq.${user.id},payee_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">FreelaClone</h1>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost">Voltar ao Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Transações</h2>
            <p className="mt-2 text-gray-600">Histórico de pagamentos e recebimentos</p>
          </div>
          {profile.user_type === "freelancer" && (
            <Card className="w-64">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-600">Saldo Disponível</div>
                <div className="text-2xl font-bold">R$ {profile.balance.toFixed(2)}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {!transactions || transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DollarSign className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Nenhuma transação ainda</h3>
              <p className="text-gray-600">Suas transações aparecerão aqui</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isReceiving = transaction.payee_id === user.id
              const isPaying = transaction.payer_id === user.id

              return (
                <Card key={transaction.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            isReceiving ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {isReceiving ? (
                            <ArrowDownRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-semibold">
                              {transaction.milestone?.title || transaction.project?.title}
                            </h4>
                            <Badge
                              variant={
                                transaction.status === "completed"
                                  ? "default"
                                  : transaction.status === "pending"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {transaction.status === "pending" && "Pendente"}
                              {transaction.status === "processing" && "Processando"}
                              {transaction.status === "completed" && "Concluído"}
                              {transaction.status === "failed" && "Falhou"}
                              {transaction.status === "cancelled" && "Cancelado"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Código: {transaction.code}</p>
                          <p className="text-sm text-gray-600">
                            Projeto: {transaction.project?.title} ({transaction.project?.code})
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleString("pt-BR")}
                          </p>
                          {transaction.status === "completed" && (
                            <div className="mt-3">
                              <DownloadReceiptButton
                                transactionId={transaction.id}
                                transactionCode={transaction.code}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${isReceiving ? "text-green-600" : "text-red-600"}`}>
                          {isReceiving ? "+" : "-"}R$ {Number(transaction.amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">{transaction.type}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
