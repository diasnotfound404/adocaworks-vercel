"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createProject } from "@/lib/actions/projects"
import { CategorySelect } from "@/components/category-select"
import type { Category, Subcategory } from "@/lib/types/categories"

// NEW FEATURE - Added categories and subcategories props
interface ProjectFormProps {
  categories: Category[]
  subcategories: Subcategory[]
}

export function ProjectForm({ categories, subcategories }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // NEW FEATURE - State for category selection
  const [categoryId, setCategoryId] = useState<string>("")
  const [subcategoryId, setSubcategoryId] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    // NEW FEATURE - Add category and subcategory to form data
    if (categoryId) formData.set("category_id", categoryId)
    if (subcategoryId) formData.set("subcategory_id", subcategoryId)

    try {
      const result = await createProject(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push(`/projects/${result.projectId}`)
      router.refresh()
    } catch (err) {
      setError("Erro ao criar projeto. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Projeto</CardTitle>
        <CardDescription>Forneça informações claras para atrair os melhores freelancers</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Projeto *</Label>
            <Input id="title" name="title" placeholder="Ex: Desenvolvimento de site institucional" required />
          </div>

          {/* NEW FEATURE - Category selection component */}
          <CategorySelect
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            onCategoryChange={setCategoryId}
            onSubcategoryChange={setSubcategoryId}
            categories={categories}
            subcategories={subcategories}
          />

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva detalhadamente o que você precisa..."
              rows={6}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Orçamento Mínimo (R$) *</Label>
              <Input
                id="budget_min"
                name="budget_min"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget_max">Orçamento Máximo (R$) *</Label>
              <Input
                id="budget_max"
                name="budget_max"
                type="number"
                step="0.01"
                min="0"
                placeholder="2000.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Prazo de Entrega</Label>
            <Input id="deadline" name="deadline" type="date" />
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Criando..." : "Criar Projeto"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
