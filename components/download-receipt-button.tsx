// NEW FEATURE - Download Receipt Button
"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DownloadReceiptButtonProps {
  transactionId: string
  transactionCode: string
}

export function DownloadReceiptButton({ transactionId, transactionCode }: DownloadReceiptButtonProps) {
  const handleDownload = () => {
    // Open receipt in new window for printing/saving
    window.open(`/api/receipts/${transactionId}`, "_blank")
  }

  return (
    <Button onClick={handleDownload} variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      Baixar Recibo
    </Button>
  )
}
