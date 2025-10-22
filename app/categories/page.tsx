// NEW FEATURE - Categories Browse Page
import { getCategoriesWithSubcategories } from "@/lib/actions/categories"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppHeader } from "@/components/app-header"
import Link from "next/link"
import { Code, FileText, Palette, TrendingUp } from "lucide-react"

const iconMap: Record<string, any> = {
  Palette,
  Code,
  FileText,
  TrendingUp,
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithSubcategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Categorias de Projetos</h1>
          <p className="mt-2 text-gray-600">
            Explore projetos por categoria ou encontre o freelancer ideal para sua necessidade
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || "Code"] || Code

            return (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent className="h-6 w-6" style={{ color: category.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Subcategorias:</p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/projects?category=${category.id}&subcategory=${sub.id}`}
                          className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/projects?category=${category.id}`}
                      className="mt-4 inline-block text-sm font-medium hover:underline"
                      style={{ color: category.color }}
                    >
                      Ver todos os projetos →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
