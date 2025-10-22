import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader profile={profile} />

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Meu Perfil</h2>
          <p className="mt-2 text-gray-600">Gerencie suas informações pessoais e configurações</p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Suas informações básicas de perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input id="full_name" value={profile.full_name || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email || ""} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_type">Tipo de Usuário</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={profile.user_type === "client" ? "default" : "secondary"}>
                    {profile.user_type === "client" && "Cliente"}
                    {profile.user_type === "freelancer" && "Freelancer"}
                    {profile.user_type === "admin" && "Administrador"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="created_at">Membro desde</Label>
                <Input id="created_at" value={new Date(profile.created_at).toLocaleDateString("pt-BR")} disabled />
              </div>
            </CardContent>
          </Card>

          {/* KYC Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status de Verificação</CardTitle>
              <CardDescription>Status da sua verificação KYC</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Verificação KYC</p>
                  <p className="text-sm text-gray-600">
                    {profile.kyc_verified
                      ? "Sua conta está verificada"
                      : "Complete a verificação para desbloquear todas as funcionalidades"}
                  </p>
                </div>
                <Badge variant={profile.kyc_verified ? "default" : "secondary"}>
                  {profile.kyc_verified ? "Verificado" : "Pendente"}
                </Badge>
              </div>
              {!profile.kyc_verified && (
                <Button className="mt-4" variant="default">
                  Iniciar Verificação
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Balance (for freelancers) */}
          {profile.user_type === "freelancer" && (
            <Card>
              <CardHeader>
                <CardTitle>Saldo</CardTitle>
                <CardDescription>Seu saldo disponível para saque</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">R$ {profile.balance.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Disponível para saque</p>
                  </div>
                  <Button variant="default" disabled={profile.balance <= 0}>
                    Solicitar Saque
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações da Conta</CardTitle>
              <CardDescription>Gerencie sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full bg-transparent">
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700 bg-transparent">
                Desativar Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
