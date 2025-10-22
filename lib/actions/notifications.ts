"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateNotificationParams {
  userId: string
  type: string
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
}

export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient()

  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link || null,
    metadata: params.metadata || {},
  })

  if (error) {
    console.error("[v0] Failed to create notification:", error)
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    console.error("[v0] Failed to mark notification as read:", error)
    return { error: "Erro ao marcar notificação como lida" }
  }

  revalidatePath("/notifications")
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autenticado" }
  }

  const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)

  if (error) {
    console.error("[v0] Failed to mark all notifications as read:", error)
    return { error: "Erro ao marcar notificações como lidas" }
  }

  revalidatePath("/notifications")
  return { success: true }
}

export async function getUnreadNotificationCount() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  return count || 0
}
