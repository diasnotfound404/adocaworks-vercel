// NEW FEATURE - Review Page
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ReviewForm } from "@/components/review-form"
import { canUserReview } from "@/lib/actions/reviews"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ReviewPage({ params }: { params: { id: string } }) {
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
      client:profiles!client_id (
        id,
        full_name
      ),
      proposals!selected_proposal_id (
        freelancer:profiles!freelancer_id (
          id,
          full_name
        )
      )
    `,
    )
    .eq("id", params.id)
    .single()

  if (!project) {
    redirect("/projects")
  }

  const isClient = project.client_id === user.id
  const revieweeId = isClient ? project.proposals?.freelancer?.id : project.client.id
  const revieweeName = isClient ? project.proposals?.freelancer?.full_name : project.client.full_name

  if (!revieweeId) {
    redirect(`/projects/${params.id}`)
  }

  const canReview = await canUserReview(params.id, user.id, revieweeId)

  if (!canReview) {
    redirect(`/projects/${params.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-gray-900">FreelaClone</h1>
          </Link>
          <Link href={`/projects/${params.id}`}>
            <Button variant="ghost">Voltar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Avaliar Projeto</h2>
          <p className="mt-2 text-gray-600">{project.title}</p>
        </div>

        <ReviewForm projectId={params.id} revieweeId={revieweeId} revieweeName={revieweeName || "Usuário"} />
      </main>
    </div>
  )
}
