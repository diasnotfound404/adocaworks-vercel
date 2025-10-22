"use server"

import { createClient } from "@/lib/supabase/server"
import { generateUniqueCode } from "@/lib/utils/generate-code"
import { createAuditLog } from "./audit"
import { createNotification } from "./notifications"
import { revalidatePath } from "next/cache"

export async function createProposal(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Verify user is a freelancer
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (!profile || profile.user_type !== "freelancer") {
    return { error: "Apenas freelancers podem enviar propostas" }
  }

  const projectId = formData.get("project_id") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const deliveryDays = Number.parseInt(formData.get("delivery_days") as string)
  const coverLetter = formData.get("cover_letter") as string

  if (!projectId || !amount || !deliveryDays || !coverLetter) {
    return { error: "Todos os campos são obrigatórios" }
  }

  // Verify project exists and is open
  const { data: project } = await supabase
    .from("projects")
    .select("status, client_id, title")
    .eq("id", projectId)
    .single()

  if (!project || project.status !== "open") {
    return { error: "Este projeto não está mais aceitando propostas" }
  }

  // Check if user already submitted a proposal
  const { data: existingProposal } = await supabase
    .from("proposals")
    .select("id")
    .eq("project_id", projectId)
    .eq("freelancer_id", user.id)
    .single()

  if (existingProposal) {
    return { error: "Você já enviou uma proposta para este projeto" }
  }

  // Generate unique code
  let code = generateUniqueCode()
  let codeExists = true

  while (codeExists) {
    const { data } = await supabase.from("proposals").select("id").eq("code", code).single()
    if (!data) {
      codeExists = false
    } else {
      code = generateUniqueCode()
    }
  }

  // Create proposal
  const { data: proposal, error } = await supabase
    .from("proposals")
    .insert({
      code,
      project_id: projectId,
      freelancer_id: user.id,
      amount,
      delivery_days: deliveryDays,
      cover_letter: coverLetter,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating proposal:", error)
    return { error: "Erro ao criar proposta" }
  }

  await createNotification({
    userId: project.client_id,
    type: "proposal_received",
    title: "Nova Proposta Recebida",
    message: `Você recebeu uma nova proposta para o projeto "${project.title}"`,
    link: `/projects/${projectId}`,
    metadata: { proposal_id: proposal.id, project_id: projectId },
  })

  // Create audit log
  await createAuditLog({
    action: "create_proposal",
    entityType: "proposal",
    entityId: proposal.id,
    entityCode: proposal.code,
    details: { project_id: projectId, amount, delivery_days: deliveryDays },
  })

  revalidatePath(`/projects/${projectId}`)
  return { proposalId: proposal.id }
}
