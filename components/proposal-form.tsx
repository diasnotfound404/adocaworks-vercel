"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createProposal } from "@/lib/actions/proposals"

export function ProposalForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("project_id", projectId)

    try {
      const result = await createProposal(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch (err) {
      setError("Erro ao enviar proposta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sua Proposta</CardTitle>
        <CardDescription>Destaque suas habilidades e experiência relevante</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor da Proposta (R$) *</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="1500.00" required />
            <p className="text-xs text-gray-500">Informe o valor total que você cobrará pelo projeto</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_days">Prazo de Entrega (dias) *</Label>
            <Input id="delivery_days" name="delivery_days" type="number" min="1" placeholder="15" required />
            <p className="text-xs text-gray-500">Quantos dias você precisa para concluir o projeto?</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter">Carta de Apresentação *</Label>
            <Textarea
              id="cover_letter"
              name="cover_letter"
              placeholder="Explique por que você é o melhor candidato para este projeto..."
              rows={8}
              required
            />
            <p className="text-xs text-gray-500">
              Descreva sua experiência relevante, abordagem e por que você deve ser escolhido
            </p>
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Enviando..." : "Enviar Proposta"}
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
