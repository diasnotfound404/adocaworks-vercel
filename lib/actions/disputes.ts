"use server"

import { createClient } from "@/lib/supabase/server"
import { generateUniqueCode } from "@/lib/utils/generate-code"
import { createAuditLog } from "./audit"
import { createNotification } from "./notifications"
import { revalidatePath } from "next/cache"

export async function createDispute(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  const projectId = formData.get("project_id") as string
  const milestoneId = formData.get("milestone_id") as string
  const reason = formData.get("reason") as string
  const description = formData.get("description") as string

  if (!projectId || !reason || !description) {
    return { error: "Todos os campos são obrigatórios" }
  }

  // Verify user is part of the project
  const { data: project } = await supabase
    .from("projects")
    .select(
      `
      client_id,
      title,
      selected_proposal:proposals!selected_proposal_id (
        freelancer_id
      )
    `,
    )
    .eq("id", projectId)
    .single()

  if (!project) {
    return { error: "Projeto não encontrado" }
  }

  const isClient = project.client_id === user.id
  const isFreelancer = project.selected_proposal?.freelancer_id === user.id

  if (!isClient && !isFreelancer) {
    return { error: "Você não tem permissão para criar uma disputa neste projeto" }
  }

  // Generate unique code
  let code = generateUniqueCode()
  let codeExists = true

  while (codeExists) {
    const { data } = await supabase.from("disputes").select("id").eq("code", code).single()
    if (!data) {
      codeExists = false
    } else {
      code = generateUniqueCode()
    }
  }

  // Create dispute
  const { data: dispute, error } = await supabase
    .from("disputes")
    .insert({
      code,
      project_id: projectId,
      milestone_id: milestoneId || null,
      raised_by: user.id,
      reason,
      description,
      status: "open",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating dispute:", error)
    return { error: "Erro ao criar disputa" }
  }

  // Update project status
  await supabase.from("projects").update({ status: "disputed" }).eq("id", projectId)

  const otherPartyId = isClient ? project.selected_proposal?.freelancer_id : project.client_id
  if (otherPartyId) {
    await createNotification({
      userId: otherPartyId,
      type: "dispute_created",
      title: "Nova Disputa Aberta",
      message: `Uma disputa foi aberta no projeto "${project.title}"`,
      link: `/projects/${projectId}`,
      metadata: { dispute_id: dispute.id, project_id: projectId },
    })
  }

  // Create audit log
  await createAuditLog({
    action: "create_dispute",
    entityType: "dispute",
    entityId: dispute.id,
    entityCode: dispute.code,
    details: { project_id: projectId, reason },
  })

  revalidatePath(`/projects/${projectId}`)
  return { disputeId: dispute.id }
}

export async function resolveDispute(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Verify user is admin
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (!profile || profile.user_type !== "admin") {
    return { error: "Apenas administradores podem resolver disputas" }
  }

  const disputeId = formData.get("dispute_id") as string
  const resolution = formData.get("resolution") as string

  if (!disputeId || !resolution) {
    return { error: "Todos os campos são obrigatórios" }
  }

  // Get dispute
  const { data: dispute } = await supabase
    .from("disputes")
    .select(
      `
      *,
      project:projects (
        client_id,
        title,
        selected_proposal:proposals!selected_proposal_id (
          freelancer_id
        )
      )
    `,
    )
    .eq("id", disputeId)
    .single()

  if (!dispute) {
    return { error: "Disputa não encontrada" }
  }

  // Update dispute
  const { error } = await supabase
    .from("disputes")
    .update({
      status: "resolved",
      resolution,
      resolved_by: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", disputeId)

  if (error) {
    console.error("[v0] Error resolving dispute:", error)
    return { error: "Erro ao resolver disputa" }
  }

  // Update project status back to in_progress
  await supabase.from("projects").update({ status: "in_progress" }).eq("id", dispute.project_id)

  const clientId = dispute.project.client_id
  const freelancerId = dispute.project.selected_proposal?.freelancer_id

  if (clientId) {
    await createNotification({
      userId: clientId,
      type: "dispute_resolved",
      title: "Disputa Resolvida",
      message: `A disputa no projeto "${dispute.project.title}" foi resolvida por um administrador`,
      link: `/projects/${dispute.project_id}`,
      metadata: { dispute_id: disputeId, project_id: dispute.project_id },
    })
  }

  if (freelancerId) {
    await createNotification({
      userId: freelancerId,
      type: "dispute_resolved",
      title: "Disputa Resolvida",
      message: `A disputa no projeto "${dispute.project.title}" foi resolvida por um administrador`,
      link: `/projects/${dispute.project_id}`,
      metadata: { dispute_id: disputeId, project_id: dispute.project_id },
    })
  }

  // Create audit log
  await createAuditLog({
    action: "resolve_dispute",
    entityType: "dispute",
    entityId: disputeId,
    entityCode: dispute.code,
    details: { resolution },
  })

  revalidatePath(`/admin/disputes/${disputeId}`)
  revalidatePath(`/admin/disputes`)
  return { success: true }
}
