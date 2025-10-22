// NEW FEATURE - Chat Types
export interface Conversation {
  id: string
  project_id: string
  participant_1_id: string
  participant_2_id: string
  last_message_at: string
  created_at: string
  project?: {
    id: string
    title: string
    code: string
  }
  participant_1?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  participant_2?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  last_message?: Message
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  sender?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}
