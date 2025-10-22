// NEW FEATURE - Chat List Page
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/app-header"
import { getUserConversations } from "@/lib/actions/chat"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

export default async function ChatListPage() {
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

  const conversations = await getUserConversations()

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader profile={profile} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
          <p className="mt-2 text-gray-600">Suas conversas com clientes e freelancers</p>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Nenhuma conversa ainda</h3>
              <p className="text-gray-600">Suas mensagens aparecerão aqui</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conversation) => {
              const otherUser =
                conversation.participant_1_id === user.id ? conversation.participant_2 : conversation.participant_1

              return (
                <Link key={conversation.id} href={`/chat/${conversation.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>{otherUser?.full_name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{otherUser?.full_name || "Usuário"}</CardTitle>
                            <CardDescription>
                              {conversation.project?.title} ({conversation.project?.code})
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(conversation.last_message_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
