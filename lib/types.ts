export type WorkItem = {
  id: string          // e.g. "LIN-101"
  title: string
  source: "linear" | "github"
  status: "todo" | "in_progress" | "blocked" | "completed" | "backlog"
  assignee: {
    name: string
    avatar: string
  }
  priority: "low" | "medium" | "high" | "urgent"
  updatedAt: string   // ISO date string
  storyPoints?: number
  description?: string
  project?: string
}

export type PullRequest = {
  id: string          // e.g. "PR-42"
  title: string
  status: "open" | "merged" | "blocked"
  source: "github"
  author: {
    name: string
    avatar: string
  }
  reviewer?: {
    name: string
    avatar: string
  }
  linkedIssue?: string // LIN-XXX
  createdAt: string
  updatedAt: string
  isStale: boolean
  reviewPendingHours: number
  draft?: boolean
}

export type SlackMessage = {
  user: {
    name: string
    avatar: string
  }
  text: string
  timestamp: string
}

export type SlackThread = {
  id: string          // e.g. "SLK-801"
  channel: string     // e.g. "onboarding-flow"
  summary: string
  messages: SlackMessage[]
  relatedIssue?: string // LIN-XXX or PR-XXX
  updatedAt: string
}

export type SprintRisk = {
  id: string
  title: string
  type: "blocker" | "stale_pr" | "slack_alert" | "delay"
  level: "low" | "medium" | "high"
  description: string
  linkedTicketId?: string
  linkedPrId?: string
  linkedSlackId?: string
  suggestedAction: string
}

export type SprintSummary = {
  healthPercent: number
  riskScore: number
  totalTickets: number
  blockedTicketsCount: number
  stalePrsCount: number
  openCriticalIssuesCount: number
  risks: SprintRisk[]
  suggestedActions: {
    id: string
    text: string
    actionableId?: string
    actionableType?: "ticket" | "pr" | "slack"
  }[]
}
