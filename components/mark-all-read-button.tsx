"use client"

import { Button } from "@/components/ui/button"
import { markAllNotificationsAsRead } from "@/lib/actions/notifications"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CheckCheck } from "lucide-react"

export function MarkAllReadButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    await markAllNotificationsAsRead()
    router.refresh()
    setIsLoading(false)
  }

  return (
    <Button onClick={handleClick} disabled={isLoading} variant="outline">
      <CheckCheck className="mr-2 h-4 w-4" />
      {isLoading ? "Marcando..." : "Marcar Todas como Lidas"}
    </Button>
  )
}
