// NEW FEATURE - AI Matching System
"use server"

import { createServerClient } from "@/lib/supabase/server"

interface FreelancerMatch {
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
  match_score: number
  match_reasons: string[]
}

export async function getRecommendedFreelancers(projectId: string): Promise<FreelancerMatch[]> {
  const supabase = await createServerClient()

  // Get project details
  const { data: project } = await supabase
    .from("projects")
    .select("*, categories(name), subcategories(name)")
    .eq("id", projectId)
    .single()

  if (!project) {
    return []
  }

  // Get all freelancers
  const { data: freelancers } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_type", "freelancer")
    .gte("rating", 3.0) // Only freelancers with good ratings

  if (!freelancers || freelancers.length === 0) {
    return []
  }

  // Calculate match scores
  const matches: FreelancerMatch[] = freelancers
    .map((freelancer) => {
      let score = 0
      const reasons: string[] = []

      // Rating score (0-30 points)
      const ratingScore = (freelancer.rating / 5) * 30
      score += ratingScore
      if (freelancer.rating >= 4.5) {
        reasons.push("Avaliação excelente")
      }

      // Experience score (0-25 points)
      const experienceScore = Math.min((freelancer.projects_completed / 20) * 25, 25)
      score += experienceScore
      if (freelancer.projects_completed >= 10) {
        reasons.push("Experiência comprovada")
      }

      // Level score (0-20 points)
      const levelScore = Math.min((freelancer.level / 10) * 20, 20)
      score += levelScore
      if (freelancer.level >= 7) {
        reasons.push("Nível avançado")
      }

      // Skills match (0-25 points)
      if (freelancer.skills && Array.isArray(freelancer.skills)) {
        const projectKeywords = [
          project.title.toLowerCase(),
          project.description.toLowerCase(),
          project.categories?.name.toLowerCase() || "",
          project.subcategories?.name.toLowerCase() || "",
        ].join(" ")

        const matchingSkills = freelancer.skills.filter((skill) => projectKeywords.includes(skill.toLowerCase()))

        if (matchingSkills.length > 0) {
          score += Math.min(matchingSkills.length * 8, 25)
          reasons.push(`Habilidades relevantes: ${matchingSkills.join(", ")}`)
        }
      }

      // Category match bonus (0-10 points)
      if (freelancer.bio && project.categories?.name) {
        if (freelancer.bio.toLowerCase().includes(project.categories.name.toLowerCase())) {
          score += 10
          reasons.push("Especialista na categoria")
        }
      }

      return {
        freelancer,
        match_score: Math.min(score, 100),
        match_reasons: reasons,
      }
    })
    .filter((match) => match.match_score >= 30) // Only show matches with at least 30% score
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 10) // Top 10 matches

  return matches
}

export async function getFeaturedProjects() {
  const supabase = await createServerClient()

  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      *,
      profiles:client_id (
        full_name,
        avatar_url,
        rating
      ),
      categories (
        name,
        color
      ),
      subcategories (
        name
      )
    `,
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(6)

  return projects || []
}

export async function getTopFreelancers() {
  const supabase = await createServerClient()

  const { data: freelancers } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_type", "freelancer")
    .gte("rating", 4.0)
    .gte("total_reviews", 3)
    .order("rating", { ascending: false })
    .order("total_reviews", { ascending: false })
    .limit(8)

  return freelancers || []
}

export async function getProjectStats() {
  const supabase = await createServerClient()

  const [{ count: totalProjects }, { count: activeProjects }, { count: totalFreelancers }] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("user_type", "freelancer"),
  ])

  return {
    totalProjects: totalProjects || 0,
    activeProjects: activeProjects || 0,
    totalFreelancers: totalFreelancers || 0,
  }
}
