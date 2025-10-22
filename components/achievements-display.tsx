// NEW FEATURE - Achievements Display Component
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Crown, Sparkles, Star, Trophy, Zap, Lock } from "lucide-react"
import type { Achievement, UserAchievement } from "@/lib/types/gamification"

const iconMap: Record<string, any> = {
  Award,
  Trophy,
  Crown,
  Star,
  Sparkles,
  Zap,
}

interface AchievementsDisplayProps {
  userAchievements: UserAchievement[]
  allAchievements: Achievement[]
}

export function AchievementsDisplay({ userAchievements, allAchievements }: AchievementsDisplayProps) {
  const earnedIds = new Set(userAchievements.map((ua) => ua.achievement_id))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {allAchievements.map((achievement) => {
        const isEarned = earnedIds.has(achievement.id)
        const IconComponent = iconMap[achievement.icon || "Award"] || Award
        const earnedDate = userAchievements.find((ua) => ua.achievement_id === achievement.id)?.earned_at

        return (
          <Card
            key={achievement.id}
            className={`transition-all ${isEarned ? "border-2" : "opacity-60"}`}
            style={isEarned ? { borderColor: achievement.badge_color } : {}}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isEarned ? `${achievement.badge_color}20` : "#f3f4f6",
                  }}
                >
                  {isEarned ? (
                    <IconComponent className="h-6 w-6" style={{ color: achievement.badge_color }} />
                  ) : (
                    <Lock className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{achievement.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    +{achievement.points} XP
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{achievement.description}</CardDescription>
              {isEarned && earnedDate && (
                <p className="mt-2 text-xs text-gray-500">
                  Conquistado em {new Date(earnedDate).toLocaleDateString("pt-BR")}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
