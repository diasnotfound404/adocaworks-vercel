// NEW FEATURE - Cashback Card Component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, TrendingUp, TrendingDown } from "lucide-react"
import type { CashbackSummary } from "@/lib/types/cashback"

interface CashbackCardProps {
  summary: CashbackSummary
}

export function CashbackCard({ summary }: CashbackCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Cashback</CardTitle>
            <CardDescription>Ganhe 2% de volta em cada pagamento</CardDescription>
          </div>
          <Gift className="h-8 w-8 text-green-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-4">
          <p className="text-sm text-gray-600">Saldo Disponível</p>
          <p className="text-3xl font-bold text-green-600">R$ {summary.balance.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm font-medium">Ganho</p>
            </div>
            <p className="mt-1 text-xl font-bold text-blue-600">R$ {summary.total_earned.toFixed(2)}</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <div className="flex items-center gap-2 text-purple-600">
              <TrendingDown className="h-4 w-4" />
              <p className="text-sm font-medium">Usado</p>
            </div>
            <p className="mt-1 text-xl font-bold text-purple-600">R$ {summary.total_used.toFixed(2)}</p>
          </div>
        </div>

        {summary.recent_transactions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Transações Recentes</p>
            {summary.recent_transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={transaction.type === "earned" ? "default" : "secondary"}>
                    {transaction.type === "earned" ? "Ganho" : "Usado"}
                  </Badge>
                  <span className="text-gray-600">{transaction.description}</span>
                </div>
                <span className={`font-medium ${transaction.type === "earned" ? "text-green-600" : "text-gray-600"}`}>
                  {transaction.type === "earned" ? "+" : "-"}R$ {Number(transaction.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
