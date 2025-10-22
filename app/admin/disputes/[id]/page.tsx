import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ResolveDisputeForm } from "@/components/resolve-dispute-form"

export default async function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.user_type !== "admin") {
    redirect("/dashboard")
  }

  // Get dispute details
  const { data: dispute } = await supabase
    .from("disputes")
    .select(
      `
      *,
      project:projects (
        *,
        client:profiles!client_id (
          full_name,
          email
        ),
        selected_proposal:proposals!selected_proposal_id (
          freelancer:profiles!freelancer_id (
            full_name,
            email
          )
        )
      ),
      milestone:milestones (
        *
      ),
      raised_by_user:profiles!raised_by (
        full_name,
        email,
        user_type
      ),
      resolved_by_user:profiles!resolved_by (
        full_name
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!dispute) {
    redirect("/admin/disputes")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/admin">
            <h1 className="text-2xl font-bold text-gray-900">FreelaClone Admin</h1>
          </Link>
          <Link href="/admin/disputes">
            <Button variant="ghost">Voltar às Disputas</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold text-gray-900">Detalhes da Disputa</h2>
            <Badge
              variant={
                dispute.status === "open" ? "destructive" : dispute.status === "under_review" ? "secondary" : "outline"
              }
            >
              {dispute.status === "open" && "Aberta"}
              {dispute.status === "under_review" && "Em Análise"}
              {dispute.status === "resolved" && "Resolvida"}
              {dispute.status === "closed" && "Fechada"}
            </Badge>
          </div>
          <p className="mt-2 text-gray-600">Código: {dispute.code}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Dispute Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Disputa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium text-gray-900">Motivo</div>
                  <div className="text-gray-700">{dispute.reason}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Descrição</div>
                  <div className="whitespace-pre-wrap text-gray-700">{dispute.description}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Aberta por</div>
                  <div className="text-gray-700">
                    {dispute.raised_by_user.full_name} ({dispute.raised_by_user.email})
                    <Badge variant="outline" className="ml-2">
                      {dispute.raised_by_user.user_type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Data de Criação</div>
                  <div className="text-gray-700">{new Date(dispute.created_at).toLocaleString("pt-BR")}</div>
                </div>
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium text-gray-900">Título</div>
                  <div className="text-gray-700">{dispute.project.title}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Código</div>
                  <div className="text-gray-700">{dispute.project.code}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Cliente</div>
                  <div className="text-gray-700">
                    {dispute.project.client.full_name} ({dispute.project.client.email})
                  </div>
                </div>
                {dispute.project.selected_proposal && (
                  <div>
                    <div className="font-medium text-gray-900">Freelancer</div>
                    <div className="text-gray-700">
                      {dispute.project.selected_proposal.freelancer.full_name} (
                      {dispute.project.selected_proposal.freelancer.email})
                    </div>
                  </div>
                )}
                <div>
                  <Link href={`/projects/${dispute.project.id}`}>
                    <Button variant="outline">Ver Projeto Completo</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Milestone Information */}
            {dispute.milestone && (
              <Card>
                <CardHeader>
                  <CardTitle>Marco Relacionado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium text-gray-900">Título</div>
                    <div className="text-gray-700">{dispute.milestone.title}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Valor</div>
                    <div className="text-gray-700">R$ {Number(dispute.milestone.amount).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Status</div>
                    <Badge>{dispute.milestone.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resolution */}
            {dispute.resolution ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">Resolução</CardTitle>
                  <CardDescription className="text-green-700">
                    Resolvida por {dispute.resolved_by_user?.full_name} em{" "}
                    {new Date(dispute.resolved_at!).toLocaleString("pt-BR")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-green-800">{dispute.resolution}</div>
                </CardContent>
              </Card>
            ) : (
              <ResolveDisputeForm disputeId={dispute.id} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/projects/${dispute.project.id}`} className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ver Projeto
                  </Button>
                </Link>
                <Link href={`/projects/${dispute.project.id}/milestones`} className="block">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ver Marcos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
