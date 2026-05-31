/**
 * Environment variable validation for Sprintopronto AI.
 * Import this at the top of any server-side entry point to catch
 * missing/invalid config before it causes cryptic runtime failures.
 *
 * Usage: import "@/lib/env"
 */

const KNOWN_INSECURE_SECRETS = [
  "sprintpilot_secret_hash_key_12345",
  "sprintopronto_secret_hash_key_12345",
  "your_secret_here",
  "changeme",
  "secret",
]

function validateEnv() {
  const errors: string[] = []
  const warnings: string[] = []

  // ── Required ────────────────────────────────────────────────────────────────
  if (!process.env.NEXTAUTH_SECRET) {
    errors.push(
      "NEXTAUTH_SECRET is not set. Generate one with: openssl rand -base64 32"
    )
  } else if (KNOWN_INSECURE_SECRETS.includes(process.env.NEXTAUTH_SECRET)) {
    errors.push(
      `NEXTAUTH_SECRET is set to a known insecure demo value ("${process.env.NEXTAUTH_SECRET}"). ` +
      "Replace it with: openssl rand -base64 32"
    )
  }

  // ── Warnings ────────────────────────────────────────────────────────────────
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes("your_")) {
    warnings.push(
      "GROQ_API_KEY is not set or is a placeholder. AI chat will run in local-hybrid fallback mode."
    )
  }

  if (!process.env.DATABASE_URL) {
    warnings.push(
      "DATABASE_URL is not set. Using JSON file fallback DB (volatile on Render \u2014 attach a Persistent Disk or add a Postgres instance)."
    )
  }

  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXTAUTH_URL &&
    process.env.NEXTAUTH_URL.includes("localhost")
  ) {
    warnings.push(
      `NEXTAUTH_URL is set to "${process.env.NEXTAUTH_URL}" which contains "localhost". ` +
      "Set it to your Render deployment URL: https://your-app.onrender.com"
    )
  }

  // ── Output ──────────────────────────────────────────────────────────────────
  if (errors.length > 0) {
    console.error("\n\u274c [Sprintopronto] ENVIRONMENT CONFIGURATION ERRORS:\n")
    errors.forEach((e) => console.error(`  \u2022 ${e}`))
    console.error()

    // Hard-fail in production, warn in dev
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `[Sprintopronto] Refusing to start: ${errors.length} critical env var(s) misconfigured. See logs above.`
      )
    }
  }

  if (warnings.length > 0) {
    console.warn("\n\u26a0\ufe0f  [Sprintopronto] Environment warnings:\n")
    warnings.forEach((w) => console.warn(`  \u2022 ${w}`))
    console.warn()
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("\u2705 [Sprintopronto] Environment configuration validated successfully.")
  }
}

// Only validate once per process
let validated = false
if (!validated) {
  validated = true
  validateEnv()
}

export {}
