import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Briefcase, FileText, DollarSign } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const isClient = profile.user_type === "client"
  const isFreelancer = profile.user_type === "freelancer"
  const isAdmin = profile.user_type === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader profile={profile} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Bem-vindo, {profile.full_name || "Usuário"}!</h2>
          <p className="mt-2 text-gray-600">
            {isClient && "Gerencie seus projetos e encontre os melhores freelancers"}
            {isFreelancer && "Encontre projetos e envie suas propostas"}
            {isAdmin && "Painel administrativo do FreelaClone"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isClient && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                  <Briefcase className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-gray-600">projetos em andamento</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Propostas Recebidas</CardTitle>
                  <FileText className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-gray-600">aguardando análise</p>
                </CardContent>
              </Card>
            </>
          )}
          {isFreelancer && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Propostas Enviadas</CardTitle>
                  <FileText className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-gray-600">propostas ativas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                  <Briefcase className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-gray-600">em andamento</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {profile.balance.toFixed(2)}</div>
                  <p className="text-xs text-gray-600">disponível para saque</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Ações Rápidas</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isClient && (
              <>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <Link href="/projects/new">
                    <CardHeader>
                      <CardTitle className="text-lg">Criar Novo Projeto</CardTitle>
                      <CardDescription>Publique um projeto e receba propostas</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <Link href="/projects">
                    <CardHeader>
                      <CardTitle className="text-lg">Ver Meus Projetos</CardTitle>
                      <CardDescription>Gerencie seus projetos ativos</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </>
            )}
            {isFreelancer && (
              <>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <Link href="/projects">
                    <CardHeader>
                      <CardTitle className="text-lg">Buscar Projetos</CardTitle>
                      <CardDescription>Encontre projetos que combinam com você</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <Link href="/proposals">
                    <CardHeader>
                      <CardTitle className="text-lg">Minhas Propostas</CardTitle>
                      <CardDescription>Acompanhe suas propostas enviadas</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </>
            )}
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <Link href="/profile">
                <CardHeader>
                  <CardTitle className="text-lg">Editar Perfil</CardTitle>
                  <CardDescription>Atualize suas informações</CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>
        </div>

        {/* KYC Warning */}
        {!profile.kyc_verified && (
          <Card className="mt-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg text-yellow-900">Verificação Pendente</CardTitle>
              <CardDescription className="text-yellow-700">
                Complete a verificação KYC para desbloquear todas as funcionalidades da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/kyc">
                <Button variant="default">Iniciar Verificação</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
