// NEW FEATURE - Level Progress Bar Component
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserLevelBadge } from "./user-level-badge"
import type { UserLevel } from "@/lib/types/gamification"

interface LevelProgressBarProps {
  userLevel: UserLevel
}

export function LevelProgressBar({ userLevel }: LevelProgressBarProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Seu Progresso</CardTitle>
            <CardDescription>Continue completando projetos para subir de nível</CardDescription>
          </div>
          <UserLevelBadge level={userLevel.level} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">Experiência</span>
            <span className="font-medium">
              {userLevel.experience_points} / {userLevel.next_level_xp} XP
            </span>
          </div>
          <Progress value={userLevel.progress_percentage} className="h-3" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-2xl font-bold text-blue-600">{userLevel.projects_completed}</p>
            <p className="text-sm text-gray-600">Projetos Concluídos</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <p className="text-2xl font-bold text-purple-600">{userLevel.level}</p>
            <p className="text-sm text-gray-600">Nível Atual</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
