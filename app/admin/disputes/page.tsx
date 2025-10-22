import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default async function AdminDisputesPage() {
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

  // Get all disputes
  const { data: disputes } = await supabase
    .from("disputes")
    .select(
      `
      *,
      project:projects (
        id,
        title,
        code
      ),
      raised_by_user:profiles!raised_by (
        full_name,
        email
      )
    `,
    )
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/admin">
            <h1 className="text-2xl font-bold text-gray-900">FreelaClone Admin</h1>
          </Link>
          <Link href="/admin">
            <Button variant="ghost">Voltar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Gerenciar Disputas</h2>
          <p className="mt-2 text-gray-600">Resolva conflitos entre clientes e freelancers</p>
        </div>

        {!disputes || disputes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Nenhuma disputa registrada</h3>
              <p className="text-gray-600">As disputas aparecerão aqui quando forem criadas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {disputes.map((dispute) => (
              <Card key={dispute.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <CardTitle className="text-xl">Disputa: {dispute.project.title}</CardTitle>
                        <Badge
                          variant={
                            dispute.status === "open"
                              ? "destructive"
                              : dispute.status === "under_review"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {dispute.status === "open" && "Aberta"}
                          {dispute.status === "under_review" && "Em Análise"}
                          {dispute.status === "resolved" && "Resolvida"}
                          {dispute.status === "closed" && "Fechada"}
                        </Badge>
                      </div>
                      <CardDescription>Código: {dispute.code}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2">
                    <div>
                      <span className="font-medium">Motivo:</span> {dispute.reason}
                    </div>
                    <div>
                      <span className="font-medium">Descrição:</span> {dispute.description}
                    </div>
                    <div>
                      <span className="font-medium">Aberta por:</span> {dispute.raised_by_user.full_name} (
                      {dispute.raised_by_user.email})
                    </div>
                    <div>
                      <span className="font-medium">Projeto:</span> {dispute.project.title} ({dispute.project.code})
                    </div>
                    <div className="text-sm text-gray-500">
                      Criada em: {new Date(dispute.created_at).toLocaleString("pt-BR")}
                    </div>
                  </div>

                  {dispute.resolution && (
                    <div className="mb-4 rounded-lg bg-green-50 p-4">
                      <div className="font-medium text-green-900">Resolução:</div>
                      <div className="text-sm text-green-800">{dispute.resolution}</div>
                      {dispute.resolved_at && (
                        <div className="mt-1 text-xs text-green-700">
                          Resolvida em: {new Date(dispute.resolved_at).toLocaleString("pt-BR")}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/admin/disputes/${dispute.id}`}>
                      <Button>Ver Detalhes</Button>
                    </Link>
                    <Link href={`/projects/${dispute.project.id}`}>
                      <Button variant="outline">Ver Projeto</Button>
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
