"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { 
  AlertTriangle, 
  GitPullRequest, 
  MessageSquare, 
  Cpu, 
  CheckCircle, 
  ShieldAlert, 
  Users, 
  ChevronRight, 
  Play, 
  ArrowRight,
  Database,
  Terminal,
  ExternalLink
} from "lucide-react"

type Incident = {
  id: string
  title: string
  ticketId: string
  status: "blocked" | "resolved"
  severity: "critical" | "high"
  assignee: string
  assigneeAvatar: string
  project: string
  rootCause: string
  mitigationName: string
  mitigationDesc: string
  steps: {
    title: string
    code: string
    status: "blocked" | "resolved"
    desc: string
    owner: string
  }[]
  pr: {
    id: string
    title: string
    author: string
    authorAvatar: string
    reviewer: string
    reviewerAvatar: string
    pendingHours: number
    status: string
  }
  slack: {
    channel: string
    messages: {
      user: string
      avatar: string
      text: string
      time: string
    }[]
  }
}

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "inc-103",
    title: "Onboarding Flow UI Delay",
    ticketId: "LIN-103",
    status: "blocked",
    severity: "critical",
    assignee: "Alex Rivera",
    assigneeAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    project: "Core App",
    rootCause: "Active database connections from WS memory leak are locking DDL migration scripts, blocking API endpoints.",
    mitigationName: "Execute pg_terminate_backend (Clear WS locks)",
    mitigationDesc: "Dispatches a script to drop stale client sockets and terminates active SQL queries, freeing tables for Sarah's database migration.",
    steps: [
      {
        title: "WebSocket Connection Memory Leak (Root Trigger)",
        code: "LIN-108",
        status: "blocked",
        desc: "WS server leaks socket descriptors on client disconnect, leaving database connection pools fully locked.",
        owner: "John Doe"
      },
      {
        title: "PostgreSQL Database Schema Lock (System Lock)",
        code: "LIN-102",
        status: "blocked",
        desc: "DDL migrations on workspace_settings table are waiting for locks to release, locking all DB tables.",
        owner: "Sarah Jenkins"
      },
      {
        title: "Onboarding Flow UI Steps (Blocked Product)",
        code: "LIN-103",
        status: "blocked",
        desc: "Workspace signup step fails with API 500 error because the table workspace_settings does not exist yet.",
        owner: "Alex Rivera"
      }
    ],
    pr: {
      id: "PR-402",
      title: "feat: onboard-steps component flow",
      author: "Alex Rivera",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
      reviewer: "John Doe",
      reviewerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      pendingHours: 52,
      status: "review_pending"
    },
    slack: {
      channel: "onboarding-delay",
      messages: [
        {
          user: "Alex Rivera",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
          text: "The onboarding steps PR has been waiting for John's review for 2 days. The API is returning 500s.",
          time: "09:00 AM"
        },
        {
          user: "John Doe",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          text: "I am looking into a WS heap memory leak. The connections to database are not closing properly.",
          time: "10:15 AM"
        },
        {
          user: "Sarah Jenkins",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
          text: "Yes, I am working on migrations but transaction deadlock lock is held by some active developer WS sessions.",
          time: "01:10 PM"
        }
      ]
    }
  },
  {
    id: "inc-106",
    title: "Stripe Billing checkout Failure",
    ticketId: "LIN-106",
    status: "blocked",
    severity: "high",
    assignee: "Elena Rostova",
    assigneeAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    project: "Billing",
    rootCause: "Fastify parses incoming stripe webhooks request body to JSON, breaking the cryptography raw signature verification checks.",
    mitigationName: "Inject Webhook raw-body parser override",
    mitigationDesc: "Configures raw-body buffer collection on Fastify router for the /webhooks/stripe endpoint, unblocking signature calculations.",
    steps: [
      {
        title: "Fastify Request Pre-Parser Hook (Root Trigger)",
        code: "FASTIFY-API",
        status: "blocked",
        desc: "API gateway parses every webhook route to JSON, stripping raw signature crypt bytes.",
        owner: "Marcus Chen"
      },
      {
        title: "Stripe Webhook Verification Error (System Lock)",
        code: "STRIPE-WEBHOOK",
        status: "blocked",
        desc: "Signature validation fails, throwing 400 Bad Request and aborting payment processing.",
        owner: "Elena Rostova"
      },
      {
        title: "Integrate Stripe Checkout Payment (Blocked Product)",
        code: "LIN-106",
        status: "blocked",
        desc: "Billing tier upgrade dashboard tests are stuck because webhook events are failing validation.",
        owner: "Elena Rostova"
      }
    ],
    pr: {
      id: "PR-405",
      title: "feat: add stripe checkout integration",
      author: "Elena Rostova",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      reviewer: "Marcus Chen",
      reviewerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      pendingHours: 57,
      status: "review_pending"
    },
    slack: {
      channel: "stripe-integration",
      messages: [
        {
          user: "Elena Rostova",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
          text: "Stripe webhooks are throwing signature validation errors. Blocking sandbox purchases.",
          time: "Yesterday"
        },
        {
          user: "Marcus Chen",
          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
          text: "Are you using raw-body buffer checks? Fastify parses to JSON by default. That breaks Stripe's SDK validations.",
          time: "Yesterday"
        }
      ]
    }
  }
]

