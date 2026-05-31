import { NextResponse } from "next/server"
import { groq, isGroqConfigured } from "@/lib/groqClient"
import { runCorrelationEngine } from "@/lib/correlationEngine"
import { fetchLiveTickets } from "@/lib/connectors/linear"
import { fetchLivePRs } from "@/lib/connectors/github"
import { fetchLiveSlackThreads } from "@/lib/connectors/slack"

const SYSTEM_PROMPT = `You are Sprintopronto AI, an enterprise engineering operations intelligence assistant.

Your role:
- detect blockers
- identify sprint risks
- correlate GitHub PRs, Linear tickets, and Slack discussions
- generate concise operational summaries
- provide actionable engineering insights

Always:
- explain root causes
- identify dependencies
- mention stale PRs
- mention blocked tickets
- provide operational recommendations

Be concise, analytical, and executive-friendly.`

// Pre-packaged local responses (rich markdown templates) for demo queries (Hybrid Mode / Fallback)
const LOCAL_RESPONSES = {
  onboarding: `### 🔍 Blocker Analysis: Onboarding Flow Delay (LIN-103)

The onboarding flow is currently delayed due to a **cascading series of technical dependencies and stale reviews**.

#### 1. Root Cause Breakdown
* **Stale Pull Request Blocker:** 
  [PR-402: "feat: onboard-steps component flow"](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) opened by **Alex Rivera** has been pending review by **John Doe** for **52 hours** (stale).
* **Database Schema Blocker:** 
  The onboarding UI API endpoints depend on the PostgreSQL database schemas in [LIN-102: "Setup PostgreSQL db migrations & schemas"](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts). Sarah Jenkins is working on this but is blocked.
* **Underlying Transaction Deadlock:** 
  The database migration is deadlocked on table \`workspace_settings\`. Slack discussions in [#migration-clash](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) reveal that the active dev database connection pool is being held open, preventing the migration DDL from running.
* **WebSocket Memory Connection Leak:** 
  The open connection lock originates from [LIN-108: "Resolve memory leak in WebSocket connection"](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) (assigned to John Doe), which leaks active database sessions upon client disconnect.

\`\`\`mermaid
graph TD
  LIN-108["WS Leak (John)"] -->|Holds DB Locks| LIN-102["Postgres Migration (Sarah)"]
  LIN-102 -->|Blocks API Endpoints| LIN-103["Onboarding UI (Alex)"]
  PR-402["PR-402 review (John)"] -->|Pending 52h| LIN-103
  style LIN-103 fill:#f43f5e,stroke:#fff,stroke-width:2px,color:#fff
  style PR-402 fill:#f59e0b,stroke:#fff,stroke-width:1px,color:#fff
  style LIN-102 fill:#f59e0b,stroke:#fff,stroke-width:1px,color:#fff
\`\`\`

#### 2. Correlated Slack Discussions
* **#onboarding-delay:** Alex Rivera noted: *"If we don't have the workspace schema applied, the API throws a 500 error when clicking 'Create Workspace' in step 2."*
* **#migration-clash:** Sarah Jenkins reported: *"The WebSocket server is holding active connections to the database in development, blocking DDL execution! Failing logs show pg_terminate_backend might be needed."*

#### 3. Recommended Operational Actions
1. **Force Kill DB Connections:** Execute \`pg_terminate_backend\` to clear the active locks and allow Sarah to apply the PostgreSQL migrations ([LIN-102](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)).
2. **Review Reminder:** Ping **John Doe** to review and merge [PR-402](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) as soon as migrations are resolved.
3. **Unblock WebSockets:** Prioritize John's memory leak fix ([PR-404](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)) to prevent future locks.`,

  standup: `### 📋 Daily Standup Summary: ${new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Here is the correlated sprint activity standup summary generated from Linear, GitHub, and Slack:

#### ✅ 1. Completed Today
* **Authentication Flow:** Marcus Chen completed [LIN-101: "Implement OAuth2.0 authentication flow"](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) and merged [PR-401](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts). Token configuration successfully set to secure HttpOnly cookies.
* **Layouts & Styling:** Sophie Taylor finalized [LIN-107: "Create analytics dashboard layout"](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) and Sophie/Alex resolved mobile view issues in [LIN-116](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts).
* **Ops:** Sentry tracking has been configured ([LIN-113](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)) by John Doe.

#### 🔄 2. Ongoing & In Progress
* **Database Schemas ([LIN-102](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)):** Sarah Jenkins is applying schemas but experiencing database deadlocks.
* **WebSocket Memory Leak ([LIN-108](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)):** John Doe isolated the leak closure in [PR-404](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts).
* **Session Expiry UI ([LIN-120](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)):** Elena Rostova is writing the timeout warning banners.

#### ⚠️ 3. Blockers & Risks
* **Onboarding Flow (Alex Rivera):** Blocked on [PR-402](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) review and database migrations ([LIN-102](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)).
* **Stripe Billing Integration (Elena Rostova):** Blocked ([LIN-106](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)) on webhook verification throwing errors. Marcus Chen suggested adding raw request body buffer parsing to Fastify configs in [#stripe-integration](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts).`,

  risks: `### 🚨 Sprint Risks & Bottlenecks Analysis

Currently, there are **3 active items** threatening the sprint delivery schedule.

#### 🔴 Risk 1: Onboarding Flow Blocked (HIGH)
* **Ticket:** [LIN-103: "Build onboarding user flow steps"](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) (Assigned to **Alex Rivera**)
* **PR:** [PR-402](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) (Review pending by **John Doe** for **52 hours**)
* **Technical Dependency:** Database migrations are locked due to active WS sessions ([LIN-108](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts)).
* **Impact:** High. Core user activation pathway cannot be verified.

#### 🔴 Risk 2: Stripe Billing Integration Blocked (HIGH)
* **Ticket:** [LIN-106: "Integrate Stripe payment checkout"](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) (Assigned to **Elena Rostova**)
* **PR:** [PR-405](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) (Review pending by **Marcus Chen** for **57 hours**)
* **Technical Friction:** Webhook signature verification is failing because Fastify pre-parses bodies to JSON.
* **Impact:** High. Subscription tier activation testing is stalled.

#### 🟡 Risk 3: DB Migrations Stuck in Transaction Deadlock (MEDIUM)
* **Ticket:** [LIN-102: "Setup PostgreSQL db migrations & schemas"](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) (Assigned to **Sarah Jenkins**)
* **Slack Activity:** Intense troubleshooting in [#migration-clash](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) regarding WebSocket processes locking the schemas.
* **Impact:** Medium. Blocks API deployment and schema-dependent features.`
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const query = message.toLowerCase().trim()
    
    // 1. Hybrid Check: If query matches key demo tasks, retrieve relevant database logs and structure response context.
    let matchedScenario: "onboarding" | "standup" | "risks" | null = null
    if (query.includes("onboard") || query.includes("delay") || query.includes("block")) {
      matchedScenario = "onboarding"
    } else if (query.includes("standup") || query.includes("today") || query.includes("summary")) {
      matchedScenario = "standup"
    } else if (query.includes("risk") || query.includes("bottleneck") || query.includes("stale pr")) {
      matchedScenario = "risks"
    }

    const [tickets, prs, threads] = await Promise.all([
      fetchLiveTickets(),
      fetchLivePRs(),
      fetchLiveSlackThreads()
    ])
    const summary = runCorrelationEngine(tickets, prs, threads)

    // 2. Check if Groq API is configured.
    if (isGroqConfigured()) {
      try {
        // Build rich context from our data engine
        const contextStr = `
CURRENT SYSTEM CONTEXT:
- Blocked Tickets: ${summary.blockedTicketsCount}
- Stale PRs: ${summary.stalePrsCount}
- Open Critical Issues: ${summary.openCriticalIssuesCount}
- Sprint Health: ${summary.healthPercent}%
- Sprint Risk Score: ${summary.riskScore}/100

ACTIVE RISKS DETECTED BY ENGINE:
${JSON.stringify(summary.risks, null, 2)}

TICKETS IN SYSTEM:
${JSON.stringify(tickets.map(t => ({ id: t.id, title: t.title, status: t.status, assignee: t.assignee.name, priority: t.priority })), null, 2)}

OPEN PRS:
${JSON.stringify(prs.map(pr => ({ id: pr.id, title: pr.title, status: pr.status, author: pr.author.name, reviewer: pr.reviewer?.name, linkedIssue: pr.linkedIssue, reviewPendingHours: pr.reviewPendingHours })), null, 2)}

SLACK DISCUSSION TOPICS:
${JSON.stringify(threads.map(s => ({ id: s.id, channel: s.channel, summary: s.summary, relatedIssue: s.relatedIssue, recentMessage: s.messages[s.messages.length - 1]?.text })), null, 2)}
`

        const messages = [
          { role: "system", content: `${SYSTEM_PROMPT}\n\nHere is the correlated sprint data:\n${contextStr}` },
          { role: "user", content: message }
        ]

        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-specdec",
          messages: messages as any,
          temperature: 0.2,
        })

        const aiResponse = response.choices[0].message.content
        if (aiResponse) {
          return NextResponse.json({
            response: aiResponse,
            mode: "groq-ai",
            scenario: matchedScenario
          })
        }
      } catch (err: any) {
        console.error("Groq API error, falling back to local hybrid templates:", err)
      }
    }

    // 3. Fallback/Hybrid response if Groq is unconfigured or failed.
    let responseText = ""
    if (matchedScenario && LOCAL_RESPONSES[matchedScenario]) {
      responseText = LOCAL_RESPONSES[matchedScenario]
    } else {
      // General fallback response
      responseText = `### 🤖 Sprintopronto AI Assistant

I am currently running in **offline/hybrid fallback mode**. 

Based on our correlated repository data:
* **Sprint Health:** ${summary.healthPercent}% (Moderate progress, but blocked items need attention)
* **Blocked Tickets:** ${summary.blockedTicketsCount} ([LIN-103](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) - Onboarding Steps, [LIN-106](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) - Stripe Checkout)
* **Stale PRs:** ${summary.stalePrsCount} ([PR-402](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) - Pending review 52h, [PR-405](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) - Pending review 57h, [PR-407](file:///c:/Users/sdhar/Downloads/Sprintopronto/lib/mockData.ts) - Pending review 104h)
* **Suggested Actions:**
  ${summary.suggestedActions.map((act, i) => `${i + 1}. **${act.text}**`).join("\n  ")}

Try asking one of our demo commands for detailed telemetry graphs:
- *"Why is onboarding delayed?"*
- *"Generate today's standup summary"*
- *"Which sprint items are risky?"*`
    }

    return NextResponse.json({
      response: responseText,
      mode: "local-hybrid",
      scenario: matchedScenario
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: "Error during chat inference", message: error.message },
      { status: 500 }
    )
  }
}
