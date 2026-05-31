import { mockTickets, mockPRs, mockSlackThreads } from "./mockData"
import { SprintSummary, SprintRisk, PullRequest, WorkItem, SlackThread } from "./types"

export function runCorrelationEngine(
  tickets: WorkItem[] = mockTickets,
  prs: PullRequest[] = mockPRs,
  threads: SlackThread[] = mockSlackThreads
): SprintSummary {
  // Rule 3: Mark PRs stale if reviewPendingHours > 48
  const updatedPRs = prs.map(pr => {
    const isStale = pr.status !== "merged" && (pr.reviewPendingHours > 48 || pr.isStale);
    return { ...pr, isStale };
  });

  // Rule 2: Scan Slack threads for keywords ("blocked", "failing", "issue", "migration") and associate them with tickets
  const keywords = ["blocked", "failing", "issue", "migration", "deadlock", "leak", "conflict"];
  
  const slackAssociations = threads.filter(thread => {
    const combinedText = thread.summary.toLowerCase() + " " + 
      thread.messages.map(m => m.text.toLowerCase()).join(" ");
    
    return keywords.some(keyword => combinedText.includes(keyword)) && thread.relatedIssue;
  });

  // Calculate metrics
  const totalTickets = tickets.length;
  const activeTickets = tickets.filter(t => t.status !== "backlog");
  const completedTickets = tickets.filter(t => t.status === "completed");
  const inProgressTickets = tickets.filter(t => t.status === "in_progress");
  const blockedTickets = tickets.filter(t => t.status === "blocked");
  const todoTickets = tickets.filter(t => t.status === "todo");

  const blockedTicketsCount = blockedTickets.length;
  const stalePrsCount = updatedPRs.filter(pr => pr.isStale).length;
  const openCriticalIssuesCount = tickets.filter(t => t.priority === "urgent" && t.status !== "completed").length;

  // Calculate Sprint Health
  // Completed is 100%, In progress is 40%, Todo is 10%, Blocked is 0%
  const totalWeight = activeTickets.length;
  const healthWeight = completedTickets.length * 1.0 + 
                       inProgressTickets.length * 0.45 + 
                       todoTickets.length * 0.1;
  const healthPercent = totalWeight > 0 ? Math.round((healthWeight / totalWeight) * 100) : 100;

  // Calculate Risk Score: starts at 0, increases for blockers, stale PRs, and critical issues
  let calculatedRisk = 0;
  calculatedRisk += blockedTicketsCount * 20; // 2 blocked tickets = 40
  calculatedRisk += stalePrsCount * 10;        // 3 stale PRs = 30
  calculatedRisk += openCriticalIssuesCount * 15; // 1 urgent issue = 15
  const riskScore = Math.min(Math.max(calculatedRisk, 10), 95); // clamp between 10 and 95

  // Build Sprint Risks dynamically using rules
  const risks: SprintRisk[] = [];

  // Rule 1: Linear ticket status = blocked AND linked PR stale > 2 days -> Mark sprint risk HIGH
  blockedTickets.forEach(ticket => {
    const linkedPr = updatedPRs.find(pr => pr.linkedIssue === ticket.id);
    const relatedSlack = slackAssociations.find(t => t.relatedIssue === ticket.id);

    if (linkedPr && linkedPr.isStale) {
      risks.push({
        id: `RISK-${ticket.id}`,
        title: `High Risk Blocker: ${ticket.title}`,
        type: "blocker",
        level: "high",
        description: `Linear issue ${ticket.id} assigned to ${ticket.assignee.name} is BLOCKED. Associated Pull Request ${linkedPr.id} ("${linkedPr.title}") has been pending review by ${linkedPr.reviewer?.name || "reviewers"} for ${linkedPr.reviewPendingHours} hours.`,
        linkedTicketId: ticket.id,
        linkedPrId: linkedPr.id,
        linkedSlackId: relatedSlack?.id,
        suggestedAction: `Ping @${linkedPr.reviewer?.name || "reviewers"} to merge/review ${linkedPr.id} or reassign to unblock ${ticket.assignee.name}.`
      });
    }
  });

  // Find Slack alerted issues (Rule 2 + related ticket)
  slackAssociations.forEach(thread => {
    // If we haven't already created a high-risk alert for this ticket
    if (!risks.some(r => r.linkedTicketId === thread.relatedIssue)) {
      const ticket = tickets.find(t => t.id === thread.relatedIssue);
      if (ticket && ticket.status !== "completed") {
        const isUrgent = ticket.priority === "urgent" || ticket.priority === "high";
        
        // Extract key issue from slack messages
        let slackSummary = thread.summary;
        if (thread.messages.length > 0) {
          const lastMsg = thread.messages[thread.messages.length - 1];
          slackSummary = `Slack discussion in #${thread.channel} shows: "${lastMsg.text.substring(0, 100)}..."`;
        }

        risks.push({
          id: `RISK-${thread.id}`,
          title: `${isUrgent ? "High" : "Medium"} Risk Discussion: ${ticket.title}`,
          type: "slack_alert",
          level: isUrgent ? "high" : "medium",
          description: `Active discussion in #${thread.channel} details technical issues. ${slackSummary}`,
          linkedTicketId: ticket.id,
          linkedSlackId: thread.id,
          suggestedAction: `Organize a quick huddle for ${ticket.assignee.name} and responders in #${thread.channel} to resolve the technical friction.`
        });
      }
    }
  });

  // General Stale PR risks
  updatedPRs.forEach(pr => {
    if (pr.isStale && !risks.some(r => r.linkedPrId === pr.id) && pr.status !== "merged") {
      risks.push({
        id: `RISK-${pr.id}`,
        title: `Stale Pull Request: ${pr.title}`,
        type: "stale_pr",
        level: pr.reviewPendingHours > 96 ? "medium" : "low",
        description: `Pull Request ${pr.id} opened by ${pr.author.name} is waiting for review. Pending review for ${pr.reviewPendingHours} hours.`,
        linkedPrId: pr.id,
        suggestedAction: `Request review reminder on ${pr.id} or re-assign from @${pr.reviewer?.name || "reviewers"}.`
      });
    }
  });

  // Build Suggested Quick Actions
  const suggestedActions = risks.map(risk => ({
    id: `ACT-${risk.id}`,
    text: risk.suggestedAction,
    actionableId: risk.linkedTicketId || risk.linkedPrId || risk.linkedSlackId,
    actionableType: risk.linkedTicketId ? "ticket" : (risk.linkedPrId ? "pr" : "slack") as "ticket" | "pr" | "slack"
  }));

  // Add default actions if we need more
  if (suggestedActions.length === 0) {
    suggestedActions.push({
      id: "ACT-GEN-1",
      text: "Review sprint board tasks that have no updates in 3 days."
    });
  }

  return {
    healthPercent,
    riskScore,
    totalTickets,
    blockedTicketsCount,
    stalePrsCount,
    openCriticalIssuesCount,
    risks: risks.sort((a, b) => {
      const priorityVal = { high: 3, medium: 2, low: 1 };
      return priorityVal[b.level] - priorityVal[a.level];
    }),
    suggestedActions
  };
}
