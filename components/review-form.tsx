// NEW FEATURE - Review Form Component
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { createReview } from "@/lib/actions/reviews"

interface ReviewFormProps {
  projectId: string
  revieweeId: string
  revieweeName: string
}

export function ReviewForm({ projectId, revieweeId, revieweeName }: ReviewFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ratings, setRatings] = useState({
    communication: 0,
    quality: 0,
    deadline: 0,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (ratings.communication === 0 || ratings.quality === 0 || ratings.deadline === 0) {
      setError("Por favor, avalie todos os critérios")
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set("project_id", projectId)
    formData.set("reviewee_id", revieweeId)
    formData.set("rating_communication", ratings.communication.toString())
    formData.set("rating_quality", ratings.quality.toString())
    formData.set("rating_deadline", ratings.deadline.toString())

    try {
      const result = await createReview(formData)

      if (result.error) {
        setError(result.error)
        return
      }

      router.push(`/projects/${projectId}`)
      router.refresh()
    } catch (err) {
      setError("Erro ao enviar avaliação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number
    onChange: (value: number) => void
    label: string
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star className={`h-8 w-8 ${star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliar {revieweeName}</CardTitle>
        <CardDescription>Compartilhe sua experiência trabalhando neste projeto</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <StarRating
            value={ratings.communication}
            onChange={(value) => setRatings({ ...ratings, communication: value })}
            label="Comunicação"
          />

          <StarRating
            value={ratings.quality}
            onChange={(value) => setRatings({ ...ratings, quality: value })}
            label="Qualidade do Trabalho"
          />

          <StarRating
            value={ratings.deadline}
            onChange={(value) => setRatings({ ...ratings, deadline: value })}
            label="Cumprimento de Prazo"
          />

          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea id="comment" name="comment" placeholder="Conte mais sobre sua experiência..." rows={4} />
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Enviando..." : "Enviar Avaliação"}
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
