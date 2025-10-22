"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { acceptProposal } from "@/lib/actions/projects"
import { useRouter } from "next/navigation"

export function AcceptProposalButton({ proposalId, projectId }: { proposalId: string; projectId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAccept = async () => {
    if (!confirm("Tem certeza que deseja aceitar esta proposta? Esta ação não pode ser desfeita.")) {
      return
    }

    setIsLoading(true)

    const result = await acceptProposal(proposalId, projectId)

    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Button onClick={handleAccept} disabled={isLoading}>
      {isLoading ? "Aceitando..." : "Aceitar Proposta"}
    </Button>
  )
}
