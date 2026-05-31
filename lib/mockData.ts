import { WorkItem, PullRequest, SlackThread } from "./types"

// Avatars
const AVATARS = {
  alex: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  john: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  elena: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  marcus: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  sophie: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face"
}

// 20 Realistic Linear Tickets
export const mockTickets: WorkItem[] = [
  {
    id: "LIN-101",
    title: "Implement OAuth2.0 authentication flow",
    source: "linear",
    status: "completed",
    assignee: { name: "Marcus Chen", avatar: AVATARS.marcus },
    priority: "high",
    updatedAt: "2026-05-24T18:00:00Z",
    storyPoints: 5,
    description: "Integrate Auth0 with our backend API and set up token exchange pipelines, JWT validation, and user role configuration.",
    project: "Auth Service"
  },
  {
    id: "LIN-102",
    title: "Setup PostgreSQL db migrations & schemas",
    source: "linear",
    status: "in_progress",
    assignee: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
    priority: "urgent",
    updatedAt: "2026-05-25T15:30:00Z",
    storyPoints: 8,
    description: "Create primary database models for user accounts, workspaces, and correlation matrices. Set up migration runner.",
    project: "Data Layer"
  },
  {
    id: "LIN-103",
    title: "Build onboarding user flow steps",
    source: "linear",
    status: "blocked",
    assignee: { name: "Alex Rivera", avatar: AVATARS.alex },
    priority: "high",
    updatedAt: "2026-05-25T11:00:00Z",
    storyPoints: 5,
    description: "Create the step-by-step onboarding walkthrough UI, including organization setup, teammate invite, and integration selection.",
    project: "Core App"
  },
  {
    id: "LIN-104",
    title: "Optimize landing page image sizes",
    source: "linear",
    status: "todo",
    assignee: { name: "Sophie Taylor", avatar: AVATARS.sophie },
    priority: "low",
    updatedAt: "2026-05-22T09:00:00Z",
    storyPoints: 2,
    description: "Compress screenshots and assets on landing page. Convert PNGs to WebP and configure Next.js Image optimization rules.",
    project: "Marketing Frontend"
  },
  {
    id: "LIN-105",
    title: "Refactor state management in dashboard",
    source: "linear",
    status: "todo",
    assignee: { name: "Alex Rivera", avatar: AVATARS.alex },
    priority: "medium",
    updatedAt: "2026-05-23T14:00:00Z",
    storyPoints: 3,
    description: "Replace prop drilling with a unified Zustand store to sync active tabs, filters, and chat histories.",
    project: "Core App"
  },
  {
    id: "LIN-106",
    title: "Integrate Stripe payment checkout",
    source: "linear",
    status: "blocked",
    assignee: { name: "Elena Rostova", avatar: AVATARS.elena },
    priority: "high",
    updatedAt: "2026-05-25T14:00:00Z",
    storyPoints: 8,
    description: "Connect frontend buttons to Stripe checkout sessions. Create backend webhooks to process payment events and provision seats.",
    project: "Billing"
  },
  {
    id: "LIN-107",
    title: "Create analytics dashboard layout",
    source: "linear",
    status: "completed",
    assignee: { name: "Sophie Taylor", avatar: AVATARS.sophie },
    priority: "medium",
    updatedAt: "2026-05-24T16:30:00Z",
    storyPoints: 5,
    description: "Construct grid layout for dashboard metrics. Implement charts using Recharts for sprint progress, blockers, and SLA compliance.",
    project: "Analytics"
  },
  {
    id: "LIN-108",
    title: "Resolve memory leak in WebSocket connection",
    source: "linear",
    status: "in_progress",
    assignee: { name: "John Doe", avatar: AVATARS.john },
    priority: "high",
    updatedAt: "2026-05-25T16:45:00Z",
    storyPoints: 5,
    description: "WebSocket connection leaks client descriptors on disconnect. Find missing event listener cleanup in the subscription manager.",
    project: "Orchestration"
  },
  {
    id: "LIN-109",
    title: "Add automated tests for auth routes",
    source: "linear",
    status: "completed",
    assignee: { name: "Marcus Chen", avatar: AVATARS.marcus },
    priority: "medium",
    updatedAt: "2026-05-23T17:00:00Z",
    storyPoints: 3,
    description: "Write Playwright tests to cover login, registration, and password recovery, asserting tokens are stored securely in cookie.",
    project: "Auth Service"
  },
  {
    id: "LIN-110",
    title: "Configure CI/CD pipelines via Github Actions",
    source: "linear",
    status: "in_progress",
    assignee: { name: "John Doe", avatar: AVATARS.john },
    priority: "medium",
    updatedAt: "2026-05-25T12:00:00Z",
    storyPoints: 3,
    description: "Create workflows to run linter, TypeScript compiler, and tests on push. Build docker image and publish to Amazon ECR.",
    project: "Ops Infrastructure"
  },
  {
    id: "LIN-111",
    title: "Write API documentation for external integrations",
    source: "linear",
    status: "backlog",
    assignee: { name: "Elena Rostova", avatar: AVATARS.elena },
    priority: "low",
    updatedAt: "2026-05-21T10:00:00Z",
    storyPoints: 2,
    description: "Document webhook headers, payload schemas, and authentication endpoints on the developer portal using Swagger/OpenAPI.",
    project: "Billing"
  },
  {
    id: "LIN-112",
    title: "Implement dark mode across application",
    source: "linear",
    status: "completed",
    assignee: { name: "Sophie Taylor", avatar: AVATARS.sophie },
    priority: "low",
    updatedAt: "2026-05-24T19:00:00Z",
    storyPoints: 2,
    description: "Introduce custom tailwind classes and global state manager to toggle dark/light stylesheets based on theme preference.",
    project: "Core App"
  },
  {
    id: "LIN-113",
    title: "Setup Sentry error tracking",
    source: "linear",
    status: "completed",
    assignee: { name: "John Doe", avatar: AVATARS.john },
    priority: "medium",
    updatedAt: "2026-05-24T11:00:00Z",
    storyPoints: 1,
    description: "Initialize Sentry SDK on frontend and backend. Set up Slack integrations to dispatch exceptions to #alerts channel.",
    project: "Ops Infrastructure"
  },
  {
    id: "LIN-114",
    title: "Add PDF exporter for reports",
    source: "linear",
    status: "backlog",
    assignee: { name: "Marcus Chen", avatar: AVATARS.marcus },
    priority: "medium",
    updatedAt: "2026-05-20T10:00:00Z",
    storyPoints: 5,
    description: "Integrate puppeteer or pdfkit on the server side to compile dashboard charts into a report and send via email.",
    project: "Analytics"
  },
  {
    id: "LIN-115",
    title: "Implement rich text editor for comments",
    source: "linear",
    status: "todo",
    assignee: { name: "Alex Rivera", avatar: AVATARS.alex },
    priority: "low",
    updatedAt: "2026-05-22T12:00:00Z",
    storyPoints: 3,
    description: "Add Tiptap editor for the task comment input, supporting markdown, basic bold/italic, emojis, and links.",
    project: "Core App"
  },
  {
    id: "LIN-116",
    title: "Fix CSS overlapping issue on mobile sidebar",
    source: "linear",
    status: "completed",
    assignee: { name: "Alex Rivera", avatar: AVATARS.alex },
    priority: "medium",
    updatedAt: "2026-05-24T15:00:00Z",
    storyPoints: 1,
    description: "Sidebar is cut off on viewports below 480px. Fix the CSS absolute overlay constraints and improve mobile accessibility.",
    project: "Core App"
  },
  {
    id: "LIN-117",
    title: "Verify GDPR compliance settings",
    source: "linear",
    status: "backlog",
    assignee: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
    priority: "high",
    updatedAt: "2026-05-19T08:00:00Z",
    storyPoints: 5,
    description: "Ensure user data deletion request triggers complete cleanup of Postgres records and Auth0 user profile.",
    project: "Data Layer"
  },
  {
    id: "LIN-118",
    title: "Optimize page load speed by 30%",
    source: "linear",
    status: "todo",
    assignee: { name: "John Doe", avatar: AVATARS.john },
    priority: "medium",
    updatedAt: "2026-05-23T10:00:00Z",
    storyPoints: 5,
    description: "Code split dynamic components in dashboard and leverage React Suspense loading structures to decrease initial bundle.",
    project: "Core App"
  },
  {
    id: "LIN-119",
    title: "Refactor backend API controllers",
    source: "linear",
    status: "todo",
    assignee: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
    priority: "low",
    updatedAt: "2026-05-22T15:00:00Z",
    storyPoints: 3,
    description: "Extract business logic from router file into dedicated controllers and services, aligning with Clean Architecture rules.",
    project: "Data Layer"
  },
  {
    id: "LIN-120",
    title: "Handle session expiration gracefully in frontend",
    source: "linear",
    status: "in_progress",
    assignee: { name: "Elena Rostova", avatar: AVATARS.elena },
    priority: "medium",
    updatedAt: "2026-05-25T16:10:00Z",
    storyPoints: 2,
    description: "Prompt user with warning banner 2 minutes before JWT expiration and allow silent renewal via refresh tokens.",
    project: "Auth Service"
  }
]

