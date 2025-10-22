import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, Users, Star, TrendingUp, Award, DollarSign } from "lucide-react"
import { getFeaturedProjects, getTopFreelancers, getProjectStats } from "@/lib/actions/matching"
import { UserLevelBadge } from "@/components/user-level-badge"

export default async function HomePage() {
  // NEW FEATURE - Fetch featured content
  const [featuredProjects, topFreelancers, stats] = await Promise.all([
    getFeaturedProjects(),
    getTopFreelancers(),
    getProjectStats(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">aDocaWorks</h1>
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
            O jeito <span className="text-blue-600">justo e moderno</span> de contratar
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            Plataforma profissional para freelancers e contratantes. Pagamentos seguros, cashback, gamificação e muito
            mais.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg">
                Publicar Projeto Grátis
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="bg-transparent text-lg">
                Explorar Categorias
              </Button>
            </Link>
          </div>

          {/* NEW FEATURE - Stats */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-4xl font-bold text-blue-600">{stats.totalProjects}+</p>
              <p className="mt-2 text-gray-600">Projetos Publicados</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-4xl font-bold text-green-600">{stats.totalFreelancers}+</p>
              <p className="mt-2 text-gray-600">Freelancers Ativos</p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-4xl font-bold text-purple-600">{stats.activeProjects}</p>
              <p className="mt-2 text-gray-600">Projetos Abertos</p>
            </div>
          </div>
        </section>

        {/* NEW FEATURE - Featured Projects */}
        {featuredProjects.length > 0 && (
          <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-12 flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Projetos em Destaque</h3>
                  <p className="mt-2 text-gray-600">Oportunidades recentes para freelancers</p>
                </div>
                <Link href="/projects">
                  <Button variant="outline">Ver Todos</Button>
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredProjects.slice(0, 6).map((project) => (
                  <Card key={project.id} className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-2 flex items-center gap-2">
                        <CardTitle className="line-clamp-1 text-lg">{project.title}</CardTitle>
                      </div>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600">
                          R$ {project.budget_min?.toFixed(0)} - R$ {project.budget_max?.toFixed(0)}
                        </span>
                      </div>
                      {project.categories && (
                        <Badge variant="outline" style={{ borderColor: project.categories.color }}>
                          {project.categories.name}
                        </Badge>
                      )}
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* NEW FEATURE - Top Freelancers */}
        {topFreelancers.length > 0 && (
          <section className="bg-gray-50 py-20">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-12 text-center">
                <h3 className="text-3xl font-bold text-gray-900">Freelancers Melhor Avaliados</h3>
                <p className="mt-2 text-gray-600">Profissionais de confiança com excelente histórico</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {topFreelancers.slice(0, 8).map((freelancer) => (
                  <Card key={freelancer.id} className="text-center transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="flex flex-col items-center">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={freelancer.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{freelancer.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <h4 className="mt-3 font-semibold">{freelancer.full_name}</h4>
                        <div className="mt-2 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{freelancer.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({freelancer.total_reviews})</span>
                        </div>
                        <div className="mt-2">
                          <UserLevelBadge level={freelancer.level} size="sm" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{freelancer.projects_completed} projetos concluídos</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <h3 className="mb-12 text-center text-3xl font-bold text-gray-900">Por que escolher o aDocaWorks?</h3>
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
                <Award className="mb-2 h-10 w-10 text-purple-600" />
                <CardTitle>Gamificação</CardTitle>
                <CardDescription>Níveis, conquistas e recompensas por desempenho</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="mb-2 h-10 w-10 text-green-600" />
                <CardTitle>Cashback 2%</CardTitle>
                <CardDescription>Ganhe créditos em cada pagamento realizado</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="mb-2 h-10 w-10 text-orange-600" />
                <CardTitle>IA de Matching</CardTitle>
                <CardDescription>Recomendações inteligentes de freelancers</CardDescription>
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
                Junte-se a milhares de freelancers e clientes satisfeitos. Taxa transparente de apenas 7%.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button size="lg" variant="secondary" className="text-lg">
                  Criar Conta Grátis
                </Button>
              </Link>
              <Link href="/categories">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white bg-transparent text-lg text-white hover:bg-white/10"
                >
                  Ver Categorias
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-600">
          <p>&copy; 2025 aDocaWorks. Todos os direitos reservados. Taxa fixa de 7% - Transparente e justo.</p>
        </div>
      </footer>
    </div>
  )
}
