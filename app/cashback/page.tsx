// NEW FEATURE - Cashback Page
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { getCashbackSummary } from "@/lib/actions/cashback"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, TrendingUp, TrendingDown, Info } from "lucide-react"

export default async function CashbackPage() {
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

  const summary = await getCashbackSummary(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Cashback</h1>
          <p className="mt-2 text-gray-600">Acompanhe seus créditos e economize em futuros projetos</p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900">Como funciona o Cashback?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-blue-800">
            <p>
              A cada pagamento realizado, você ganha 2% de volta em créditos. Use esses créditos para pagar seus
              próximos projetos e economize!
            </p>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <div className="mb-8">
          <Card className="border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Saldo Disponível</CardTitle>
                  <CardDescription>Pronto para usar em seus próximos projetos</CardDescription>
                </div>
                <Gift className="h-12 w-12 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-green-600">R$ {summary.balance.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <CardTitle>Total Ganho</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">R$ {summary.total_earned.toFixed(2)}</p>
              <p className="mt-2 text-sm text-gray-600">Cashback acumulado em todos os pagamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-purple-600" />
                <CardTitle>Total Usado</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">R$ {summary.total_used.toFixed(2)}</p>
              <p className="mt-2 text-sm text-gray-600">Créditos utilizados em projetos</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Transações</CardTitle>
            <CardDescription>Suas últimas movimentações de cashback</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.recent_transactions.length === 0 ? (
              <p className="py-8 text-center text-gray-500">Nenhuma transação ainda</p>
            ) : (
              <div className="space-y-4">
                {summary.recent_transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.type === "earned" ? "default" : "secondary"}>
                          {transaction.type === "earned" ? "Ganho" : "Usado"}
                        </Badge>
                        <p className="font-medium">{transaction.description}</p>
                      </div>
                      {transaction.project && (
                        <p className="mt-1 text-sm text-gray-500">
                          {transaction.project.title} ({transaction.project.code})
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${transaction.type === "earned" ? "text-green-600" : "text-gray-600"}`}
                      >
                        {transaction.type === "earned" ? "+" : "-"}R$ {Number(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
