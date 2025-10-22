// NEW FEATURE - Reviews List Component
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import type { Review } from "@/lib/types/reviews"

interface ReviewsListProps {
  reviews: Review[]
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">Nenhuma avaliação ainda</CardContent>
      </Card>
    )
  }

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.reviewer?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{review.reviewer?.full_name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{review.reviewer?.full_name || "Usuário"}</p>
                  <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{review.rating_overall.toFixed(1)}</span>
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="mb-1 text-gray-600">Comunicação</p>
                <StarDisplay rating={review.rating_communication} />
              </div>
              <div>
                <p className="mb-1 text-gray-600">Qualidade</p>
                <StarDisplay rating={review.rating_quality} />
              </div>
              <div>
                <p className="mb-1 text-gray-600">Prazo</p>
                <StarDisplay rating={review.rating_deadline} />
              </div>
            </div>
            {review.comment && <p className="text-gray-700">{review.comment}</p>}
            {review.project && (
              <p className="text-sm text-gray-500">
                Projeto: {review.project.title} ({review.project.code})
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
