"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Settings, 
  ShieldAlert, 
  GitPullRequest, 
  MessageSquare, 
  Terminal, 
  Database,
  Save,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react"

export default function SettingsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [githubPat, setGithubPat] = useState("")
  const [githubRepo, setGithubRepo] = useState("")
  const [linearApiKey, setLinearApiKey] = useState("")
  const [slackBotToken, setSlackBotToken] = useState("")
  
  const [dbInfo, setDbInfo] = useState({ connected: true, provider: "Loading..." })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  
  const [showGithub, setShowGithub] = useState(false)
  const [showLinear, setShowLinear] = useState(false)
  const [showSlack, setShowSlack] = useState(false)

  const userRole = (session?.user as any)?.role || "developer"
  const isManager = userRole === "manager"

  useEffect(() => {
    async function loadSettings() {
      if (sessionStatus !== "authenticated" || !isManager) {
        setLoading(false)
        return
      }

      try {
        const [settingsRes, dataRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/data")
        ])

        if (settingsRes.ok) {
          const settings = await settingsRes.json()
          setGithubPat(settings.githubPat || "")
          setGithubRepo(settings.githubRepo || "")
          setLinearApiKey(settings.linearApiKey || "")
          setSlackBotToken(settings.slackBotToken || "")
        }

        if (dataRes.ok) {
          const telemetry = await dataRes.json()
          setDbInfo(telemetry.dbStatus || { connected: true, provider: "Local File DB" })
        }
      } catch (err) {
        console.error("Failed to load settings from API", err)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [sessionStatus, isManager])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess("")
    setError("")

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubPat,
          githubRepo,
          linearApiKey,
          slackBotToken
        })
      })

      const data = await res.json()
      if (res.ok) {
        setSuccess("Dynamic integration credentials updated successfully!")
      } else {
        setError(data.error || "Failed to update configurations.")
      }
    } catch (err) {
      setError("An unexpected error occurred during database write.")
    } finally {
      setSaving(false)
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-accent-indigo border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">Initializing settings control panel...</p>
      </div>
    )
  }

  // RBAC Gating
  if (!isManager) {
    return (
      <div className="max-w-md mx-auto mt-16 space-y-6 text-center animate-fade-in-up">
        <div className="glass-panel p-8 rounded-2xl border border-accent-rose/25 bg-gradient-to-b from-[#090a0f] to-accent-rose/[0.02] space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent-rose/10 border border-accent-rose/20 flex items-center justify-center mx-auto shadow-lg shadow-accent-rose/10">
            <ShieldAlert className="w-8 h-8 text-accent-rose animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Access Locked</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your active session role context is <strong className="text-slate-200 uppercase font-bold">Developer</strong>.
              Integrating OAuth credentials and updating API configurations requires administrative permissions.
            </p>
          </div>
          <div className="text-[10px] text-slate-500 italic">
            Log out and sign in with a Manager credentials profile to modify these settings.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-accent-indigo animate-spin-slow" />
            Workspace Integrations Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure live API endpoints and persist authorization keys in PostgreSQL.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Forms (2/3) */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Active Integrations Config</h3>

            {success && (
              <div className="p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/25 text-accent-emerald text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            {error && (
              <div className="p-3.5 rounded-xl bg-accent-rose/10 border border-accent-rose/25 text-accent-rose text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* GitHub Config */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-accent-indigo">
                <GitPullRequest className="w-4.5 h-4.5" />
                <h4 className="text-xs font-bold text-slate-200">GitHub Repository Integration</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Repo (owner/repo)</label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="vercel/next.js"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/5 bg-black/40 text-xs text-slate-300 outline-none focus:border-accent-indigo/40"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Personal Access Token (PAT)</label>
                  <div className="relative">
                    <input
                      type={showGithub ? "text" : "password"}
                      value={githubPat}
                      onChange={(e) => setGithubPat(e.target.value)}
                      placeholder="github_pat_..."
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-white/5 bg-black/40 text-xs text-slate-300 outline-none focus:border-accent-indigo/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGithub(!showGithub)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showGithub ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 block leading-normal">Allows fetching live PR data. Requires read-only repository scope permissions.</span>
            </div>

            <hr className="border-white/5 my-4" />

            {/* Linear Config */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-accent-indigo">
                <Terminal className="w-4.5 h-4.5" />
                <h4 className="text-xs font-bold text-slate-200">Linear Project Tracker</h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Personal API Key</label>
                <div className="relative">
                  <input
                    type={showLinear ? "text" : "password"}
                    value={linearApiKey}
                    onChange={(e) => setLinearApiKey(e.target.value)}
                    placeholder="lin_api_..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-white/5 bg-black/40 text-xs text-slate-300 outline-none focus:border-accent-indigo/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLinear(!showLinear)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showLinear ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 block leading-normal">Allows fetching task summaries and statuses. Generate key in Linear Developer Settings.</span>
            </div>

            <hr className="border-white/5 my-4" />

            {/* Slack Config */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-accent-indigo">
                <MessageSquare className="w-4.5 h-4.5" />
                <h4 className="text-xs font-bold text-slate-200">Slack Chat Sync</h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bot User OAuth Token</label>
                <div className="relative">
                  <input
                    type={showSlack ? "text" : "password"}
                    value={slackBotToken}
                    onChange={(e) => setSlackBotToken(e.target.value)}
                    placeholder="xoxb-..."
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-white/5 bg-black/40 text-xs text-slate-300 outline-none focus:border-accent-indigo/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSlack(!showSlack)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showSlack ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 block leading-normal">Allows listening to conversation contexts. Requires channels:history and channels:read scopes.</span>
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-accent-indigo hover:bg-accent-indigo/90 disabled:bg-accent-indigo/40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-accent-indigo/15 cursor-pointer transition-all"
          >
            {saving ? (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Persist Credentials Config
              </>
            )}
          </button>
        </form>

        {/* Right Side: Information / DB status (1/3) */}
        <div className="space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-accent-indigo" />
              Database Registry
            </h3>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Database Engine</span>
                <span className="font-bold text-slate-200">{dbInfo.provider}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Status</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dbInfo.connected ? 'bg-accent-emerald glow-dot-emerald' : 'bg-accent-rose glow-dot-rose'}`}></span>
                  <span className={`font-semibold ${dbInfo.connected ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                    {dbInfo.connected ? "Operational" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal">
              Sprintopronto triggers automated migrations on start to seed users and integrations parameters. If a Postgres connection is not present in `.env.local`, a local JSON file-system database is loaded dynamically as a zero-setup fallback.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 className="text-sm font-bold text-white">API Security</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed leading-normal">
              Tokens are stored inside a secured backend table. In-app connections read directly from database sessions rather than environment variables, letting your team change watch targets dynamically on the fly.
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}
