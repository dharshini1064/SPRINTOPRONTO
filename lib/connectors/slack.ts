import { WebClient } from "@slack/web-api"
import { mockSlackThreads } from "@/lib/mockData"
import { SlackThread, SlackMessage } from "@/lib/types"
import { getIntegrationSettings } from "@/lib/db"

export async function fetchLiveSlackThreads(): Promise<SlackThread[]> {
  // 1. Fetch credentials from database
  const config = await getIntegrationSettings()

  // Precedence: Database Settings > Env variables
  const token = config.slackBotToken || process.env.SLACK_BOT_TOKEN

  if (!token || token === "xoxb-xxxx" || token.trim() === "") {
    console.log("[Slack Connector] Running in simulated mode (no Slack token). Returning mock Slack threads.")
    return mockSlackThreads
  }

  try {
    const client = new WebClient(token)
    console.log("[Slack Connector] Listing public channels...")
    const channelsResponse = await client.conversations.list({
      exclude_archived: true,
      types: "public_channel",
      limit: 10
    })

    const channels = channelsResponse.channels || []
    const threadsList: SlackThread[] = []

    for (const channel of channels) {
      if (!channel.id || !channel.name) continue

      try {
        console.log(`[Slack Connector] Fetching history for channel #${channel.name}...`)
        const historyResponse = await client.conversations.history({
          channel: channel.id,
          limit: 10
        })

        const messages = historyResponse.messages || []
        
        if (messages.length > 0) {
          const slackMsgs: SlackMessage[] = messages
            .filter(m => !!m.text && !!m.user)
            .map(m => ({
              user: {
                name: m.user || "Anonymous",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
              },
              text: m.text || "",
              timestamp: new Date(parseFloat(m.ts || "0") * 1000).toISOString()
            }))
            .reverse()

          const textBlock = messages.map(m => m.text).join(" ")
          const linearMatch = textBlock.match(/LIN-\d+/i)
          const prMatch = textBlock.match(/PR-\d+/i)

          threadsList.push({
            id: `SLK-${channel.id}`,
            channel: channel.name,
            summary: `Active discussion in #${channel.name}`,
            messages: slackMsgs,
            relatedIssue: linearMatch ? linearMatch[0].toUpperCase() : prMatch ? prMatch[0].toUpperCase() : undefined,
            updatedAt: new Date().toISOString()
          })
        }
      } catch (chErr: any) {
        console.warn(`[Slack Connector] Failed to query history for channel #${channel.name}:`, chErr.message)
      }
    }

    if (threadsList.length === 0) {
      return mockSlackThreads
    }
    
    return threadsList
  } catch (error: any) {
    console.error("[Slack Connector] Failed to query Slack API channels:", error.message)
    console.log("[Slack Connector] Falling back to mock Slack discussions.")
    return mockSlackThreads
  }
}
