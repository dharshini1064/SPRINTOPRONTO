import { Octokit } from "@octokit/rest"
import { mockPRs } from "@/lib/mockData"
import { PullRequest } from "@/lib/types"
import { getIntegrationSettings } from "@/lib/db"

export async function fetchLivePRs(): Promise<PullRequest[]> {
  // 1. Fetch credentials from database
  const config = await getIntegrationSettings()

  // Precedence: Database Settings > Env variables
  const pat = config.githubPat || process.env.GITHUB_PAT
  const repoString = config.githubRepo || process.env.GITHUB_REPO || "vercel/next.js"

  if (!pat || pat === "github_pat_xxxx" || pat.trim() === "") {
    console.log("[GitHub Connector] Running in simulated mode (no GitHub Token). Returning mock PRs.")
    return mockPRs
  }

  const [owner, repo] = repoString.split("/")
  if (!owner || !repo) {
    console.warn(`[GitHub Connector] Invalid repository format: "${repoString}". Expected "owner/repo". Returning mock PRs.`)
    return mockPRs
  }

  try {
    const client = new Octokit({ auth: pat })
    console.log(`[GitHub Connector] Querying live PRs for ${owner}/${repo}...`)
    const response = await client.pulls.list({
      owner,
      repo,
      state: "open",
      per_page: 10
    })

    return response.data.map(item => {
      const ageHours = Math.round((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60))
      
      return {
        id: `PR-${item.number}`,
        title: item.title,
        status: item.draft ? "blocked" : "open",
        source: "github",
        author: {
          name: item.user?.login || "anonymous",
          avatar: item.user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
        },
        reviewer: item.requested_reviewers && item.requested_reviewers.length > 0 
          ? {
              name: item.requested_reviewers[0].login,
              avatar: item.requested_reviewers[0].avatar_url
            }
          : undefined,
        linkedIssue: undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        isStale: ageHours > 48,
        reviewPendingHours: ageHours,
        draft: item.draft
      }
    })
  } catch (error: any) {
    console.error(`[GitHub Connector] Failed to fetch live PRs for ${owner}/${repo}:`, error.message)
    console.log("[GitHub Connector] Falling back to mock PR data.")
    return mockPRs
  }
}
