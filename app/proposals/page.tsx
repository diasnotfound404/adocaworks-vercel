import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, DollarSign, FileText } from "lucide-react"

export default async function ProposalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.user_type !== "freelancer") {
    redirect("/dashboard")
  }

  // Get freelancer's proposals
  const { data: proposals } = await supabase
    .from("proposals")
    .select(
      `
      *,
      project:projects (
        id,
        code,
        title,
        status,
        budget_min,
        budget_max,
        deadline
      )
    `,
    )
    .eq("freelancer_id", user.id)
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Minhas Propostas</h2>
          <p className="mt-2 text-gray-600">Acompanhe o status das suas propostas enviadas</p>
        </div>

        {!proposals || proposals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Nenhuma proposta enviada ainda</h3>
              <p className="mb-6 text-gray-600">Encontre projetos interessantes e envie suas propostas</p>
              <Link href="/projects">
                <Button>Buscar Projetos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <CardTitle className="text-xl">{proposal.project.title}</CardTitle>
                        <Badge
                          variant={
                            proposal.status === "pending"
                              ? "default"
                              : proposal.status === "accepted"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {proposal.status === "pending" && "Pendente"}
                          {proposal.status === "accepted" && "Aceita"}
                          {proposal.status === "rejected" && "Rejeitada"}
                          {proposal.status === "withdrawn" && "Retirada"}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm text-gray-500">
                        Código da Proposta: {proposal.code}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-2 text-gray-700">{proposal.cover_letter}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>R$ {proposal.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{proposal.delivery_days} dias</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>Projeto: {proposal.project.status}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/projects/${proposal.project.id}`}>
                      <Button variant="default">Ver Projeto</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
