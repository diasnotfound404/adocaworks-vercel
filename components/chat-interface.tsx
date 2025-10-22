// NEW FEATURE - Chat Interface Component
"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { sendMessage } from "@/lib/actions/chat"
import type { Message } from "@/lib/types/chat"

interface ChatInterfaceProps {
  conversationId: string
  messages: Message[]
  currentUserId: string
  otherUserName: string
  otherUserAvatar?: string
}

export function ChatInterface({
  conversationId,
  messages: initialMessages,
  currentUserId,
  otherUserName,
  otherUserAvatar,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const messageContent = newMessage

    // Optimistically add message to UI
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: messageContent,
      read: false,
      created_at: new Date().toISOString(),
    }

    setMessages([...messages, optimisticMessage])
    setNewMessage("")

    try {
      const result = await sendMessage(conversationId, messageContent)

      if (result.error) {
        // Remove optimistic message on error
        setMessages(messages)
        setNewMessage(messageContent)
        alert(result.error)
      } else {
        // Refresh to get the real message
        window.location.reload()
      }
    } catch (error) {
      setMessages(messages)
      setNewMessage(messageContent)
      alert("Erro ao enviar mensagem")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUserAvatar || "/placeholder.svg"} />
            <AvatarFallback>{otherUserName[0]}</AvatarFallback>
          </Avatar>
          <CardTitle>{otherUserName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              Nenhuma mensagem ainda. Inicie a conversa!
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUserId

              return (
                <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwn ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                    </div>
                    <p className={`mt-1 text-xs text-gray-500 ${isOwn ? "text-right" : "text-left"}`}>
                      {new Date(message.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isSending}
              className="flex-1"
            />
            <Button type="submit" disabled={isSending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
