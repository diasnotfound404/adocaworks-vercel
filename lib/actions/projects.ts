"use server"

import { createClient } from "@/lib/supabase/server"
import { generateUniqueCode } from "@/lib/utils/generate-code"
import { createAuditLog } from "./audit"
import { createNotification } from "./notifications"
import { revalidatePath } from "next/cache"

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Verify user is a client
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

  if (!profile || profile.user_type !== "client") {
    return { error: "Apenas clientes podem criar projetos" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const category = formData.get("category") as string
  // NEW FEATURE - Get category_id and subcategory_id
  const categoryId = formData.get("category_id") as string
  const subcategoryId = formData.get("subcategory_id") as string
  const budgetMin = Number.parseFloat(formData.get("budget_min") as string)
  const budgetMax = Number.parseFloat(formData.get("budget_max") as string)
  const deadline = formData.get("deadline") as string

  // NEW FEATURE - Updated validation to require category_id
  if (!title || !description || !categoryId || !budgetMin || !budgetMax) {
    return { error: "Todos os campos obrigatórios devem ser preenchidos" }
  }

  if (budgetMin > budgetMax) {
    return { error: "O orçamento mínimo não pode ser maior que o máximo" }
  }

  // Generate unique code
  let code = generateUniqueCode()
  let codeExists = true

  // Ensure code is unique
  while (codeExists) {
    const { data } = await supabase.from("projects").select("id").eq("code", code).single()
    if (!data) {
      codeExists = false
    } else {
      code = generateUniqueCode()
    }
  }

  // Create project
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      code,
      client_id: user.id,
      title,
      description,
      category, // Keep old category field for backward compatibility
      // NEW FEATURE - Add category_id and subcategory_id
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      budget_min: budgetMin,
      budget_max: budgetMax,
      deadline: deadline || null,
      status: "open",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating project:", error)
    return { error: "Erro ao criar projeto" }
  }

  // Create audit log
  await createAuditLog({
    action: "create_project",
    entityType: "project",
    entityId: project.id,
    entityCode: project.code,
    // NEW FEATURE - Include category_id in audit log
    details: {
      title,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      budget_min: budgetMin,
      budget_max: budgetMax,
    },
  })

  revalidatePath("/projects")
  return { projectId: project.id }
}

export async function getProjectWithProposals(projectId: string) {
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      client:profiles!client_id (
        id,
        full_name,
        avatar_url,
        rating
      ),
      proposals (
        *,
        freelancer:profiles!freelancer_id (
          id,
          full_name,
          avatar_url,
          rating,
          total_reviews,
          skills
        )
      )
    `,
    )
    .eq("id", projectId)
    .single()

  if (error) {
    console.error("[v0] Error fetching project:", error)
    return null
  }

  return project
}

export async function acceptProposal(proposalId: string, projectId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Verify user owns the project
  const { data: project } = await supabase.from("projects").select("client_id, title").eq("id", projectId).single()

  if (!project || project.client_id !== user.id) {
    return { error: "Você não tem permissão para aceitar esta proposta" }
  }

  // Get proposal details
  const { data: proposal } = await supabase.from("proposals").select("freelancer_id").eq("id", proposalId).single()

  if (!proposal) {
    return { error: "Proposta não encontrada" }
  }

  // Update proposal status
  const { error: proposalError } = await supabase.from("proposals").update({ status: "accepted" }).eq("id", proposalId)

  if (proposalError) {
    console.error("[v0] Error accepting proposal:", proposalError)
    return { error: "Erro ao aceitar proposta" }
  }

  // Update project status and selected proposal
  const { error: projectError } = await supabase
    .from("projects")
    .update({
      status: "in_progress",
      selected_proposal_id: proposalId,
    })
    .eq("id", projectId)

  if (projectError) {
    console.error("[v0] Error updating project:", projectError)
    return { error: "Erro ao atualizar projeto" }
  }

  // Reject other proposals
  await supabase.from("proposals").update({ status: "rejected" }).eq("project_id", projectId).neq("id", proposalId)

  await createNotification({
    userId: proposal.freelancer_id,
    type: "proposal_accepted",
    title: "Proposta Aceita!",
    message: `Sua proposta para o projeto "${project.title}" foi aceita!`,
    link: `/projects/${projectId}`,
    metadata: { proposal_id: proposalId, project_id: projectId },
  })

  // Create audit log
  await createAuditLog({
    action: "accept_proposal",
    entityType: "proposal",
    entityId: proposalId,
    details: { project_id: projectId },
  })

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
