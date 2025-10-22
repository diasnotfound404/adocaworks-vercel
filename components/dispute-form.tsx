"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDispute } from "@/lib/actions/disputes"

const disputeReasons = [
  "Trabalho não entregue",
  "Qualidade insatisfatória",
  "Atraso na entrega",
  "Pagamento não liberado",
  "Comunicação inadequada",
  "Mudança de escopo",
  "Outro",
]

export function DisputeForm({ projectId, milestones }: { projectId: string; milestones: any[] }) {
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
      const result = await createDispute(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch (err) {
      setError("Erro ao criar disputa. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes da Disputa</CardTitle>
        <CardDescription>Forneça informações detalhadas sobre o problema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo *</Label>
            <Select name="reason" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {disputeReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {milestones.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="milestone_id">Marco Relacionado (opcional)</Label>
              <Select name="milestone_id">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um marco" />
                </SelectTrigger>
                <SelectContent>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.title} - R$ {Number(milestone.amount).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva o problema em detalhes, incluindo datas, valores e qualquer informação relevante..."
              rows={8}
              required
            />
          </div>

          <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
            <strong>Atenção:</strong> Ao abrir uma disputa, o projeto será marcado como "Em Disputa" e um administrador
            irá analisar o caso. Certifique-se de fornecer todas as informações necessárias.
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Criando..." : "Abrir Disputa"}
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
