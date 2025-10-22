import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DisputeForm } from "@/components/dispute-form"

export default async function CreateDisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

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

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Abrir Disputa</h2>
          <p className="mt-2 text-gray-600">Descreva o problema que você está enfrentando com este projeto</p>
        </div>

        <DisputeForm projectId={id} milestones={project.milestones || []} />
      </main>
    </div>
  )
}
