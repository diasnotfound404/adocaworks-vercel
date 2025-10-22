// NEW FEATURE - Freelancer Match Card Component
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Award } from "lucide-react"
import { UserLevelBadge } from "./user-level-badge"

interface FreelancerMatchCardProps {
  freelancer: {
    id: string
    full_name: string
    avatar_url?: string
    rating: number
    total_reviews: number
    skills: string[]
    bio?: string
    projects_completed: number
    level: number
  }
  matchScore: number
  matchReasons: string[]
}

export function FreelancerMatchCard({ freelancer, matchScore, matchReasons }: FreelancerMatchCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={freelancer.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{freelancer.full_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{freelancer.full_name}</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">
                    {freelancer.rating.toFixed(1)} ({freelancer.total_reviews})
                  </span>
                </div>
                <UserLevelBadge level={freelancer.level} showLabel={false} size="sm" />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-lg font-bold text-green-600">{matchScore}%</span>
            </div>
            <p className="text-xs text-gray-500">Compatibilidade</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {freelancer.bio && <p className="line-clamp-2 text-sm text-gray-600">{freelancer.bio}</p>}

        {matchReasons.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Por que recomendamos:</p>
            <div className="flex flex-wrap gap-1">
              {matchReasons.map((reason, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{freelancer.projects_completed} projetos concluídos</span>
        </div>
      </CardContent>
    </Card>
  )
}
