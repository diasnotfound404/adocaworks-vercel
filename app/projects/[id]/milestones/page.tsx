import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DollarSign, Calendar, CheckCircle, Clock } from "lucide-react"
import { MilestoneActions } from "@/components/milestone-actions"

export default async function MilestonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Get project with milestones
  const { data: project } = await supabase
    .from("projects")
    .select(
      `
      *,
      milestones (*),
      selected_proposal:proposals!selected_proposal_id (
        freelancer_id
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!project) {
    redirect("/projects")
  }

  const isClient = project.client_id === user.id
  const isFreelancer = project.selected_proposal?.freelancer_id === user.id

  if (!isClient && !isFreelancer) {
    redirect("/projects")
  }

  const milestones = project.milestones || []
  const totalAmount = milestones.reduce((sum: number, m: any) => sum + Number(m.amount), 0)
  const paidAmount = milestones
    .filter((m: any) => m.status === "paid")
    .reduce((sum: number, m: any) => sum + Number(m.amount), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">FreelaClone</h1>
          </Link>
          <Link href={`/projects/${id}`}>
            <Button variant="ghost">Voltar ao Projeto</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Marcos do Projeto</h2>
          <p className="mt-2 text-gray-600">{project.title}</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pago</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {paidAmount.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(totalAmount - paidAmount).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones List */}
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Clock className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Nenhum marco definido ainda</h3>
              <p className="mb-6 text-gray-600">
                {isClient
                  ? "Crie marcos para dividir o pagamento do projeto"
                  : "Aguarde o cliente criar os marcos do projeto"}
              </p>
              {isClient && (
                <Link href={`/projects/${id}/milestones/new`}>
                  <Button>Criar Primeiro Marco</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {isClient && (
              <div className="mb-4 flex justify-end">
                <Link href={`/projects/${id}/milestones/new`}>
                  <Button>Adicionar Marco</Button>
                </Link>
              </div>
            )}

            {milestones
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((milestone: any) => (
                <Card key={milestone.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <CardTitle className="text-xl">{milestone.title}</CardTitle>
                          <Badge
                            variant={
                              milestone.status === "paid"
                                ? "default"
                                : milestone.status === "completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {milestone.status === "pending" && "Pendente"}
                            {milestone.status === "in_progress" && "Em Andamento"}
                            {milestone.status === "completed" && "Concluído"}
                            {milestone.status === "paid" && "Pago"}
                          </Badge>
                        </div>
                        <CardDescription>Código: {milestone.code}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {milestone.description && <p className="mb-4 text-gray-700">{milestone.description}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>R$ {Number(milestone.amount).toFixed(2)}</span>
                      </div>
                      {milestone.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Prazo: {new Date(milestone.due_date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}
                      {milestone.completed_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Concluído em: {new Date(milestone.completed_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}
                      {milestone.paid_at && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Pago em: {new Date(milestone.paid_at).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}
                    </div>
                    <MilestoneActions
                      milestone={milestone}
                      projectId={id}
                      isClient={isClient}
                      isFreelancer={isFreelancer}
                    />
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
