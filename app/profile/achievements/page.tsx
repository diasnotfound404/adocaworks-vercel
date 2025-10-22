// NEW FEATURE - Achievements Page
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { getUserAchievements, getAllAchievements, getUserLevel } from "@/lib/actions/gamification"
import { AchievementsDisplay } from "@/components/achievements-display"
import { LevelProgressBar } from "@/components/level-progress-bar"

export default async function AchievementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const [userAchievements, allAchievements, userLevel] = await Promise.all([
    getUserAchievements(user.id),
    getAllAchievements(),
    getUserLevel(user.id),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Conquistas e Progresso</h1>
          <p className="mt-2 text-gray-600">Acompanhe seu progresso e desbloqueie conquistas especiais</p>
        </div>

        {userLevel && (
          <div className="mb-8">
            <LevelProgressBar userLevel={userLevel} />
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Conquistas ({userAchievements.length}/{allAchievements.length})
          </h2>
          <p className="text-gray-600">Complete desafios para ganhar experiência e subir de nível</p>
        </div>

        <AchievementsDisplay userAchievements={userAchievements} allAchievements={allAchievements} />
      </main>
    </div>
  )
}
