"use server"

import { createClient } from "@/lib/supabase/server"
import { generateUniqueCode } from "@/lib/utils/generate-code"
import { createAuditLog } from "./audit"
import { createNotification } from "./notifications"
import { revalidatePath } from "next/cache"

export async function createMilestone(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  const projectId = formData.get("project_id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const orderIndex = Number.parseInt(formData.get("order_index") as string)
  const dueDate = formData.get("due_date") as string

  if (!projectId || !title || !amount || !orderIndex) {
    return { error: "Campos obrigatórios faltando" }
  }

  // Verify user owns the project
  const { data: project } = await supabase.from("projects").select("client_id").eq("id", projectId).single()

  if (!project || project.client_id !== user.id) {
    return { error: "Você não tem permissão para criar marcos neste projeto" }
  }

  // Generate unique code
  let code = generateUniqueCode()
  let codeExists = true

  while (codeExists) {
    const { data } = await supabase.from("milestones").select("id").eq("code", code).single()
    if (!data) {
      codeExists = false
    } else {
      code = generateUniqueCode()
    }
  }

  // Create milestone
  const { data: milestone, error } = await supabase
    .from("milestones")
    .insert({
      code,
      project_id: projectId,
      title,
      description: description || null,
      amount,
      order_index: orderIndex,
      due_date: dueDate || null,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating milestone:", error)
    return { error: "Erro ao criar marco" }
  }

  // Create audit log
  await createAuditLog({
    action: "create_milestone",
    entityType: "milestone",
    entityId: milestone.id,
    entityCode: milestone.code,
    details: { project_id: projectId, title, amount },
  })

  revalidatePath(`/projects/${projectId}/milestones`)
  return { milestoneId: milestone.id }
}

export async function completeMilestone(milestoneId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Get milestone and verify freelancer
  const { data: milestone } = await supabase
    .from("milestones")
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
    .eq("id", milestoneId)
    .single()

  if (!milestone) {
    return { error: "Marco não encontrado" }
  }

  const freelancerId = milestone.project.selected_proposal?.freelancer_id

  if (freelancerId !== user.id) {
    return { error: "Você não tem permissão para completar este marco" }
  }

  if (milestone.status !== "in_progress" && milestone.status !== "pending") {
    return { error: "Este marco não pode ser marcado como concluído" }
  }

  // Update milestone
  const { error } = await supabase
    .from("milestones")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", milestoneId)

  if (error) {
    console.error("[v0] Error completing milestone:", error)
    return { error: "Erro ao completar marco" }
  }

  await createNotification({
    userId: milestone.project.client_id,
    type: "milestone_completed",
    title: "Marco Concluído",
    message: `O marco "${milestone.title}" do projeto "${milestone.project.title}" foi marcado como concluído`,
    link: `/projects/${milestone.project_id}/milestones`,
    metadata: { milestone_id: milestoneId, project_id: milestone.project_id },
  })

  // Create audit log
  await createAuditLog({
    action: "complete_milestone",
    entityType: "milestone",
    entityId: milestoneId,
    entityCode: milestone.code,
  })

  revalidatePath(`/projects/${milestone.project_id}/milestones`)
  return { success: true }
}

export async function payMilestone(milestoneId: string, projectId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Get milestone and verify client
  const { data: milestone } = await supabase
    .from("milestones")
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
    .eq("id", milestoneId)
    .single()

  if (!milestone) {
    return { error: "Marco não encontrado" }
  }

  if (milestone.project.client_id !== user.id) {
    return { error: "Você não tem permissão para pagar este marco" }
  }

  if (milestone.status !== "completed") {
    return { error: "Este marco ainda não foi concluído" }
  }

  // Generate unique transaction code
  let transactionCode = generateUniqueCode()
  let codeExists = true

  while (codeExists) {
    const { data } = await supabase.from("transactions").select("id").eq("code", transactionCode).single()
    if (!data) {
      codeExists = false
    } else {
      transactionCode = generateUniqueCode()
    }
  }

  // Create transaction record
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      code: transactionCode,
      project_id: projectId,
      milestone_id: milestoneId,
      payer_id: user.id,
      payee_id: milestone.project.selected_proposal?.freelancer_id,
      amount: milestone.amount,
      type: "release",
      status: "pending",
      metadata: {
        milestone_code: milestone.code,
        milestone_title: milestone.title,
      },
    })
    .select()
    .single()

  if (transactionError) {
    console.error("[v0] Error creating transaction:", transactionError)
    return { error: "Erro ao criar transação" }
  }

  // In a real implementation, integrate with Mercado Pago here
  // For now, we'll simulate the payment flow
  const paymentUrl = `/api/payments/process?transaction_id=${transaction.id}`

  // Create audit log
  await createAuditLog({
    action: "initiate_payment",
    entityType: "transaction",
    entityId: transaction.id,
    entityCode: transaction.code,
    details: { milestone_id: milestoneId, amount: milestone.amount },
  })

  return { paymentUrl }
}
