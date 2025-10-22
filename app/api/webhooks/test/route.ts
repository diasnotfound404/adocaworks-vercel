import { NextResponse } from "next/server"

/**
 * Test webhook endpoint for development
 * This demonstrates how external services can send webhooks to the platform
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Test webhook received:", body)

    // Verify webhook signature in production
    // const signature = request.headers.get("x-webhook-signature")
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    // Process webhook based on event type
    const { event, data } = body

    switch (event) {
      case "payment.completed":
        console.log("[v0] Payment completed:", data)
        // Handle payment completion
        break

      case "payment.failed":
        console.log("[v0] Payment failed:", data)
        // Handle payment failure
        break

      case "user.verified":
        console.log("[v0] User verified:", data)
        // Handle user verification
        break

      default:
        console.log("[v0] Unknown event type:", event)
    }

    return NextResponse.json({ received: true, event })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Allow GET for webhook verification
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Webhook endpoint is active",
  })
}
