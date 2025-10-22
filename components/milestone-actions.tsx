"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { completeMilestone, payMilestone } from "@/lib/actions/milestones"
import { useRouter } from "next/navigation"

interface MilestoneActionsProps {
  milestone: any
  projectId: string
  isClient: boolean
  isFreelancer: boolean
}

export function MilestoneActions({ milestone, projectId, isClient, isFreelancer }: MilestoneActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    if (!confirm("Marcar este marco como concluído?")) {
      return
    }

    setIsLoading(true)
    const result = await completeMilestone(milestone.id)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }

    setIsLoading(false)
  }

  const handlePay = async () => {
    setIsLoading(true)
    const result = await payMilestone(milestone.id, projectId)

    if (result.error) {
      alert(result.error)
    } else if (result.paymentUrl) {
      // Redirect to Mercado Pago payment page
      window.location.href = result.paymentUrl
    }

    setIsLoading(false)
  }

  return (
    <div className="mt-4 flex gap-2">
      {isFreelancer && milestone.status === "in_progress" && (
        <Button onClick={handleComplete} disabled={isLoading}>
          {isLoading ? "Processando..." : "Marcar como Concluído"}
        </Button>
      )}

      {isClient && milestone.status === "completed" && (
        <Button onClick={handlePay} disabled={isLoading}>
          {isLoading ? "Processando..." : "Liberar Pagamento"}
        </Button>
      )}

      {milestone.status === "paid" && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">Pagamento liberado com sucesso</div>
      )}
    </div>
  )
}
