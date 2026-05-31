# 🚀 Deploying Sprintopronto AI to Render

> Render is a fully managed cloud platform. This guide gets you from code to live URL in under 10 minutes.

---

## Prerequisites

- A [Render account](https://render.com) (free tier works)
- Your code pushed to a **GitHub** or **GitLab** repository

---

## Step 1 — Push Code to GitHub

If you haven't already, create a repo and push:

```bash
cd C:\Users\sdhar\Downloads\Sprintopronto

# Initialize git (if not already done)
git init
git add .
git commit -m "feat: production-ready Sprintopronto AI"

# Create a repo on GitHub then push:
git remote add origin https://github.com/YOUR_USERNAME/sprintopronto.git
git branch -M main
git push -u origin main
```

> ⚠️ Make sure `.env.local` is in `.gitignore` before pushing — it already is after our changes.

---

## Step 2 — Create a New Web Service on Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub account if not already done
4. Select your `sprintopronto` repository
5. Render will auto-detect the `render.yaml` blueprint — click **Apply**

**If configuring manually:**

| Field | Value |
|-------|-------|
| **Name** | `sprintopronto` |
| **Runtime** | `Node` |
| **Region** | Your preferred region |
| **Branch** | `main` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `node .next/standalone/server.js` |
| **Plan** | Free (or Starter for always-on) |

---

## Step 3 — Set Environment Variables

In your Render service dashboard → **Environment** tab, add these variables:

### 🔴 Required

| Variable | Value | How to get it |
|----------|-------|---------------|
| `NEXTAUTH_SECRET` | A random 32-byte string | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `NEXTAUTH_URL` | `https://your-app-name.onrender.com` | Your Render service URL (shown in dashboard after first deploy) |

> **NEXTAUTH_URL** must match your Render URL exactly — no trailing slash.
> You can deploy first, then come back and add it.

### 🟡 For AI Features

| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |

> Without this, the chat runs in local-hybrid mode (still functional with mock data).

### 🟢 Optional Integrations

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string (see Step 4) |
| `GITHUB_PAT` | GitHub Personal Access Token for live PR data |
| `GITHUB_REPO` | Target repo in `owner/repo` format |
| `LINEAR_API_KEY` | Linear API key for live ticket data |
| `SLACK_BOT_TOKEN` | Slack bot token for live thread data |

---

## Step 4 — Add a Database (Recommended for Production)

Without a database, the app uses a JSON file in `/tmp` which **resets on every Render restart**.

### Option A: Render Postgres (Easiest)

1. Render dashboard → **New +** → **PostgreSQL**
2. Name it `sprintopronto-db`, choose **Free** plan
3. Click **Create Database**
4. Go to your web service → **Environment** → add:
   - Key: `DATABASE_URL`
   - Value: Copy the **Internal Connection String** from your Postgres instance
5. The app auto-runs migrations on startup ✅

### Option B: Neon (Free Serverless Postgres)

1. Sign up at [neon.tech](https://neon.tech) (free)
2. Create a project → copy the connection string
3. Add as `DATABASE_URL` in Render environment

### Option C: Add a Persistent Disk (for JSON fallback)

If you prefer to keep the JSON fallback but make it persistent:

1. Render dashboard → Your service → **Disks** → **Add Disk**
2. Mount path: `/var/data`, Size: 1GB
3. Add environment variable: `DATA_DIR=/var/data`

---

## Step 5 — Deploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Watch the build logs — should take 2-3 minutes
3. Your app will be live at `https://your-app-name.onrender.com`

**Expected build log output:**
```
==> Running build command: npm ci && npm run build
✓ Creating an optimized production build
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)         Size
├── /               4.2 kB
├── /chat           3.8 kB
├── /incidents      5.1 kB
├── /settings       4.4 kB
└── /api/health     0.1 kB
```

---

## Step 6 — Verify Deployment

After deploy completes:

1. **Health check**: Visit `https://your-app.onrender.com/api/health`
   ```json
   {
     "status": "ok",
     "version": "1.0.0",
     "services": {
       "database": { "connected": true, "provider": "PostgreSQL Database" },
       "ai": { "configured": true, "provider": "Groq / LLaMA 3.3" }
     }
   }
   ```

2. **Login**: Visit `https://your-app.onrender.com/login`
   - Manager: `manager@sprintopronto.ai` / `password`
   - Developer: `developer@sprintopronto.ai` / `password`

3. **Update NEXTAUTH_URL**: If you hadn't set it before deploying, go back to Environment and add `NEXTAUTH_URL=https://your-app.onrender.com` then redeploy.

---

## Step 7 — Rotate Your Groq API Key

> ⚠️ Your original Groq API key was stored in `.env.local`. If that file was ever committed to git, **rotate it now**.

1. Go to [console.groq.com](https://console.groq.com) → API Keys
2. Delete the old key
3. Create a new key
4. Update `GROQ_API_KEY` in Render environment

---

## Render Free Tier Notes

| Limitation | Details |
|------------|---------|
| **Cold starts** | Free services spin down after 15 min of inactivity. First request after idle takes ~30s |
| **No persistent disk** | `/tmp` storage resets on restart — use Postgres or upgrade plan |
| **750 hours/month** | Free tier limit — enough for one always-running service |
| **No custom domain** | Available on Starter plan ($7/mo) |

**To avoid cold starts**: Upgrade to Starter plan, or use an uptime monitor (e.g., [UptimeRobot](https://uptimerobot.com) pinging `/api/health` every 14 minutes).

---

## Troubleshooting

### "NEXTAUTH_SECRET environment variable is not set"
Add `NEXTAUTH_SECRET` in Render Environment tab and redeploy.

### Login redirects back to /login
Make sure `NEXTAUTH_URL` exactly matches your Render URL (no trailing slash).

### Build fails with TypeScript errors
Run `npm run type-check` locally first to see the errors before pushing.

### Database connection fails
Make sure your `DATABASE_URL` uses the **Internal** connection string from Render (not External). The internal URL only works within Render's network.

---

## Default Login Credentials

These are the demo accounts seeded automatically:

| Role | Email | Password |
|------|-------|----------|
| Manager (admin) | `manager@sprintopronto.ai` | `password` |
| Developer | `developer@sprintopronto.ai` | `password` |

> Change these passwords or add real users via the database after going live.
