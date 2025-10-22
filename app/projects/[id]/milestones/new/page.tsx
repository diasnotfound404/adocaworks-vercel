import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MilestoneForm } from "@/components/milestone-form"

export default async function NewMilestonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: project } = await supabase.from("projects").select("*, milestones(*)").eq("id", id).single()

  if (!project || project.client_id !== user.id) {
    redirect("/projects")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">FreelaClone</h1>
          </Link>
          <Link href={`/projects/${id}/milestones`}>
            <Button variant="ghost">Voltar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Criar Novo Marco</h2>
          <p className="mt-2 text-gray-600">Defina um marco de pagamento para o projeto</p>
        </div>

        <MilestoneForm projectId={id} nextOrderIndex={(project.milestones?.length || 0) + 1} />
      </main>
    </div>
  )
}
