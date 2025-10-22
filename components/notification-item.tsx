"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { markNotificationAsRead } from "@/lib/actions/notifications"
import { useRouter } from "next/navigation"

export function NotificationItem({ notification }: { notification: any }) {
  const router = useRouter()

  const handleClick = async () => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id)
      router.refresh()
    }

    if (notification.link) {
      router.push(notification.link)
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${!notification.read ? "border-l-4 border-l-blue-500 bg-blue-50" : ""}`}
      onClick={handleClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{notification.title}</h4>
              {!notification.read && <Badge variant="default">Nova</Badge>}
            </div>
            <p className="text-sm text-gray-700">{notification.message}</p>
            <p className="mt-2 text-xs text-gray-500">{new Date(notification.created_at).toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