// 10 GitHub Pull Requests
export const mockPRs: PullRequest[] = [
  {
    id: "PR-401",
    title: "feat: OAuth2.0 auth flow integration",
    status: "merged",
    source: "github",
    author: { name: "Marcus Chen", avatar: AVATARS.marcus },
    reviewer: { name: "John Doe", avatar: AVATARS.john },
    linkedIssue: "LIN-101",
    createdAt: "2026-05-23T11:00:00Z",
    updatedAt: "2026-05-24T18:00:00Z",
    isStale: false,
    reviewPendingHours: 0
  },
  {
    id: "PR-402",
    title: "feat: onboard-steps component flow",
    status: "blocked",
    source: "github",
    author: { name: "Alex Rivera", avatar: AVATARS.alex },
    reviewer: { name: "John Doe", avatar: AVATARS.john },
    linkedIssue: "LIN-103",
    createdAt: "2026-05-23T10:00:00Z",
    updatedAt: "2026-05-23T10:30:00Z", // Unmoved for ~48 hours
    isStale: true,
    reviewPendingHours: 52, // review pending > 48h
    draft: false
  },
  {
    id: "PR-403",
    title: "db: migration schemas for user metadata",
    status: "open",
    source: "github",
    author: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
    reviewer: { name: "John Doe", avatar: AVATARS.john },
    linkedIssue: "LIN-102",
    createdAt: "2026-05-25T13:00:00Z",
    updatedAt: "2026-05-25T15:30:00Z",
    isStale: false,
    reviewPendingHours: 4
  },
  {
    id: "PR-404",
    title: "fix: websocket close frame crash",
    status: "open",
    source: "github",
    author: { name: "John Doe", avatar: AVATARS.john },
    reviewer: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
    linkedIssue: "LIN-108",
    createdAt: "2026-05-25T16:00:00Z",
    updatedAt: "2026-05-25T16:45:00Z",
    isStale: false,
    reviewPendingHours: 1
  },
  {
    id: "PR-405",
    title: "feat: add stripe checkout integration",
    status: "blocked",
    source: "github",
    author: { name: "Elena Rostova", avatar: AVATARS.elena },
    reviewer: { name: "Marcus Chen", avatar: AVATARS.marcus },
    linkedIssue: "LIN-106",
    createdAt: "2026-05-22T08:00:00Z",
    updatedAt: "2026-05-23T08:00:00Z", // Stale review
    isStale: true,
    reviewPendingHours: 57,
    draft: false
  },
  {
    id: "PR-406",
    title: "ci: upgrade github actions nodes version",
    status: "open",
    source: "github",
    author: { name: "John Doe", avatar: AVATARS.john },
    reviewer: { name: "Marcus Chen", avatar: AVATARS.marcus },
    linkedIssue: "LIN-110",
    createdAt: "2026-05-25T10:00:00Z",
    updatedAt: "2026-05-25T12:00:00Z",
    isStale: false,
    reviewPendingHours: 7
  },
  {
    id: "PR-407",
    title: "docs: publish rest api endpoints documentation",
    status: "open",
    source: "github",
    author: { name: "Elena Rostova", avatar: AVATARS.elena },
    reviewer: { name: "John Doe", avatar: AVATARS.john },
    createdAt: "2026-05-21T09:00:00Z",
    updatedAt: "2026-05-21T09:00:00Z", // Very stale
    isStale: true,
    reviewPendingHours: 104,
    draft: false
  },
  {
    id: "PR-408",
    title: "perf: lazy load large landing page assets",
    status: "open",
    source: "github",
    author: { name: "Sophie Taylor", avatar: AVATARS.sophie },
    createdAt: "2026-05-24T12:00:00Z",
    updatedAt: "2026-05-25T08:00:00Z",
    isStale: false,
    reviewPendingHours: 18
  },
  {
    id: "PR-409",
    title: "refactor: context state to zustand dashboard",
    status: "open",
    source: "github",
    author: { name: "Alex Rivera", avatar: AVATARS.alex },
    createdAt: "2026-05-24T14:00:00Z",
    updatedAt: "2026-05-24T14:00:00Z",
    isStale: false,
    reviewPendingHours: 27
  },
  {
    id: "PR-410",
    title: "fix: session expiry popups handling",
    status: "open",
    source: "github",
    author: { name: "Elena Rostova", avatar: AVATARS.elena },
    linkedIssue: "LIN-120",
    createdAt: "2026-05-25T15:00:00Z",
    updatedAt: "2026-05-25T16:10:00Z",
    isStale: false,
    reviewPendingHours: 2
  }
]

