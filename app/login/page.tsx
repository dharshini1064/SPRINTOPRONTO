"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Terminal, Shield, Lock, Mail, Users, ArrowRight } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/"
      })
      if (res?.error) {
        setError("Invalid email credentials or password.")
      }
    } catch (err: any) {
      setError("An unexpected error occurred during auth transaction.")
    } finally {
      setLoading(false)
    }
  }

  // Helper for quick logging in during demos
  const handleQuickLogin = async (role: "manager" | "developer") => {
    setError("")
    setLoading(true)
    const targetEmail = role === "manager" ? "manager@sprintopronto.ai" : "developer@sprintopronto.ai"
    
    try {
      await signIn("credentials", {
        email: targetEmail,
        password: "password",
        redirect: true,
        callbackUrl: "/"
      })
    } catch (err: any) {
      setError("Failed to sign in via quick link.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#090a0f] p-4 font-sans select-none overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-indigo/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-violet/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-in-up">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-indigo to-accent-violet flex items-center justify-center mx-auto shadow-lg shadow-accent-indigo/25">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Sprintopronto AI
          </h1>
          <p className="text-slate-400 text-xs font-medium">
            AI-powered operational intelligence for engineering teams
          </p>
        </div>

        {/* Credentials Form Box */}
        <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Sign In</h2>
            <p className="text-xs text-slate-500">Access your workspace control dashboard</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-accent-rose/10 border border-accent-rose/25 text-accent-rose text-xs font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@sprintopronto.ai"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-black/40 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-accent-indigo/40"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-black/40 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-accent-indigo/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 disabled:bg-accent-indigo/40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-accent-indigo/15 cursor-pointer mt-6 transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
              ) : (
                <>
                  Connect Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo logins divider */}
          <div className="relative my-4 flex items-center justify-center">
            <span className="absolute w-full h-[1px] bg-white/5"></span>
            <span className="relative px-3 bg-[#0d111c] text-[10px] uppercase font-bold text-slate-500 tracking-wider">Demo Control Switch</span>
          </div>

          {/* Quick login trigger buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickLogin("manager")}
              disabled={loading}
              className="p-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-accent-indigo/10 border border-white/5 hover:border-accent-indigo/25 text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer group"
            >
              <span className="text-[8px] font-extrabold uppercase text-accent-indigo tracking-wider block">RBAC: Admin Role</span>
              <span className="text-[11px] font-bold block mt-0.5">John Manager</span>
              <span className="text-[9px] text-slate-500 block group-hover:text-slate-400">manager@sprintopronto.ai</span>
            </button>

            <button
              onClick={() => handleQuickLogin("developer")}
              disabled={loading}
              className="p-3 py-2.5 rounded-xl bg-white/[0.02] hover:bg-accent-indigo/10 border border-white/5 hover:border-accent-indigo/25 text-left text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer group"
            >
              <span className="text-[8px] font-extrabold uppercase text-accent-indigo tracking-wider block">RBAC: Developer Role</span>
              <span className="text-[11px] font-bold block mt-0.5">Alex Developer</span>
              <span className="text-[9px] text-slate-500 block group-hover:text-slate-400">developer@sprintopronto.ai</span>
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-600">
          Default sign-in password: <span className="font-mono text-slate-500">password</span>. Enforced by next-auth middleware.
        </div>
      </div>
    </div>
  )
}
