import { NextResponse } from "next/server"
import { checkDBStatus } from "@/lib/db"
import { isGroqConfigured } from "@/lib/groqClient"
import packageJson from "@/package.json"

// Public health-check endpoint — no auth required
// Used by Render health checks and uptime monitors
export async function GET() {
  try {
    const [dbStatus] = await Promise.all([
      checkDBStatus(),
    ])

    const health = {
      status: "ok",
      version: packageJson.version,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      services: {
        database: {
          connected: dbStatus.connected,
          provider: dbStatus.provider,
        },
        ai: {
          configured: isGroqConfigured(),
          provider: "Groq / LLaMA 3.3",
        },
      },
    }

    const httpStatus = dbStatus.connected ? 200 : 503
    return NextResponse.json(health, { status: httpStatus })
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: err.message,
      },
      { status: 503 }
    )
  }
}
