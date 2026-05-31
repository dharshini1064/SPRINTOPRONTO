"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  Sparkles, 
  Send, 
  Terminal, 
  Cpu, 
  ArrowRight, 
  User, 
  Bot, 
  AlertTriangle, 
  FileText,
  AlertCircle,
  GitPullRequest,
  Clock
} from "lucide-react"

// Typing speed configuration for streaming simulation
const TYPING_SPEED_MS = 8

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
  mode?: "groq-ai" | "local-hybrid"
}

// Custom parser to replace markdown and links with highlighted UI elements
function RenderFormattedText({ text }: { text: string }) {
  if (!text) return null

  // Convert markdown-style sections
  const lines = text.split("\n")
  return (
    <div className="space-y-3">
      {lines.map((line, idx) => {
        let content = line.trim()
        
        // Headers
        if (content.startsWith("###")) {
          return <h3 key={idx} className="text-sm font-extrabold text-white mt-4 border-b border-white/5 pb-1 uppercase tracking-wider">{content.replace("###", "").trim()}</h3>
        }
        if (content.startsWith("####")) {
          return <h4 key={idx} className="text-xs font-bold text-accent-indigo mt-3">{content.replace("####", "").trim()}</h4>
        }
        
        // Unordered lists
        let isBullet = false
        if (content.startsWith("*") || content.startsWith("-")) {
          isBullet = true
          content = content.substring(1).trim()
        }

        // Process inline entities: [LIN-XXX](...) or [PR-XXX](...)
        // We will match [LIN-103](...) and replace it with a styled tag
        const entityRegex = /\[(LIN-\d+|PR-\d+)\]\([^)]+\)/g
        const parts = []
        let lastIndex = 0
        let match

        while ((match = entityRegex.exec(content)) !== null) {
          const textBefore = content.substring(lastIndex, match.index)
          if (textBefore) parts.push(textBefore)

          const entityId = match[1]
          parts.push(
            <span 
              key={match.index} 
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold border mx-0.5 transition-colors cursor-pointer ${
                entityId.startsWith("LIN") 
                  ? "bg-accent-indigo/10 border-accent-indigo/35 text-accent-indigo hover:bg-accent-indigo/20" 
                  : "bg-accent-amber/10 border-accent-amber/35 text-accent-amber hover:bg-accent-amber/20"
              }`}
              onClick={() => {
                // If clicked, we can navigate to incidents
                window.location.href = "/incidents"
              }}
            >
              {entityId.startsWith("LIN") ? <AlertCircle className="w-3 h-3" /> : <GitPullRequest className="w-3 h-3" />}
              {entityId}
            </span>
          )
          lastIndex = entityRegex.lastIndex
        }

        const textAfter = content.substring(lastIndex)
        if (textAfter) parts.push(textAfter)

        // Process markdown bold (**text**)
        const boldParts: React.ReactNode[] = []
        parts.forEach((part, pIdx) => {
          if (typeof part === "string") {
            const boldRegex = /\*\*([^*]+)\*\*/g
            let bLastIdx = 0
            let bMatch
            const bParts = []

            while ((bMatch = boldRegex.exec(part)) !== null) {
              const bBefore = part.substring(bLastIdx, bMatch.index)
              if (bBefore) bParts.push(bBefore)
              bParts.push(<strong key={bMatch.index} className="font-semibold text-white">{bMatch[1]}</strong>)
              bLastIdx = boldRegex.lastIndex
            }
            const bAfter = part.substring(bLastIdx)
            if (bAfter) bParts.push(bAfter)
            
            boldParts.push(...bParts)
          } else {
            boldParts.push(part)
          }
        })

        // Process inline code block (`code`)
        const finalParts: React.ReactNode[] = []
        boldParts.forEach((part, cIdx) => {
          if (typeof part === "string") {
            const codeRegex = /`([^`]+)`/g
            let cLastIdx = 0
            let cMatch
            const cParts = []

            while ((cMatch = codeRegex.exec(part)) !== null) {
              const cBefore = part.substring(cLastIdx, cMatch.index)
              if (cBefore) cParts.push(cBefore)
              cParts.push(
                <code key={cMatch.index} className="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 font-mono text-xs text-accent-cyan">
                  {cMatch[1]}
                </code>
              )
              cLastIdx = codeRegex.lastIndex
            }
            const cAfter = part.substring(cLastIdx)
            if (cAfter) cParts.push(cAfter)

            finalParts.push(...cParts)
          } else {
            finalParts.push(part)
          }
        })

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 pl-4">
              <span className="text-accent-indigo font-bold mt-0.5">&bull;</span>
              <span className="leading-relaxed">{finalParts.length > 0 ? finalParts : line}</span>
            </div>
          )
        }

        // Render diagram blocks nicely
        if (content.startsWith("graph TD") || content.startsWith("style")) {
          // Skip raw mermaid script text rendering to keep it clean (since we have static mermaid display)
          return null
        }
        if (content.startsWith("```mermaid") || content.startsWith("```")) {
          return null
        }

        return (
          <p key={idx} className="text-xs text-slate-300 leading-relaxed min-h-[1em]">
            {finalParts.length > 0 ? finalParts : line}
          </p>
        )
      })}

      {/* Render flowchart manually for onboarding delay for visual polish */}
      {text.includes("graph TD") && (
        <div className="my-5 p-4 rounded-xl border border-white/5 bg-black/35 flex flex-col items-center gap-3">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dependency Corroboration Flow</span>
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-accent-rose/10 border border-accent-rose/30 text-accent-rose font-bold font-mono">
              WS Connection Leak (LIN-108)
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div className="px-3 py-1.5 rounded-lg bg-accent-amber/10 border border-accent-amber/30 text-accent-amber font-semibold font-mono">
              Postgres Schema Deadlock (LIN-102)
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div className="px-3 py-1.5 rounded-lg bg-accent-rose/25 border border-accent-rose/50 text-white font-bold font-mono shadow-lg shadow-accent-rose/10">
              Blocked Onboarding Flow (LIN-103)
            </div>
          </div>
          <div className="text-[10px] text-slate-400 text-center italic mt-1">
            Also blocked by review on PR-402 pending review by John Doe for 52 hours.
          </div>
        </div>
      )}
    </div>
  )
}

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `### Welcome to Sprintopronto AI Command Center 🛰️

I am your engineering operations intelligence assistant. I scan Linear issues, pull requests, and Slack conversations to expose blockers and help your team ship faster.

**Try asking one of our demo queries:**
* *"Why is onboarding delayed?"* — Detects the cascading blockers.
* *"Generate today's standup"* — Summarizes achievements, plans, and blockers.
* *"Which sprint items are risky?"* — Shows the risk scorecard.`,
      mode: "local-hybrid"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Suggestion chips mapping
  const suggestions = [
    { text: "Why is onboarding delayed?", icon: AlertTriangle, label: "Blockers" },
    { text: "Generate today's standup", icon: FileText, label: "Standup" },
    { text: "Which sprint items are risky?", icon: Clock, label: "Risks" }
  ]

  // Check URL query parameters
  useEffect(() => {
    const queryParam = searchParams.get("q")
    if (queryParam) {
      handleSend(queryParam)
      // Clear query parameter from URL
      router.replace("/chat")
    }
  }, [searchParams])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate streaming response text
  const simulateStreaming = (finalText: string, messageId: string, mode: "groq-ai" | "local-hybrid") => {
    let currentText = ""
    let charIdx = 0

    const interval = setInterval(() => {
      if (charIdx < finalText.length) {
        currentText += finalText[charIdx]
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: currentText, isStreaming: true }
            : msg
        ))
        charIdx += 8 // Print 8 chars at a time to keep it snappy but look animated
      } else {
        clearInterval(interval)
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: finalText, isStreaming: false, mode }
            : msg
        ))
      }
    }, TYPING_SPEED_MS)
  }

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const userMessageId = `msg-${Date.now()}-user`
    const aiMessageId = `msg-${Date.now()}-ai`

    const userMsg: Message = {
      id: userMessageId,
      role: "user",
      content: textToSend
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    // Add temporary empty assistant message
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: "assistant",
      content: "...",
      isStreaming: true
    }])

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      })

      const data = await res.json()
      
      if (data.response) {
        simulateStreaming(data.response, aiMessageId, data.mode)
      } else {
        throw new Error("Invalid API response format")
      }

    } catch (e: any) {
      console.error(e)
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              content: `### ❌ API Connection Error\n\nFailed to reach the AI routing node. Error details: \`${e.message}\`. Please check that your server is running.`,
              isStreaming: false
            }
          : msg
      ))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col justify-between max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-accent-indigo animate-pulse" />
            AI Command Center
          </h2>
          <p className="text-xs text-slate-400">Interrogate correlated developer signals instantly.</p>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-thin pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === "user"
          return (
            <div 
              key={msg.id} 
              className={`flex gap-4 p-5 rounded-2xl border transition-all ${
                isUser 
                  ? "chat-bubble-user ml-12 border-accent-indigo/10 shadow-inner" 
                  : "chat-bubble-ai mr-12 border-white/5"
              }`}
            >
              {/* Avatar Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isUser 
                  ? "bg-accent-indigo/10 border-accent-indigo/30 text-accent-indigo" 
                  : "bg-white/5 border-white/10 text-slate-300"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-accent-indigo animate-pulse" />}
              </div>

              {/* Text rendering */}
              <div className="flex-1 space-y-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isUser ? "You" : "Sprintopronto AI"}
                  </span>
                  
                  {!isUser && msg.mode && (
                    <span className="text-[9px] text-slate-500 font-medium px-2 py-0.5 bg-white/5 rounded border border-white/5">
                      Mode: {msg.mode === "groq-ai" ? "Groq (Llama 3)" : "Local Hybrid Engine"}
                    </span>
                  )}
                </div>

                {msg.isStreaming && msg.content === "..." ? (
                  <div className="flex items-center gap-1.5 pt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-bounce delay-300"></span>
                  </div>
                ) : (
                  <div className="pt-1.5">
                    <RenderFormattedText text={msg.content} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input container */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        
        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2.5">
            {suggestions.map((chip, idx) => {
              const Icon = chip.icon
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.text)}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-accent-indigo/25 text-left text-xs text-slate-300 hover:text-white transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-accent-indigo group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-[9px] block text-slate-500 font-bold uppercase">{chip.label}</span>
                    <span className="font-medium text-slate-300 group-hover:text-white">{chip.text}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            handleSend(input)
          }}
          className="relative rounded-2xl glass-panel border border-white/5 focus-within:border-accent-indigo/40 p-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Ask Sprintopronto to summarize standups or diagnose blockers..."
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-xs py-2.5 px-4 text-slate-200 placeholder:text-slate-500"
          />
          
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              input.trim() && !loading
                ? "bg-accent-indigo hover:bg-accent-indigo/90 text-white shadow-lg shadow-accent-indigo/20 cursor-pointer"
                : "bg-white/5 text-slate-600 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <Cpu className="w-3.5 h-3.5" />
          Powered by Coral query agent and Llama 3 on Groq API.
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-accent-indigo border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">Loading AI Command Center...</p>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
