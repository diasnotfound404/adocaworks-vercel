import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Shield, Zap, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">FreelaClone</h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Cadastrar</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h2 className="text-5xl font-bold text-gray-900">
            Conectando Talentos a <span className="text-blue-600">Oportunidades</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            A plataforma completa para freelancers e clientes. Pagamentos seguros, gestão de projetos e muito mais.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg">
                Começar Agora
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="lg" variant="outline" className="text-lg bg-transparent">
                Ver Projetos
              </Button>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <h3 className="mb-12 text-center text-3xl font-bold text-gray-900">Por que escolher o FreelaClone?</h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Pagamentos Seguros</CardTitle>
                <CardDescription>Sistema de escrow protege cliente e freelancer</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Briefcase className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Gestão de Projetos</CardTitle>
                <CardDescription>Acompanhe marcos e entregas em tempo real</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Rápido e Fácil</CardTitle>
                <CardDescription>Publique projetos e receba propostas em minutos</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="mb-2 h-10 w-10 text-blue-600" />
                <CardTitle>Suporte Dedicado</CardTitle>
                <CardDescription>Resolução de disputas e suporte 24/7</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-white">Pronto para começar?</CardTitle>
              <CardDescription className="text-lg text-blue-100">
                Junte-se a milhares de freelancers e clientes satisfeitos
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" variant="secondary" className="text-lg">
                  Criar Conta Grátis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-600">
          <p>&copy; 2025 FreelaClone. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
