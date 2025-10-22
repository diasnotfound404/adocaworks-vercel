import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, DollarSign, Briefcase, Filter } from "lucide-react"
import { AppHeader } from "@/components/app-header"

// NEW FEATURE - Add searchParams for filtering
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { category?: string; subcategory?: string }
}) {
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

  const isClient = profile.user_type === "client"

  // Get projects based on user type
  let projectsQuery = supabase
    .from("projects")
    .select(
      `
      *,
      profiles:client_id (
        full_name,
        avatar_url
      ),
      categories (
        id,
        name,
        color
      ),
      subcategories (
        id,
        name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (isClient) {
    // Clients see only their own projects
    projectsQuery = projectsQuery.eq("client_id", user.id)
  } else {
    // Freelancers see only open projects
    projectsQuery = projectsQuery.eq("status", "open")
  }

  // NEW FEATURE - Apply category filters
  if (searchParams.category) {
    projectsQuery = projectsQuery.eq("category_id", searchParams.category)
  }
  if (searchParams.subcategory) {
    projectsQuery = projectsQuery.eq("subcategory_id", searchParams.subcategory)
  }

  const { data: projects } = await projectsQuery

  // NEW FEATURE - Fetch categories for filter display
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{isClient ? "Meus Projetos" : "Projetos Disponíveis"}</h2>
            <p className="mt-2 text-gray-600">
              {isClient ? "Gerencie seus projetos e propostas" : "Encontre projetos que combinam com você"}
            </p>
          </div>
          <div className="flex gap-2">
            {/* NEW FEATURE - Link to categories page */}
            {!isClient && (
              <Link href="/categories">
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Categorias
                </Button>
              </Link>
            )}
            {isClient && (
              <Link href="/projects/new">
                <Button>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Criar Projeto
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* NEW FEATURE - Active filters display */}
        {(searchParams.category || searchParams.subcategory) && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-gray-600">Filtros ativos:</span>
            {searchParams.category && (
              <Badge variant="secondary">
                {categories?.find((c) => c.id === searchParams.category)?.name || "Categoria"}
              </Badge>
            )}
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                Limpar filtros
              </Button>
            </Link>
          </div>
        )}

        {/* Projects List */}
        {!projects || projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Briefcase className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {isClient ? "Nenhum projeto criado ainda" : "Nenhum projeto disponível"}
              </h3>
              <p className="mb-6 text-gray-600">
                {isClient ? "Crie seu primeiro projeto para começar" : "Volte mais tarde para ver novos projetos"}
              </p>
              {isClient && (
                <Link href="/projects/new">
                  <Button>Criar Primeiro Projeto</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
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
                      <CardDescription className="text-sm text-gray-500">Código: {project.code}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-2 text-gray-700">{project.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        R$ {project.budget_min?.toFixed(2)} - R$ {project.budget_max?.toFixed(2)}
                      </span>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Prazo: {new Date(project.deadline).toLocaleDateString("pt-BR")}</span>
                      </div>
                    )}
                    {/* NEW FEATURE - Display category badge with color */}
                    {project.categories && (
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: project.categories.color,
                          color: project.categories.color,
                        }}
                      >
                        {project.categories.name}
                      </Badge>
                    )}
                    {/* NEW FEATURE - Display subcategory if exists */}
                    {project.subcategories && <Badge variant="secondary">{project.subcategories.name}</Badge>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="default">Ver Detalhes</Button>
                    </Link>
                    {!isClient && project.status === "open" && (
                      <Link href={`/projects/${project.id}/propose`}>
                        <Button variant="outline">Enviar Proposta</Button>
                      </Link>
                    )}
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
