import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProposalForm } from "@/components/proposal-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function ProposePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Get project details
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single()

  if (!project || project.status !== "open") {
    redirect("/projects")
  }

  // Check if user already submitted a proposal
  const { data: existingProposal } = await supabase
    .from("proposals")
    .select("id")
    .eq("project_id", id)
    .eq("freelancer_id", user.id)
    .single()

  if (existingProposal) {
    redirect(`/projects/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">FreelaClone</h1>
          </Link>
          <Link href={`/projects/${id}`}>
            <Button variant="ghost">Voltar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Enviar Proposta</h2>
          <p className="mt-2 text-gray-600">Apresente sua melhor proposta para este projeto</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProposalForm projectId={id} />
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre o Projeto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{project.title}</p>
                </div>
                <div>
                  <p className="text-gray-600">Orçamento</p>
                  <p className="font-medium">
                    R$ {project.budget_min?.toFixed(2)} - R$ {project.budget_max?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Categoria</p>
                  <Badge variant="outline">{project.category}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
