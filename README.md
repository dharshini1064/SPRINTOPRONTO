<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/terminal.svg" width="80" height="80" alt="Sprintopronto AI Logo" />
  <h1>Sprintopronto AI 🚀</h1>
  <p><strong>The Enterprise Engineering Operations Agent, Powered by Coral 🪸</strong></p>
  <p>Built for the <strong>Query Anything as SQL</strong> Hackathon (Track 1: Enterprise Agent)</p>
</div>

---

## 💡 The Problem: Fragmented Context & Agent Fatigue

Modern engineering teams live across multiple tools: **Linear** for tracking, **GitHub** for code, and **Slack** for communication. When building AI agents to diagnose blocked sprints or stalled PRs, the traditional approach relies on separate API wrappers or MCP servers for each tool. 

This causes massive friction:
- **Excessive Tool Calls**: The agent wastes tokens fetching a ticket, then finding the PR, then searching Slack.
- **Pagination Hell**: Iterating through hundreds of stale PRs burns time and API limits.
- **Brittle Reasoning**: Forcing an LLM to stitch together JSON payloads from three different APIs leads to hallucinated correlations.

## 🪸 The Solution: Sprintopronto + Coral

**Sprintopronto AI** is an intelligent sprint health dashboard and autonomous diagnostic agent. By leveraging **[Coral](https://withcoral.com/)**, we transformed a fragmented operational nightmare into a single, elegant SQL interface. 

Instead of building brittle glue code, Sprintopronto empowers its AI to query GitHub, Linear, and Slack simultaneously.

### ⚡ Why Coral Made Us So Efficient

Integrating Coral was a game-changer for Sprintopronto's AI reasoning engine:

1. **Cross-Source JOINs in One Hop**: 
   Our agent identifies blocked tickets by executing a single SQL query that joins `github.pulls`, `linear.issues`, and `slack.messages`. Coral handles the auth, pagination, and rate limits entirely below deck. 
2. **Massive Efficiency Gains**: 
   By shifting the data correlation to Coral's SQL layer, our agent requires **fewer, more precise tool calls**. Consistent with Coral's benchmarks, we observed significantly lower latency and drastically reduced token consumption compared to multi-hop API architectures.
3. **Pristine Tabular Context**: 
   Instead of stuffing the LLM's context window with deeply nested JSON arrays, Coral returns clean, tabular data. This structural advantage allows our underlying model (LLaMA 3.3 via Groq) to diagnose root causes with far higher accuracy.
4. **100% Local & Secure**: 
   Our credentials and sprint data never leave the machine. The SQL resolves locally, keeping enterprise data strictly confidential.

---

## 🌟 Key Features

- 📊 **Real-Time Sprint Telemetry**: A unified dashboard tracking sprint health, blocked tickets, and stale PRs.
- 🤖 **Autonomous AI Investigator**: Ask questions like *"Why is the onboarding flow delayed?"* and the agent correlates Slack threads with stuck database migrations and unreviewed PRs.
- 🚨 **Risk Scoring & Actionable Summaries**: Automatically flags critical path hold-ups and suggests operational resolutions.
- 🔐 **Enterprise-Ready**: Role-Based Access Control (RBAC) via NextAuth, production-ready PostgreSQL persistence, and secure credential handling.

---

## 🛠️ Architecture & Tech Stack

- **Data Engine**: [Coral](https://withcoral.com/) (Single SQL interface for APIs)
- **AI Brain**: Groq + LLaMA 3.3 (Lightning-fast inference)
- **Frontend/Backend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Auth**: NextAuth.js (JWT Sessions, RBAC)
- **Database**: PostgreSQL (with local JSON fallback for easy dev)
- **Deployment**: Render (Standalone optimized build)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A [Groq API Key](https://console.groq.com/)
- Coral CLI installed (`brew install withcoral/tap/coral`)

### 2. Installation
```bash
git clone https://github.com/YOUR_USERNAME/sprintopronto.git
cd sprintopronto
npm install
```

### 3. Environment Variables
Copy the template and fill in your keys:
```bash
cp .env.example .env.local
```
*(Generate a secure NextAuth secret using `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)*

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Use the demo quick-login buttons to experience the RBAC features!

---

## 🏆 Hackathon Alignment: Track 1 (Enterprise Agent)

Sprintopronto AI was designed specifically for the **Build an Enterprise Agent** track. 
We demonstrated how Coral replaces thousands of lines of brittle API orchestration with unified SQL. By acting as a **Sprint Health Dashboard & Investigator**, it provides immense enterprise value: giving engineering managers immediate visibility into blocked critical paths without manually pinging developers across three different platforms.

*One install. One query language. Infinite operational visibility. 🏴‍☠️*
