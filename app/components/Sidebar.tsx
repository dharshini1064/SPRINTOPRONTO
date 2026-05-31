"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Sparkles, AlertOctagon, Terminal, Activity, RefreshCw, LogOut, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ health: 100, isGroq: false })

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/data")
      const data = await res.json()
      
      // Check if chat route has groq config
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "test_status" })
      })
      const chatData = await chatRes.json()

      setStatus({
        health: data.summary.healthPercent || 100,
        isGroq: chatData.mode === "groq-ai"
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "AI Command Center", href: "/chat", icon: Sparkles },
    { name: "Incident View", href: "/incidents", icon: AlertOctagon },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/5 flex flex-col justify-between z-30">
      <div>
        {/* Brand Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-indigo to-accent-violet flex items-center justify-center shadow-lg shadow-accent-indigo/20">
            <Terminal className="w-5 h-5 text-white animate-pulse-glow" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Sprintopronto AI
            </h1>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
              Ops Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-accent-indigo/15 to-accent-violet/10 text-white border border-accent-indigo/25 shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-accent-indigo" : "text-slate-400 group-hover:text-white"
                  }`}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex flex-col">
        {/* User Session Profile Panel */}
        {session?.user && (
          <div className="p-4 border-t border-white/5 bg-black/10 flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={(session.user as any).avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                className="w-8 h-8 rounded-lg border border-white/10 shrink-0"
                alt={session.user.name || "User"}
              />
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-slate-200 block truncate leading-none">
                  {session.user.name}
                </span>
                <span className="text-[9px] font-extrabold text-accent-indigo uppercase tracking-wider block mt-1">
                  {(session.user as any).role || "Developer"}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-accent-rose transition-colors cursor-pointer shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Telemetry Status Panel */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-accent-indigo" />
              <span className="text-xs font-semibold text-slate-300">Telemetry Status</span>
            </div>
            <button 
              onClick={fetchStatus} 
              disabled={loading}
              className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-2 mt-3">
            {/* Sprint Health indicator */}
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Sprint Health</span>
              <span className={`font-semibold ${status.health > 80 ? 'text-accent-emerald' : status.health > 50 ? 'text-accent-amber' : 'text-accent-rose'}`}>
                {status.health}%
              </span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  status.health > 80 ? 'bg-accent-emerald' : status.health > 50 ? 'bg-accent-amber' : 'bg-accent-rose'
                }`}
                style={{ width: `${status.health}%` }}
              ></div>
            </div>

            {/* AI engine indicator */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 mt-2">
              <span className="text-slate-400">AI Client</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${status.isGroq ? 'bg-accent-indigo glow-dot-indigo' : 'bg-accent-amber glow-dot-amber'}`}></span>
                <span className="font-medium text-slate-300">
                  {status.isGroq ? "Groq (Llama3)" : "Local Hybrid"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