// 30 Slack Messages organized in 6 Threads
export const mockSlackThreads: SlackThread[] = [
  {
    id: "SLK-801",
    channel: "auth-oauth",
    summary: "Discussion on token lifetime and secure cookies",
    relatedIssue: "LIN-101",
    updatedAt: "2026-05-24T17:30:00Z",
    messages: [
      {
        user: { name: "Marcus Chen", avatar: AVATARS.marcus },
        text: "Just pushed the OAuth code. Token validation is happening in auth middleware. Anyone have thoughts on token TTL?",
        timestamp: "2026-05-24T15:30:00Z"
      },
      {
        user: { name: "John Doe", avatar: AVATARS.john },
        text: "Should probably set access token to 15m and refresh token to 7 days, stored in HttpOnly secure cookies.",
        timestamp: "2026-05-24T16:00:00Z"
      },
      {
        user: { name: "Marcus Chen", avatar: AVATARS.marcus },
        text: "Makes sense. I'll implement that and update the PR.",
        timestamp: "2026-05-24T16:15:00Z"
      },
      {
        user: { name: "John Doe", avatar: AVATARS.john },
        text: "Tested locally, looks solid. LGTM, merging it.",
        timestamp: "2026-05-24T17:30:00Z"
      }
    ]
  },
  {
    id: "SLK-802",
    channel: "onboarding-delay",
    summary: "Critical blockages on the onboarding flow component styling & database structure",
    relatedIssue: "LIN-103",
    updatedAt: "2026-05-25T16:30:00Z",
    messages: [
      {
        user: { name: "Alex Rivera", avatar: AVATARS.alex },
        text: "Hey team, the onboarding step flow is blocked. The onboarding PR-402 has been pending review from @john for over 2 days. John, can you take a look?",
        timestamp: "2026-05-25T09:00:00Z"
      },
      {
        user: { name: "John Doe", avatar: AVATARS.john },
        text: "Ah sorry Alex, I've been heads down trying to debug a memory leak. Also, doesn't onboarding depend on Sarah's database schema migrations in LIN-102?",
        timestamp: "2026-05-25T10:15:00Z"
      },
      {
        user: { name: "Alex Rivera", avatar: AVATARS.alex },
        text: "Yes, exactly. If we don't have the workspace schema applied, the API throws a 500 error when clicking 'Create Workspace' in step 2. We have a database issue here.",
        timestamp: "2026-05-25T11:00:00Z"
      },
      {
        user: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
        text: "Yes, I am working on the database migrations right now but I ran into a serious migration deadlock issue in the dev database container. It's failing to apply.",
        timestamp: "2026-05-25T13:10:00Z"
      },
      {
        user: { name: "Alex Rivera", avatar: AVATARS.alex },
        text: "Oh wow, so the migration deadlock is blocking database schema setup, which is blocking API endpoints, which blocks my onboarding UI testing.",
        timestamp: "2026-05-25T14:00:00Z"
      },
      {
        user: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
        text: "Exactly. The database is locked. I need to write a migration conflict resolver or drop/recreate dev db schema. Investigating.",
        timestamp: "2026-05-25T16:30:00Z"
      }
    ]
  },
  {
    id: "SLK-803",
    channel: "migration-clash",
    summary: "PostgreSQL transaction deadlock conflicts and failing schemas",
    relatedIssue: "LIN-102",
    updatedAt: "2026-05-25T16:00:00Z",
    messages: [
      {
        user: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
        text: "Dev database migration is failing on table workspace_settings. Transaction lock is held by some dead process.",
        timestamp: "2026-05-25T15:00:00Z"
      },
      {
        user: { name: "Marcus Chen", avatar: AVATARS.marcus },
        text: "Check if the connection pool isn't closing properly on the old servers. It could hold locks.",
        timestamp: "2026-05-25T15:20:00Z"
      },
      {
        user: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
        text: "Ah, the WebSocket server is holding active connections to the database in development, blocking DDL execution! Failing logs show `pg_terminate_backend` might be needed.",
        timestamp: "2026-05-25T15:45:00Z"
      },
      {
        user: { name: "John Doe", avatar: AVATARS.john },
        text: "That correlates with the memory leak I am debugging in LIN-108. The connections are not closing down, leaving db sessions open.",
        timestamp: "2026-05-25T16:00:00Z"
      }
    ]
  },
  {
    id: "SLK-804",
    channel: "stripe-integration",
    summary: "Stripe Webhook validations throwing errors",
    relatedIssue: "LIN-106",
    updatedAt: "2026-05-25T14:30:00Z",
    messages: [
      {
        user: { name: "Elena Rostova", avatar: AVATARS.elena },
        text: "Hey, Stripe webhook tests are failing in sandbox. Signature verification error. It's blocked since yesterday.",
        timestamp: "2026-05-24T14:00:00Z"
      },
      {
        user: { name: "Marcus Chen", avatar: AVATARS.marcus },
        text: "Are you using the raw request body for signature verification? NestJS / Fastify usually parses it to JSON by default, which breaks signature checks.",
        timestamp: "2026-05-24T16:20:00Z"
      },
      {
        user: { name: "Elena Rostova", avatar: AVATARS.elena },
        text: "Ah! Fastify does parse it to JSON automatically. That must be the issue. How do we retrieve the raw body?",
        timestamp: "2026-05-25T09:30:00Z"
      },
      {
        user: { name: "Marcus Chen", avatar: AVATARS.marcus },
        text: "You need to add a parser hook in the API setup to save the raw buffer for the `/webhooks/stripe` endpoint.",
        timestamp: "2026-05-25T11:00:00Z"
      },
      {
        user: { name: "Elena Rostova", avatar: AVATARS.elena },
        text: "Okay, I'll add that parser exception. The billing checkout PR-405 is blocked until we fix this signature issue.",
        timestamp: "2026-05-25T14:30:00Z"
      }
    ]
  },
  {
    id: "SLK-805",
    channel: "websocket-leak",
    summary: "Debugging memory leaks in WebSocket handlers",
    relatedIssue: "LIN-108",
    updatedAt: "2026-05-25T16:45:00Z",
    messages: [
      {
        user: { name: "John Doe", avatar: AVATARS.john },
        text: "Memory leak issue: heap grows by 20MB every 10 minutes when loading the live sprint dashboard.",
        timestamp: "2026-05-25T14:00:00Z"
      },
      {
        user: { name: "Sarah Jenkins", avatar: AVATARS.sarah },
        text: "Are we unsubscribing users from the Redis pub-sub channels on socket close?",
        timestamp: "2026-05-25T14:45:00Z"
      },
      {
        user: { name: "John Doe", avatar: AVATARS.john },
        text: "Found the issue: the close handler was bound inside the connection context but had a reference to the express socket instance, creating a massive closure context leak. Fixing in PR-404.",
        timestamp: "2026-05-25T16:45:00Z"
      }
    ]
  },
  {
    id: "SLK-806",
    channel: "ops-infra",
    summary: "Upgrading node versions on GitHub runner nodes",
    relatedIssue: "LIN-110",
    updatedAt: "2026-05-25T12:00:00Z",
    messages: [
      {
        user: { name: "John Doe", avatar: AVATARS.john },
        text: "Upgrading runners to Node 20. Tests are failing on build. Anyone know why?",
        timestamp: "2026-05-25T10:00:00Z"
      },
      {
        user: { name: "Marcus Chen", avatar: AVATARS.marcus },
        text: "Probably node-gyp native modules compiling issues. Try deleting node_modules and package-lock before running build.",
        timestamp: "2026-05-25T11:00:00Z"
      },
      {
        user: { name: "John Doe", avatar: AVATARS.john },
        text: "Yes, that did it. Clean build is passing. Pushed update to PR-406.",
        timestamp: "2026-05-25T12:00:00Z"
      }
    ]
  }
]
