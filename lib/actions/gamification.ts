// NEW FEATURE - Gamification Actions
"use server"

import { createServerClient } from "@/lib/supabase/server"
import type { Achievement, UserAchievement, UserLevel } from "@/lib/types/gamification"

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("user_achievements")
    .select(`
      *,
      achievement:achievements (*)
    `)
    .eq("user_id", userId)
    .order("earned_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching user achievements:", error)
    return []
  }

  return data || []
}

export async function getAllAchievements(): Promise<Achievement[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("achievements").select("*").order("requirement_value")

  if (error) {
    console.error("[v0] Error fetching achievements:", error)
    return []
  }

  return data || []
}

export async function getUserLevel(userId: string): Promise<UserLevel | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("level, experience_points, projects_completed")
    .eq("id", userId)
    .single()

  if (error || !data) {
    console.error("[v0] Error fetching user level:", error)
    return null
  }

  // Calculate XP needed for next level
  // Formula: next_level_xp = (level^2) * 100
  const nextLevelXp = Math.pow(data.level, 2) * 100
  const currentLevelXp = Math.pow(data.level - 1, 2) * 100
  const xpInCurrentLevel = data.experience_points - currentLevelXp
  const xpNeededForLevel = nextLevelXp - currentLevelXp
  const progressPercentage = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100)

  return {
    level: data.level,
    experience_points: data.experience_points,
    projects_completed: data.projects_completed,
    next_level_xp: nextLevelXp,
    progress_percentage: progressPercentage,
  }
}

export async function getLevelName(level: number): Promise<string> {
  if (level >= 10) return "Especialista"
  if (level >= 7) return "Mestre"
  if (level >= 4) return "Profissional"
  return "Iniciante"
}
