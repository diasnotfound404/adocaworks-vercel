"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { resolveDispute } from "@/lib/actions/disputes"

export function ResolveDisputeForm({ disputeId }: { disputeId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("dispute_id", disputeId)

    try {
      const result = await resolveDispute(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      router.refresh()
    } catch (err) {
      setError("Erro ao resolver disputa. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resolver Disputa</CardTitle>
        <CardDescription>Forneça uma resolução detalhada para esta disputa</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="resolution">Resolução *</Label>
            <Textarea
              id="resolution"
              name="resolution"
              placeholder="Descreva a resolução da disputa e as ações tomadas..."
              rows={6}
              required
            />
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Resolvendo..." : "Resolver Disputa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
