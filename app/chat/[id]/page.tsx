// NEW FEATURE - Chat Conversation Page
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { getConversationMessages, markMessagesAsRead } from "@/lib/actions/chat"
import { ChatInterface } from "@/components/chat-interface"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function ChatConversationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get conversation details
  const { data: conversation } = await supabase
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
    .eq("id", params.id)
    .single()

  if (!conversation) {
    redirect("/chat")
  }

  // Verify user is part of conversation
  if (conversation.participant_1_id !== user.id && conversation.participant_2_id !== user.id) {
    redirect("/chat")
  }

  const messages = await getConversationMessages(params.id)
  await markMessagesAsRead(params.id)

  const otherUser = conversation.participant_1_id === user.id ? conversation.participant_2 : conversation.participant_1

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader profile={profile} />

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/chat">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{conversation.project?.title}</h1>
            <p className="text-sm text-gray-600">Código: {conversation.project?.code}</p>
          </div>
        </div>

        <ChatInterface
          conversationId={params.id}
          messages={messages}
          currentUserId={user.id}
          otherUserName={otherUser?.full_name || "Usuário"}
          otherUserAvatar={otherUser?.avatar_url}
        />
      </main>
    </div>
  )
}
