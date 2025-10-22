"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createProject } from "@/lib/actions/projects"

const categories = [
  "Desenvolvimento Web",
  "Desenvolvimento Mobile",
  "Design Gráfico",
  "Marketing Digital",
  "Redação e Tradução",
  "Vídeo e Animação",
  "Consultoria",
  "Outros",
]

export function ProjectForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

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

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select name="category" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
