import { LinearClient } from "@linear/sdk"
import { mockTickets } from "@/lib/mockData"
import { WorkItem } from "@/lib/types"
import { getIntegrationSettings } from "@/lib/db"

export async function fetchLiveTickets(): Promise<WorkItem[]> {
  // 1. Fetch credentials from database
  const config = await getIntegrationSettings()

  // Precedence: Database Settings > Env variables
  const apiKey = config.linearApiKey || process.env.LINEAR_API_KEY

  if (!apiKey || apiKey === "lin_api_xxxx" || apiKey.trim() === "") {
    console.log("[Linear Connector] Running in simulated mode (no Linear API key). Returning mock tickets.")
    return mockTickets
  }

  try {
    const client = new LinearClient({ apiKey })
    console.log("[Linear Connector] Fetching live tickets from Linear...")
    const issues = await client.issues({
      first: 20,
      orderBy: "updatedAt"
    })

    const ticketPromises = issues.nodes.map(async (issue) => {
      const [assignee, state, project] = await Promise.all([
        issue.assignee,
        issue.state,
        issue.project
      ])

      let priority: "low" | "medium" | "high" | "urgent" = "medium"
      if (issue.priority === 1) priority = "urgent"
      else if (issue.priority === 2) priority = "high"
      else if (issue.priority === 3) priority = "medium"
      else if (issue.priority === 4) priority = "low"

      let status: "todo" | "in_progress" | "blocked" | "completed" | "backlog" = "todo"
      const stateType = state?.type || "started"
      const stateName = (state?.name || "").toLowerCase()

      if (stateType === "completed") status = "completed"
      else if (stateType === "backlog") status = "backlog"
      else if (stateName.includes("block") || stateName.includes("hold")) status = "blocked"
      else if (stateType === "started" || stateType === "unstarted") {
        status = stateType === "started" ? "in_progress" : "todo"
      }

      return {
        id: issue.identifier,
        title: issue.title,
        source: "linear" as const,
        status,
        assignee: {
          name: assignee?.name || "Unassigned",
          avatar: assignee?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
        },
        priority,
        updatedAt: issue.updatedAt.toISOString(),
        storyPoints: issue.estimate || undefined,
        description: issue.description || undefined,
        project: project?.name || "Unassigned Project"
      }
    })

    return await Promise.all(ticketPromises)
  } catch (error: any) {
    console.error("[Linear Connector] Failed to fetch live tickets from Linear SDK:", error.message)
    console.log("[Linear Connector] Falling back to mock tickets.")
    return mockTickets
  }
}
