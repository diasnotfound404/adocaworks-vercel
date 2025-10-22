// NEW FEATURE - Chat Actions
"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Conversation, Message } from "@/lib/types/chat"
import { createNotification } from "./notifications"

export async function getOrCreateConversation(projectId: string, otherUserId: string): Promise<string | null> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Use the database function to get or create conversation
  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    p_project_id: projectId,
    p_user1_id: user.id,
    p_user2_id: otherUserId,
  })

  if (error) {
    console.error("[v0] Error getting/creating conversation:", error)
    return null
  }

  return data
}

export async function getUserConversations(): Promise<Conversation[]> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      project:projects (
        id,
        title,
        code
      ),
      participant_1:profiles!participant_1_id (
        id,
        full_name,
        avatar_url
      ),
      participant_2:profiles!participant_2_id (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching conversations:", error)
    return []
  }

  return data || []
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:profiles!sender_id (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching messages:", error)
    return []
  }

  return data || []
}

export async function sendMessage(conversationId: string, content: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  if (!content.trim()) {
    return { error: "Mensagem não pode estar vazia" }
  }

  // Create message
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error sending message:", error)
    return { error: "Erro ao enviar mensagem" }
  }

  // Get conversation details for notification
  const { data: conversation } = await supabase
    .from("conversations")
    .select("participant_1_id, participant_2_id, project:projects(title)")
    .eq("id", conversationId)
    .single()

  if (conversation) {
    // Determine recipient
    const recipientId =
      conversation.participant_1_id === user.id ? conversation.participant_2_id : conversation.participant_1_id

    // Create notification
    await createNotification({
      userId: recipientId,
      type: "new_message",
      title: "Nova Mensagem",
      message: `Você recebeu uma nova mensagem no projeto "${conversation.project?.title || "Projeto"}"`,
      link: `/chat/${conversationId}`,
      metadata: { conversation_id: conversationId, message_id: message.id },
    })
  }

  revalidatePath(`/chat/${conversationId}`)
  return { success: true, messageId: message.id }
}

export async function markMessagesAsRead(conversationId: string) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  // Mark all messages in conversation as read (except sender's own messages)
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .eq("read", false)

  if (error) {
    console.error("[v0] Error marking messages as read:", error)
    return { error: "Erro ao marcar mensagens como lidas" }
  }

  return { success: true }
}