export default function Incidents() {
  const { data: session } = useSession()
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS)
  const [activeTab, setActiveTab] = useState<string>("inc-103")
  const [resolving, setResolving] = useState<boolean>(false)
  const [resolveSuccess, setResolveSuccess] = useState<boolean>(false)
  const [pinged, setPinged] = useState<boolean>(false)

  const userRole = (session?.user as any)?.role || "developer"
  const isManager = userRole === "manager"

  const activeInc = incidents.find(inc => inc.id === activeTab) || incidents[0]

  const handleResolve = () => {
    setResolving(true)
    
    // Simulate auto-mitigation
    setTimeout(() => {
      setIncidents(prev => prev.map(inc => {
        if (inc.id === activeTab) {
          return {
            ...inc,
            status: "resolved",
            steps: inc.steps.map(step => ({ ...step, status: "resolved" })),
            pr: { ...inc.pr, status: "merged" }
          }
        }
        return inc
      }))
      setResolving(false)
      setResolveSuccess(true)
    }, 2000)
  }

  const handlePingReviewer = () => {
    setPinged(true)
    setTimeout(() => setPinged(false), 3000)
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-accent-rose tracking-wider uppercase">Sprint Diagnostic Room</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Incident Control Room</h2>
          <p className="text-slate-400 text-sm mt-1">Isolate and mitigate cascading blockers across your systems.</p>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-white/5 gap-2">
        {incidents.map(inc => (
          <button
            key={inc.id}
            onClick={() => {
              setActiveTab(inc.id)
              setResolveSuccess(false)
            }}
            className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === inc.id
                ? "border-accent-indigo text-white bg-white/[0.01]"
                : "border-transparent text-slate-500 hover:text-slate-300"
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${inc.status === "resolved" ? "text-accent-emerald" : inc.severity === "critical" ? "text-accent-rose animate-pulse" : "text-accent-amber"}`} />
            {inc.title} ({inc.ticketId})
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
              inc.status === "resolved"
                ? "bg-accent-emerald/10 text-accent-emerald"
                : inc.severity === "critical"
                  ? "bg-accent-rose/10 text-accent-rose"
                  : "bg-accent-amber/10 text-accent-amber"
            }`}>
              {inc.status === "resolved" ? "Resolved" : "Active Blocker"}
            </span>
          </button>
        ))}
      </div>

      {/* CORE CONTROL AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Pipeline & Steps (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Diagnostic overview */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-accent-indigo" />
              Incident Root Cause Telemetry
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-black/25 p-4 rounded-xl border border-white/5 font-medium">
              &ldquo;{activeInc.rootCause}&rdquo;
            </p>
          </div>

          {/* Interactive Cascade Tree */}
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-accent-indigo" />
              Cascading Dependency Tree
            </h3>

            <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/5">
              
              {activeInc.steps.map((step, idx) => {
                const isBlocked = step.status === "blocked"
                return (
                  <div key={idx} className="relative space-y-2 animate-fade-in-up">
                    {/* Node Dot indicator */}
                    <span className={`absolute -left-5 top-1.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      !isBlocked 
                        ? "bg-[#090a0f] border-accent-emerald glow-dot-emerald scale-110" 
                        : idx === 0 
                          ? "bg-[#090a0f] border-accent-rose glow-dot-rose animate-pulse" 
                          : "bg-[#090a0f] border-accent-amber"
                    }`}>
                      {!isBlocked && <CheckCircle className="w-2.5 h-2.5 text-accent-emerald" />}
                    </span>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-white/5 rounded border border-white/5 text-slate-300">
                          Step {idx + 1}: {step.code}
                        </span>
                        <span className="text-xs text-slate-400">&bull; Owner: {step.owner}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        !isBlocked 
                          ? "bg-accent-emerald/10 text-accent-emerald" 
                          : idx === 0 
                            ? "bg-accent-rose/10 text-accent-rose font-extrabold uppercase animate-pulse" 
                            : "bg-accent-amber/10 text-accent-amber"
                      }`}>
                        {!isBlocked ? "Resolved" : idx === 0 ? "Root Blocker" : "Indirect Blocked"}
                      </span>
                    </div>

                    <div className={`p-4 rounded-xl border transition-all duration-500 ${
                      !isBlocked 
                        ? "bg-accent-emerald/5 border-accent-emerald/20" 
                        : idx === 0 
                          ? "bg-accent-rose/5 border-accent-rose/20" 
                          : "bg-white/[0.01] border-white/5"
                    }`}>
                      <h4 className={`text-xs font-bold ${!isBlocked ? "text-accent-emerald" : "text-slate-200"}`}>{step.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{step.desc}</p>
                    </div>
                  </div>
                )
              })}

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PR, Slack Threads, Actions (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* MITIGATION SANDBOX PANEL */}
          <div className="glass-panel p-6 rounded-2xl border border-accent-indigo/15 bg-gradient-to-tr from-slate-950 via-slate-900 to-accent-indigo/[0.03] space-y-4">
            <div className="flex items-center gap-2 text-accent-indigo">
              <Cpu className="w-5 h-5 animate-pulse" />
              <h3 className="text-base font-bold text-white">Auto-Mitigation Engine</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-normal">
              Sprintopronto detects operational bottlenecks and loads executable mitigation blueprints:
            </p>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo glow-dot-indigo"></span>
                {activeInc.mitigationName}
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal">{activeInc.mitigationDesc}</p>
            </div>

            {activeInc.status === "resolved" || resolveSuccess ? (
              <div className="p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center gap-3 text-accent-emerald text-xs font-semibold animate-fade-in-up">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <div>
                  Mitigation completed successfully! System connection pools flushed. Migration applied.
                </div>
              </div>
            ) : !isManager ? (
              <div className="p-3.5 rounded-xl bg-accent-rose/10 border border-accent-rose/25 text-accent-rose text-xs font-semibold flex items-center gap-2 animate-fade-in-up">
                <ShieldAlert className="w-5 h-5 shrink-0 animate-bounce" />
                <div>
                  Auto-Mitigation is locked. Your active role context ({userRole}) does not have administrative rights.
                </div>
              </div>
            ) : (
              <button
                onClick={handleResolve}
                disabled={resolving}
                className="w-full py-3 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 disabled:bg-accent-indigo/40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-accent-indigo/10 cursor-pointer"
              >
                {resolving ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
                    Executing mitigation script...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Deploy Automated Mitigation
                  </>
                )}
              </button>
            )}
          </div>

          {/* LINKED PR CARD */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-accent-indigo" />
              Associated Pull Request
            </h3>

            <div className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold font-mono text-accent-amber">{activeInc.pr.id}</span>
                  <h4 className="text-xs font-bold text-slate-200">{activeInc.pr.title}</h4>
                </div>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  activeInc.pr.status === "merged" 
                    ? "bg-accent-emerald/10 text-accent-emerald" 
                    : "bg-accent-amber/10 text-accent-amber animate-pulse"
                }`}>
                  {activeInc.pr.status === "merged" ? "Merged" : "Review Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-white/5 pt-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <img src={activeInc.pr.authorAvatar} className="w-4 h-4 rounded-full border border-white/10" alt={activeInc.pr.author} />
                    <span className="text-slate-400">{activeInc.pr.author}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600" />
                  <div className="flex items-center gap-1.5">
                    <img src={activeInc.pr.reviewerAvatar} className="w-4 h-4 rounded-full border border-white/10" alt={activeInc.pr.reviewer} />
                    <span className="text-slate-400">{activeInc.pr.reviewer}</span>
                  </div>
                </div>
                <span className="text-slate-500 font-mono text-[10px]">{activeInc.pr.pendingHours}h old</span>
              </div>
            </div>

            {activeInc.pr.status !== "merged" && (
              <button 
                onClick={handlePingReviewer}
                className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {pinged ? "Review Reminder Sent to Slack ✅" : `Send Ping to @${activeInc.pr.reviewer}`}
              </button>
            )}
          </div>

          {/* LINKED SLACK CONVERSATION */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent-indigo" />
                Linked Slack Conversation
              </h3>
              <span className="text-[10px] font-bold text-accent-indigo font-mono bg-accent-indigo/10 border border-accent-indigo/20 px-2 py-0.5 rounded">
                #{activeInc.slack.channel}
              </span>
            </div>

            <div className="space-y-3 bg-black/25 p-4 rounded-xl border border-white/5 max-h-[220px] overflow-y-auto pr-1">
              {activeInc.slack.messages.map((msg, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs border-b border-white/[0.02] last:border-none pb-2 last:pb-0">
                  <img src={msg.avatar} className="w-5.5 h-5.5 rounded border border-white/10 shrink-0 mt-0.5" alt={msg.user} />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{msg.user}</span>
                      <span className="text-[9px] text-slate-500">{msg.time}</span>
                    </div>
                    <p className="text-slate-400 leading-normal text-[11px]">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
