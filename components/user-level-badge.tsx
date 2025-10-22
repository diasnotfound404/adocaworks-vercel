// NEW FEATURE - User Level Badge Component
"use client"

import { Badge } from "@/components/ui/badge"
import { Award, Crown, Star, Trophy } from "lucide-react"

interface UserLevelBadgeProps {
  level: number
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export function UserLevelBadge({ level, showLabel = true, size = "md" }: UserLevelBadgeProps) {
  const getLevelInfo = (level: number) => {
    if (level >= 10) {
      return {
        name: "Especialista",
        color: "#EF4444",
        icon: Crown,
      }
    }
    if (level >= 7) {
      return {
        name: "Mestre",
        color: "#F59E0B",
        icon: Star,
      }
    }
    if (level >= 4) {
      return {
        name: "Profissional",
        color: "#8B5CF6",
        icon: Trophy,
      }
    }
    return {
      name: "Iniciante",
      color: "#3B82F6",
      icon: Award,
    }
  }

  const info = getLevelInfo(level)
  const Icon = info.icon

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <Badge
      variant="outline"
      className="gap-1"
      style={{
        borderColor: info.color,
        color: info.color,
        backgroundColor: `${info.color}10`,
      }}
    >
      <Icon className={sizeClasses[size]} />
      {showLabel && (
        <span>
          Nível {level} - {info.name}
        </span>
      )}
      {!showLabel && <span>Nv. {level}</span>}
    </Badge>
  )
}
