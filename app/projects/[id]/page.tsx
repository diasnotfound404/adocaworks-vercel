import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { Calendar, DollarSign, User, Star } from "lucide-react"
import { getProjectWithProposals } from "@/lib/actions/projects"
import { AcceptProposalButton } from "@/components/accept-proposal-button"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const project = await getProjectWithProposals(id)

  if (!project) {
    redirect("/projects")
  }

  const isOwner = project.client_id === user.id
  const isFreelancer = profile.user_type === "freelancer"

  // Check if user already submitted a proposal
  const userProposal = isFreelancer ? project.proposals?.find((p: any) => p.freelancer_id === user.id) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">FreelaClone</h1>
          </Link>
          <Link href="/projects">
            <Button variant="ghost">Voltar aos Projetos</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <CardTitle className="text-2xl">{project.title}</CardTitle>
                      <Badge
                        variant={
                          project.status === "open"
                            ? "default"
                            : project.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {project.status === "open" && "Aberto"}
                        {project.status === "in_progress" && "Em Andamento"}
                        {project.status === "completed" && "Concluído"}
                        {project.status === "cancelled" && "Cancelado"}
                        {project.status === "disputed" && "Em Disputa"}
                      </Badge>
                    </div>
                    <CardDescription>Código: {project.code}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">Descrição</h3>
                  <p className="whitespace-pre-wrap text-gray-700">{project.description}</p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      R$ {project.budget_min?.toFixed(2)} - R$ {project.budget_max?.toFixed(2)}
                    </span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Prazo: {new Date(project.deadline).toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                  <Badge variant="outline">{project.category}</Badge>
                </div>

                {isFreelancer && project.status === "open" && !userProposal && (
                  <div className="pt-4">
                    <Link href={`/projects/${project.id}/propose`}>
                      <Button size="lg" className="w-full">
                        Enviar Proposta
                      </Button>
                    </Link>
                  </div>
                )}

                {userProposal && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-900">Você já enviou uma proposta para este projeto</p>
                    <p className="mt-1 text-sm text-blue-700">Status: {userProposal.status}</p>
                  </div>
                )}

                {(isOwner || (isFreelancer && project.status === "in_progress")) && project.status !== "disputed" && (
                  <div className="pt-4 border-t">
                    <Link href={`/projects/${project.id}/dispute`}>
                      <Button variant="destructive" size="sm">
                        Abrir Disputa
                      </Button>
                    </Link>
                  </div>
                )}

                {project.status === "disputed" && (
                  <div className="rounded-lg bg-yellow-50 p-4">
                    <p className="text-sm font-medium text-yellow-900">
                      Este projeto está em disputa e sendo analisado por um administrador
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proposals Section (only for project owner) */}
            {isOwner && project.proposals && project.proposals.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Propostas Recebidas ({project.proposals.length})</CardTitle>
                  <CardDescription>Analise as propostas e escolha o melhor freelancer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.proposals.map((proposal: any) => (
                    <Card key={proposal.id} className={proposal.status === "accepted" ? "border-green-500" : ""}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <Avatar>
                              <AvatarFallback>
                                {proposal.freelancer.full_name?.charAt(0).toUpperCase() || "F"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <h4 className="font-semibold">{proposal.freelancer.full_name}</h4>
                                <Badge variant="outline">{proposal.status}</Badge>
                              </div>
                              <div className="mb-2 flex items-center gap-1 text-sm text-gray-600">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>
                                  {proposal.freelancer.rating.toFixed(1)} ({proposal.freelancer.total_reviews}{" "}
                                  avaliações)
                                </span>
                              </div>
                              {proposal.freelancer.skills && proposal.freelancer.skills.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-1">
                                  {proposal.freelancer.skills.slice(0, 5).map((skill: string) => (
                                    <Badge key={skill} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <p className="mb-3 text-sm text-gray-700">{proposal.cover_letter}</p>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>R$ {proposal.amount.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{proposal.delivery_days} dias</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {proposal.status === "pending" && project.status === "open" && (
                            <AcceptProposalButton proposalId={proposal.id} projectId={project.id} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{project.client.full_name || "Cliente"}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{project.client.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Publicado em</p>
                  <p className="font-medium">{new Date(project.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-gray-600">Propostas</p>
                  <p className="font-medium">{project.proposals?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Categoria</p>
                  <p className="font-medium">{project.category}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
