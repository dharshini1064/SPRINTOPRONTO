import { Pool } from "pg"
import fs from "fs"
import path from "path"

export interface DBUser {
  id: string
  email: string
  name: string
  passwordHash: string
  role: "manager" | "developer"
  avatar: string
}

export interface IntegrationConfig {
  githubPat: string
  githubRepo: string
  linearApiKey: string
  slackBotToken: string
}

const DEFAULT_USERS: DBUser[] = [
  {
    id: "usr-manager",
    email: "manager@sprintopronto.ai",
    name: "John Manager",
    // bcrypt hash of "password" (cost=10) — generated with bcrypt.hashSync("password", 10)
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  },
  {
    id: "usr-dev",
    email: "developer@sprintopronto.ai",
    name: "Alex Developer",
    // bcrypt hash of "password" (cost=10) — generated with bcrypt.hashSync("password", 10)
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "developer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
  }
]

let pool: Pool | null = null
let useFallback = true

// On Render (and most PaaS), only /tmp is writable if no persistent disk is attached.
// Set DATA_DIR env var to a mounted persistent disk path when available.
const DATA_DIR = process.env.DATA_DIR || "/tmp"
const dbFilePath = path.join(DATA_DIR, "sprintopronto_db.json")

// Ensure fallback db directory exists
const initFallbackDB = () => {
  const dir = path.dirname(dbFilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(
      dbFilePath, 
      JSON.stringify({ 
        users: DEFAULT_USERS,
        integrations: {
          githubPat: "",
          githubRepo: "",
          linearApiKey: "",
          slackBotToken: ""
        }
      }, null, 2)
    )
  }
}

// Auto migrations helper for Postgres
async function initializePostgresDatabase() {
  if (!pool) return
  
  try {
    console.log("[DB Migrator] Verifying PostgreSQL schemas...")
    // Create Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        avatar VARCHAR(255)
      )
    `)

    // Create Integrations Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id VARCHAR(255) PRIMARY KEY,
        github_pat VARCHAR(255),
        github_repo VARCHAR(255),
        linear_api_key VARCHAR(255),
        slack_bot_token VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Seed default users
    for (const u of DEFAULT_USERS) {
      await pool.query(`
        INSERT INTO users (id, email, name, password_hash, role, avatar)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, [u.id, u.email, u.name, u.passwordHash, u.role, u.avatar])
    }

    console.log("[DB Migrator] Schema sync completed successfully.")
  } catch (err: any) {
    console.error("[DB Migrator] Migrations failed. Falling back to JSON database. Error:", err.message)
    useFallback = true
  }
}

// Try to initialize Postgres
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgres")) {
  try {
    // Enable SSL for any production Postgres (Render, Supabase, Neon, Railway, etc.)
    const useSSL = process.env.NODE_ENV === "production" || process.env.DATABASE_URL.includes("render.com")
      || process.env.DATABASE_URL.includes("supabase") || process.env.DATABASE_URL.includes("neon.tech")
      || process.env.DATABASE_URL.includes("railway.app")

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
      max: process.env.NODE_ENV === "production" ? 5 : 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000
    })
    useFallback = false

    // Fire migrations in the background
    initializePostgresDatabase()
  } catch (err) {
    console.warn("PostgreSQL connection failed to initialize, falling back to JSON database:", err)
    useFallback = true
  }
} else {
  console.log("[DB] No DATABASE_URL configured — using JSON file fallback at:", dbFilePath)
  useFallback = true
}

if (useFallback) {
  initFallbackDB()
}

export async function queryUserByEmail(email: string): Promise<DBUser | null> {
  const normalizedEmail = email.toLowerCase().trim()
  
  if (!useFallback && pool) {
    try {
      const res = await pool.query(
        "SELECT id, email, name, password_hash as \"passwordHash\", role, avatar FROM users WHERE LOWER(email) = $1 LIMIT 1",
        [normalizedEmail]
      )
      if (res.rows.length > 0) return res.rows[0]
    } catch (err) {
      console.error("Database query user failed, trying fallback JSON database:", err)
    }
  }

  // Fallback database lookup
  try {
    initFallbackDB()
    const raw = fs.readFileSync(dbFilePath, "utf8")
    const data = JSON.parse(raw)
    const user = data.users.find((u: DBUser) => u.email.toLowerCase() === normalizedEmail)
    return user || null
  } catch (err) {
    console.error("JSON Database read error:", err)
    const user = DEFAULT_USERS.find(u => u.email.toLowerCase() === normalizedEmail)
    return user || null
  }
}

export async function getIntegrationSettings(): Promise<IntegrationConfig> {
  if (!useFallback && pool) {
    try {
      const res = await pool.query(
        `SELECT 
          github_pat as "githubPat", 
          github_repo as "githubRepo", 
          linear_api_key as "linearApiKey", 
          slack_bot_token as "slackBotToken" 
         FROM integrations WHERE id = 'active_config' LIMIT 1`
      )
      if (res.rows.length > 0) {
        return {
          githubPat: res.rows[0].githubPat || "",
          githubRepo: res.rows[0].githubRepo || "",
          linearApiKey: res.rows[0].linearApiKey || "",
          slackBotToken: res.rows[0].slackBotToken || ""
        }
      }
    } catch (err) {
      console.error("Database read integrations failed, trying fallback JSON database:", err)
    }
  }

  // Fallback JSON db
  try {
    initFallbackDB()
    const raw = fs.readFileSync(dbFilePath, "utf8")
    const data = JSON.parse(raw)
    return data.integrations || { githubPat: "", githubRepo: "", linearApiKey: "", slackBotToken: "" }
  } catch (err) {
    console.error("JSON Database read integrations error:", err)
    return { githubPat: "", githubRepo: "", linearApiKey: "", slackBotToken: "" }
  }
}

export async function saveIntegrationSettings(config: IntegrationConfig): Promise<boolean> {
  if (!useFallback && pool) {
    try {
      await pool.query(
        `INSERT INTO integrations (id, github_pat, github_repo, linear_api_key, slack_bot_token, updated_at)
         VALUES ('active_config', $1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE SET
           github_pat = EXCLUDED.github_pat,
           github_repo = EXCLUDED.github_repo,
           linear_api_key = EXCLUDED.linear_api_key,
           slack_bot_token = EXCLUDED.slack_bot_token,
           updated_at = CURRENT_TIMESTAMP`,
        [config.githubPat, config.githubRepo, config.linearApiKey, config.slackBotToken]
      )
      return true
    } catch (err) {
      console.error("Database write integrations failed, trying fallback JSON database:", err)
    }
  }

  // Fallback JSON db write
  try {
    initFallbackDB()
    const raw = fs.readFileSync(dbFilePath, "utf8")
    const data = JSON.parse(raw)
    data.integrations = config
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2))
    return true
  } catch (err) {
    console.error("JSON Database write integrations error:", err)
    return false
  }
}

export async function checkDBStatus(): Promise<{ connected: boolean; provider: string }> {
  if (!useFallback && pool) {
    try {
      await pool.query("SELECT 1")
      return { connected: true, provider: "PostgreSQL Database" }
    } catch (err) {
      return { connected: false, provider: "PostgreSQL (Failing)" }
    }
  }
  return { connected: true, provider: "Local JSON DB (Active Fallback)" }
}
