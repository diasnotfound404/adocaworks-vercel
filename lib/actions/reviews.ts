// NEW FEATURE - Reviews Actions
"use server"

import { createServerClient } from "@/lib/supabase/server"
import { createAuditLog } from "./audit"
import { createNotification } from "./notifications"
import { revalidatePath } from "next/cache"
import type { Review } from "@/lib/types/reviews"

export async function createReview(formData: FormData) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  const projectId = formData.get("project_id") as string
  const revieweeId = formData.get("reviewee_id") as string
  const ratingCommunication = Number.parseInt(formData.get("rating_communication") as string)
  const ratingQuality = Number.parseInt(formData.get("rating_quality") as string)
  const ratingDeadline = Number.parseInt(formData.get("rating_deadline") as string)
  const comment = formData.get("comment") as string

  if (!projectId || !revieweeId) {
    return { error: "Dados inválidos" }
  }

  if (
    !ratingCommunication ||
    !ratingQuality ||
    !ratingDeadline ||
    ratingCommunication < 1 ||
    ratingCommunication > 5 ||
    ratingQuality < 1 ||
    ratingQuality > 5 ||
    ratingDeadline < 1 ||
    ratingDeadline > 5
  ) {
    return { error: "Avaliações devem ser entre 1 e 5 estrelas" }
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("project_id", projectId)
    .eq("reviewer_id", user.id)
    .eq("reviewee_id", revieweeId)
    .single()

  if (existingReview) {
    return { error: "Você já avaliou este usuário neste projeto" }
  }

  // Create review
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      project_id: projectId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating_communication: ratingCommunication,
      rating_quality: ratingQuality,
      rating_deadline: ratingDeadline,
      comment: comment || null,
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating review:", error)
    return { error: "Erro ao criar avaliação" }
  }

  // Get project title for notification
  const { data: project } = await supabase.from("projects").select("title").eq("id", projectId).single()

  // Create notification
  await createNotification({
    userId: revieweeId,
    type: "review_received",
    title: "Nova Avaliação Recebida",
    message: `Você recebeu uma avaliação no projeto "${project?.title || "Projeto"}"`,
    link: `/profile`,
    metadata: { review_id: review.id, project_id: projectId },
  })

  // Create audit log
  await createAuditLog({
    action: "create_review",
    entityType: "review",
    entityId: review.id,
    details: {
      project_id: projectId,
      reviewee_id: revieweeId,
      rating_overall: (ratingCommunication + ratingQuality + ratingDeadline) / 3,
    },
  })

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/profile`)
  return { success: true }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      reviewer:profiles!reviewer_id (
        id,
        full_name,
        avatar_url
      ),
      project:projects (
        id,
        title,
        code
      )
    `,
    )
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching reviews:", error)
    return []
  }

  return data || []
}

export async function canUserReview(projectId: string, reviewerId: string, revieweeId: string): Promise<boolean> {
  const supabase = await createServerClient()

  // Check if project is completed
  const { data: project } = await supabase.from("projects").select("status, client_id").eq("id", projectId).single()

  if (!project || project.status !== "completed") {
    return false
  }

  // Check if user is part of the project
  const isClient = project.client_id === reviewerId

  if (!isClient) {
    // Check if user is the freelancer
    const { data: proposal } = await supabase
      .from("proposals")
      .select("freelancer_id")
      .eq("project_id", projectId)
      .eq("status", "accepted")
      .single()

    if (!proposal || proposal.freelancer_id !== reviewerId) {
      return false
    }
  }

  // Check if review already exists
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("project_id", projectId)
    .eq("reviewer_id", reviewerId)
    .eq("reviewee_id", revieweeId)
    .single()

  return !existingReview
}
