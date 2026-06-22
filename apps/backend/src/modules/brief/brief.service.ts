import { prisma } from "../../db/client.js";

function generateSummary(
  healthScore: number,
  hasBlueprint: boolean,
  hasWebsite: boolean,
  hasLiveDeployment: boolean,
  hasRecentActivity: boolean,
): string {
  const parts: string[] = [];

  if (healthScore >= 75) {
    parts.push("Your startup is thriving");
  } else if (healthScore >= 50) {
    parts.push("Your startup is making good progress");
  } else if (healthScore >= 25) {
    parts.push("Your startup is developing");
  } else {
    parts.push("Your startup is just getting started");
  }

  if (hasBlueprint && hasWebsite && hasLiveDeployment) {
    parts.push("— you've completed all major milestones");
  } else if (hasBlueprint && hasWebsite) {
    parts.push("— website generated, deployment is the next big step");
  } else if (hasBlueprint) {
    parts.push("— blueprint is ready, time to build your website");
  }

  if (hasRecentActivity) {
    parts.push("You've been active recently, keep the momentum going");
  } else if (healthScore > 0) {
    parts.push("Check in regularly to track progress");
  } else {
    parts.push("Complete the founder interview to generate your first blueprint");
  }

  return parts.join(". ") + ".";
}

function generateWins(
  hasBlueprint: boolean,
  hasWebsite: boolean,
  hasLiveDeployment: boolean,
  events: { type: string; createdAt: Date }[],
): string[] {
  const wins: string[] = [];

  const recentWins = events.filter(
    (e) =>
      e.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
      !["DASHBOARD_VIEWED", "BLUEPRINT_VIEWED"].includes(e.type),
  );

  for (const event of recentWins) {
    switch (event.type) {
      case "STARTUP_CREATED":
        wins.push("Startup registered");
        break;
      case "BLUEPRINT_GENERATED":
        wins.push("Blueprint completed");
        break;
      case "WEBSITE_GENERATED":
        wins.push("Website generated");
        break;
      case "WEBSITE_DEPLOYED":
        wins.push("Website deployed live");
        break;
    }
  }

  if (hasBlueprint && !recentWins.some((e) => e.type === "BLUEPRINT_GENERATED")) {
    wins.push("Blueprint completed");
  }
  if (hasWebsite && !recentWins.some((e) => e.type === "WEBSITE_GENERATED")) {
    wins.push("Website generated");
  }
  if (hasLiveDeployment && !recentWins.some((e) => e.type === "WEBSITE_DEPLOYED")) {
    wins.push("Website deployed live");
  }

  return wins;
}

function generatePriorities(
  hasBlueprint: boolean,
  hasWebsite: boolean,
  hasLiveDeployment: boolean,
  hasRecentActivity: boolean,
): string[] {
  const priorities: string[] = [];

  if (!hasBlueprint) {
    priorities.push("Complete the founder interview to generate your blueprint");
  }
  if (hasBlueprint && !hasWebsite) {
    priorities.push("Generate your website from the blueprint");
  }
  if (hasWebsite && !hasLiveDeployment) {
    priorities.push("Deploy your website to go live");
  }
  if (!hasRecentActivity) {
    priorities.push("Visit your dashboard and track your startup health");
  }

  if (priorities.length === 0) {
    priorities.push("Explore competitor intelligence for your market");
    priorities.push("Review your health score and set new milestones");
  }

  return priorities;
}

export async function generateBrief(startupId: string) {
  const startup = await prisma.startup.findUnique({
    where: { id: startupId },
    include: {
      blueprint: { select: { id: true } },
      websites: {
        include: { deployment: { select: { id: true, status: true } } },
        take: 1,
      },
      events: {
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      competitors: {
        include: {
          changes: {
            orderBy: { detectedAt: "desc" },
            take: 5,
          },
        },
      },
      healthSnapshots: {
        orderBy: { createdAt: "asc" },
        take: 30,
      },
      actions: {
        where: { completed: false },
        orderBy: { priority: "asc" },
        take: 5,
      },
    },
  });

  if (!startup) return null;

  const hasBlueprint = !!startup.blueprint;
  const hasWebsite = startup.websites.length > 0;
  const hasLiveDeployment = startup.websites.some((w) => w.deployment?.status === "LIVE");
  const hasRecentActivity = startup.events.some(
    (e) => e.createdAt > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  );

  const latestHealth = startup.healthSnapshots[startup.healthSnapshots.length - 1];
  const healthScore = latestHealth?.score ?? 0;

  const summary = generateSummary(healthScore, hasBlueprint, hasWebsite, hasLiveDeployment, hasRecentActivity);
  const wins = generateWins(hasBlueprint, hasWebsite, hasLiveDeployment, startup.events);
  const priorities = generatePriorities(hasBlueprint, hasWebsite, hasLiveDeployment, hasRecentActivity);

  const competitorUpdates: string[] = [];
  for (const competitor of startup.competitors) {
    for (const change of competitor.changes) {
      const typeLabel =
        change.type === "pricing"
          ? "changed pricing"
          : change.type === "feature"
            ? "added new features"
            : "updated positioning";
      competitorUpdates.push(`${competitor.name} ${typeLabel}`);
    }
  }

  const brief = await prisma.dailyBrief.create({
    data: {
      startupId,
      summary,
      wins,
      priorities,
      competitorUpdates,
    },
  });

  return {
    id: brief.id,
    summary: brief.summary,
    wins: brief.wins as string[],
    priorities: brief.priorities as string[],
    competitorUpdates: brief.competitorUpdates as string[],
    healthScore,
    healthHistory: startup.healthSnapshots.map((s) => ({
      score: s.score,
      createdAt: s.createdAt.toISOString(),
    })),
    generatedAt: brief.generatedAt.toISOString(),
  };
}
