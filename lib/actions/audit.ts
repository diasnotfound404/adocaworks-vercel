"use server"

import { createClient } from "@/lib/supabase/server"

interface CreateAuditLogParams {
  action: string
  entityType: string
  entityId?: string
  entityCode?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: CreateAuditLogParams) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from("audit_logs").insert({
    user_id: user?.id || null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId || null,
    entity_code: params.entityCode || null,
    details: params.details || {},
    ip_address: params.ipAddress || null,
    user_agent: params.userAgent || null,
  })

  if (error) {
    console.error("[v0] Failed to create audit log:", error)
  }
}
