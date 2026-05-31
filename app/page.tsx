"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  AlertTriangle, 
  GitPullRequest, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  ArrowRight,
  TrendingUp,
  Users,
  Compass,
  Sparkles
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts"
import { SprintSummary, WorkItem, PullRequest, SlackThread } from "@/lib/types"

// Fake data for the Activity Timeline
const timelineData = [
  { name: "Mon", "PRs Merged": 1, "Tickets Closed": 2, "Slack Threads": 4 },
  { name: "Tue", "PRs Merged": 3, "Tickets Closed": 1, "Slack Threads": 7 },
  { name: "Wed", "PRs Merged": 2, "Tickets Closed": 3, "Slack Threads": 5 },
  { name: "Thu", "PRs Merged": 0, "Tickets Closed": 1, "Slack Threads": 8 },
  { name: "Fri", "PRs Merged": 4, "Tickets Closed": 4, "Slack Threads": 12 },
  { name: "Sat", "PRs Merged": 1, "Tickets Closed": 2, "Slack Threads": 3 },
  { name: "Sun", "PRs Merged": 2, "Tickets Closed": 1, "Slack Threads": 6 },
]

export default function Dashboard() {
  const [data, setData] = useState<{
    tickets: WorkItem[]
    prs: PullRequest[]
    threads: SlackThread[]
    summary: SprintSummary
  } | null>(null)
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/data")
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Failed to load dashboard telemetry", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-accent-indigo border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">Retrieving correlated operational intelligence...</p>
      </div>
    )
  }

  const { summary, tickets, prs, threads } = data

  // Color mapping based on risk level
  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-accent-rose bg-accent-rose/10 border-accent-rose/25"
      case "medium": return "text-accent-amber bg-accent-amber/10 border-accent-amber/25"
      default: return "text-accent-indigo bg-accent-indigo/10 border-accent-indigo/25"
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-accent-indigo tracking-wider uppercase">Active Sprint Progress</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1 text-white">Sprint Operations Board</h2>
          <p className="text-slate-400 text-sm mt-1">Cross-referencing telemetry from Linear, GitHub, and Slack channels.</p>
        </div>
        <Link 
          href="/chat"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-indigo to-accent-violet hover:from-accent-indigo/90 hover:to-accent-violet/90 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-accent-indigo/25 border border-white/10 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          Ask Sprintopronto AI
        </Link>
      </div>

      {/* TOP ROW: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Widget 1: Sprint Health */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Sprint Health</span>
            <span className="text-4xl font-extrabold text-white tracking-tight">{summary.healthPercent}%</span>
            <span className="text-[11px] text-accent-emerald flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              Optimal completion SLA
            </span>
          </div>
          {/* Custom SVG Radial Ring */}
          <div className="relative w-18 h-18">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/5"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-accent-indigo transition-all duration-1000 ease-out"
                strokeDasharray={`${summary.healthPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-300">{summary.healthPercent}%</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Risk Score */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Risk Score</span>
              <span className="text-4xl font-extrabold text-white tracking-tight">{summary.riskScore}<span className="text-lg text-slate-500 font-normal">/100</span></span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
              summary.riskScore > 60 
                ? "text-accent-rose bg-accent-rose/10 border-accent-rose/25" 
                : summary.riskScore > 30 
                  ? "text-accent-amber bg-accent-amber/10 border-accent-amber/25" 
                  : "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/25"
            }`}>
              {summary.riskScore > 60 ? "Elevated" : summary.riskScore > 30 ? "Moderate" : "Low Risk"}
            </span>
          </div>
          {/* Visual Gauge slider */}
          <div className="mt-4 space-y-1">
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  summary.riskScore > 60 ? 'bg-accent-rose' : summary.riskScore > 30 ? 'bg-accent-amber' : 'bg-accent-emerald'
                }`}
                style={{ width: `${summary.riskScore}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-slate-500 block">Based on blocked items & stale reviewers</span>
          </div>
        </div>

        {/* Widget 3: Blocked Tickets */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:border-accent-rose/20 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Blocked Tickets</span>
            <span className="text-4xl font-extrabold text-accent-rose tracking-tight">{summary.blockedTicketsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-1">2 critical path hold-ups</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-rose/10 border border-accent-rose/25 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-accent-rose" />
          </div>
        </div>

        {/* Widget 4: Stale PRs */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:border-accent-amber/20 transition-all">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Stale Pull Requests</span>
            <span className="text-4xl font-extrabold text-accent-amber tracking-tight">{summary.stalePrsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-1">Review pending &gt; 48 hours</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-amber/10 border border-accent-amber/25 flex items-center justify-center">
            <GitPullRequest className="w-6 h-6 text-accent-amber" />
          </div>
        </div>

      </div>

      {/* MIDDLE ROW: Activity Chart & AI Insights Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Chart Column (8/12) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Sprint Activity Timeline</h3>
              <p className="text-xs text-slate-400">Coordinating operations output trends across channels</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-accent-indigo/60"></span>
                PRs Merged
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-accent-violet/60"></span>
                Tickets Closed
              </span>
            </div>
          </div>
          
          <div className="h-72 w-full text-slate-300">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: "rgba(9, 10, 15, 0.95)", 
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px"
                  }} 
                />
                <Area type="monotone" dataKey="PRs Merged" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPr)" />
                <Area type="monotone" dataKey="Tickets Closed" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Feed Column (4/12) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-indigo animate-pulse" />
                AI Insights Feed
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Real-time</span>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {summary.risks.slice(0, 3).map((risk) => (
                <div 
                  key={risk.id}
                  className={`p-3.5 rounded-xl border glass-panel-hover flex gap-3 ${getRiskColor(risk.level)}`}
                >
                  <div className="mt-0.5">
                    {risk.level === "high" ? (
                      <AlertCircle className="w-4 h-4 text-accent-rose" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-accent-amber" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">{risk.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed leading-normal line-clamp-2">
                      {risk.description}
                    </p>
                    <div className="flex gap-2 pt-1.5 items-center">
                      <Link 
                        href="/incidents" 
                        className="text-[10px] font-semibold text-white/80 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        Diagnose
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/chat"
            className="w-full mt-4 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-center text-xs text-slate-300 hover:text-white font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            Review all correlated telemetry in Chat
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* BOTTOM ROW: Workspace Overview (Tickets & PRs) & Suggested Actions Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table/Items list (8/12) */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Active Blockers & Stale Pull Requests</h3>
              <p className="text-xs text-slate-400">High priority bottlenecks needing attention</p>
            </div>
            <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
              {tickets.filter(t => t.status === "blocked").length} Blocked Tickets &bull; {prs.filter(p => p.isStale).length} Stale PRs
            </span>
          </div>

          <div className="space-y-3">
            {/* List of critical blocked tickets */}
            {tickets.filter(t => t.status === "blocked").map(ticket => {
              const linkedPr = prs.find(p => p.linkedIssue === ticket.id)
              const relatedSlack = threads.find(s => s.relatedIssue === ticket.id)
              return (
                <div key={ticket.id} className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-accent-rose bg-accent-rose/10 px-2 py-0.5 rounded border border-accent-rose/20">
                        {ticket.id}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-200 hover:text-accent-indigo transition-colors">
                        <Link href="/incidents">{ticket.title}</Link>
                      </h4>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <img src={ticket.assignee.avatar} className="w-4 h-4 rounded-full border border-white/10" alt={ticket.assignee.name} />
                        {ticket.assignee.name}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span>Project: <strong className="text-slate-300 font-medium">{ticket.project}</strong></span>
                      {linkedPr && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          <span className="flex items-center gap-1 text-accent-amber font-medium">
                            <GitPullRequest className="w-3.5 h-3.5" />
                            PR Linked ({linkedPr.id})
                          </span>
                        </>
                      )}
                      {relatedSlack && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                          <span className="flex items-center gap-1 text-accent-indigo font-medium">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Slack Thread (#{relatedSlack.channel})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-accent-rose/10 border border-accent-rose/20 text-[10px] font-extrabold uppercase rounded text-accent-rose animate-pulse">
                      Blocked
                    </span>
                    <Link 
                      href="/incidents"
                      className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/5"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}

            {/* List of other Stale PRs not associated with blocked tickets */}
            {prs.filter(p => p.isStale && !tickets.some(t => t.id === p.linkedIssue && t.status === "blocked")).slice(0, 2).map(pr => (
              <div key={pr.id} className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded border border-accent-amber/20">
                      {pr.id}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-200">
                      {pr.title}
                    </h4>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <img src={pr.author.avatar} className="w-4 h-4 rounded-full border border-white/10" alt={pr.author.name} />
                      Opened by {pr.author.name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span className="text-accent-rose font-medium">Review Pending: {pr.reviewPendingHours}h</span>
                    {pr.reviewer && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                        <span className="flex items-center gap-1">
                          <img src={pr.reviewer.avatar} className="w-4 h-4 rounded-full border border-white/10" alt={pr.reviewer.name} />
                          Reviewer: {pr.reviewer.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-accent-amber/10 border border-accent-amber/20 text-[10px] font-extrabold uppercase rounded text-accent-amber">
                    Stale Review
                  </span>
                  <Link 
                    href="/chat"
                    className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/5"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Actions Sidebar Column (4/12) */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Suggested Actions</h3>
              <p className="text-xs text-slate-400">Recommended operational resolutions</p>
            </div>

            <div className="space-y-3">
              {summary.suggestedActions.slice(0, 4).map((action) => (
                <div 
                  key={action.id}
                  className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors flex items-start gap-2.5 group"
                >
                  <span className="w-5 h-5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center text-[10px] font-bold text-accent-indigo mt-0.5 group-hover:bg-accent-indigo group-hover:text-white transition-all">
                    &bull;
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300 leading-normal">
                      {action.text}
                    </p>
                    {action.actionableId && (
                      <Link 
                        href={action.actionableType === "ticket" ? "/incidents" : `/chat?q=${encodeURIComponent(action.text)}`}
                        className="text-[10px] font-semibold text-accent-indigo hover:underline block"
                      >
                        Take action {action.actionableType === "pr" ? "on PR" : action.actionableType === "slack" ? "in Slack" : "on incident"} &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-4 border-t border-white/5">
            Operational recommendations sync continuously with GitHub, Slack & Linear hooks.
          </div>
        </div>

      </div>

    </div>
  )
}
