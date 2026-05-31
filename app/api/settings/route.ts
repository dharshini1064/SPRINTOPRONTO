import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { getIntegrationSettings, saveIntegrationSettings } from "@/lib/db"

const JWT_SECRET = process.env.NEXTAUTH_SECRET

export async function GET(request: Request) {
  try {
    // 1. Authenticate using NextAuth JWT
    const token = await getToken({ req: request as any, secret: JWT_SECRET })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized session context" }, { status: 401 })
    }

    // 2. Authorize: Enforce Manager-only RBAC rule
    const role = (token as any).role || "developer"
    if (role !== "manager") {
      return NextResponse.json({ error: "Forbidden: Manager access required" }, { status: 403 })
    }

    // 3. Fetch settings
    const settings = await getIntegrationSettings()
    return NextResponse.json(settings)
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to read integrations settings", details: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate using NextAuth JWT
    const token = await getToken({ req: request as any, secret: JWT_SECRET })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized session context" }, { status: 401 })
    }

    // 2. Authorize: Enforce Manager-only RBAC rule
    const role = (token as any).role || "developer"
    if (role !== "manager") {
      return NextResponse.json({ error: "Forbidden: Manager access required" }, { status: 403 })
    }

    // 3. Save incoming payload
    const { githubPat, githubRepo, linearApiKey, slackBotToken } = await request.json()
    
    // Simple validation
    if (githubRepo && !githubRepo.includes("/")) {
      return NextResponse.json({ error: "GitHub repository must be in owner/repo format" }, { status: 400 })
    }

    const config = {
      githubPat: githubPat || "",
      githubRepo: githubRepo || "",
      linearApiKey: linearApiKey || "",
      slackBotToken: slackBotToken || ""
    }

    const success = await saveIntegrationSettings(config)
    if (success) {
      return NextResponse.json({ success: true, message: "Settings persisted successfully" })
    } else {
      throw new Error("Failed to write to database layer")
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to save integrations settings", details: err.message }, { status: 500 })
  }
}
