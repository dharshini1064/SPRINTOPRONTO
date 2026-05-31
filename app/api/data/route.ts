import { NextResponse } from "next/server"
import { fetchLiveTickets } from "@/lib/connectors/linear"
import { fetchLivePRs } from "@/lib/connectors/github"
import { fetchLiveSlackThreads } from "@/lib/connectors/slack"
import { runCorrelationEngine } from "@/lib/correlationEngine"
import { checkDBStatus } from "@/lib/db"

export const dynamic = "force-dynamic";
//hefejfinlknl




export async function GET() {
  try {
    // 1. Fetch live telemetry from integration connectors
    const [tickets, prs, threads] = await Promise.all([
      fetchLiveTickets(),
      fetchLivePRs(),
      fetchLiveSlackThreads()
    ])

    // 2. Execute Correlation Engine over the live dataset
    const summary = runCorrelationEngine(tickets, prs, threads)

    const dbStatus = await checkDBStatus()

    return NextResponse.json({
      tickets,
      prs,
      threads,
      summary,
      dbStatus
    })
  } catch (error: any) {
    console.error("Failed to fetch live telemetry in API route:", error)
    return NextResponse.json(
      { error: "Failed to aggregate live sprint data", message: error.message },
      { status: 500 }
    )
  }
}
