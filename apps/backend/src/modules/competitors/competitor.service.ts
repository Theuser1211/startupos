import { prisma } from "../../db/client.js";
import { logger } from "../../lib/logger.js";

function generateMockSnapshot(name: string, website: string) {
  const domain = website.replace(/https?:\/\//, "").split("/")[0];
  return {
    title: `${name} — ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    summary: `${name} is a company in the ${domain} space.`,
    pricing: "Contact for pricing",
    features: {
      core: ["Product offering", "Customer support", "Documentation"],
      integrations: [],
      platforms: ["Web"],
    },
    rawContent: `Mock snapshot for ${name} at ${website}. No external API configured.`,
  };
}

function generateMockChanges(existingSnapshot: { title: string } | null) {
  if (!existingSnapshot) return [];

  return [
    {
      type: "pricing",
      oldValue: null,
      newValue: "Contact for pricing",
    },
    {
      type: "feature",
      oldValue: null,
      newValue: "New product offering detected",
    },
  ];
}

export async function addCompetitor(
  startupId: string,
  data: { name: string; website: string; description?: string },
) {
  const competitor = await prisma.competitor.create({
    data: {
      startupId,
      name: data.name,
      website: data.website,
      description: data.description ?? null,
    },
  });

  const mockSnapshot = generateMockSnapshot(data.name, data.website);

  const latestSnapshot = await prisma.competitorSnapshot.findFirst({
    where: { competitorId: competitor.id },
    orderBy: { capturedAt: "desc" },
  });

  const snapshot = await prisma.competitorSnapshot.create({
    data: {
      competitorId: competitor.id,
      title: mockSnapshot.title,
      summary: mockSnapshot.summary,
      pricing: mockSnapshot.pricing,
      features: mockSnapshot.features,
      rawContent: mockSnapshot.rawContent,
    },
  });

  const changes = generateMockChanges(latestSnapshot);
  for (const change of changes) {
    await prisma.competitorChange.create({
      data: {
        competitorId: competitor.id,
        type: change.type,
        oldValue: change.oldValue,
        newValue: change.newValue,
      },
    });
  }

  logger.info({ competitorId: competitor.id, startupId }, "Competitor added with mock snapshot");

  return competitor;
}

export async function getCompetitorsForStartup(startupId: string) {
  const rows = await prisma.competitor.findMany({
    where: { startupId },
    orderBy: { createdAt: "desc" },
    include: {
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 1,
      },
      changes: {
        orderBy: { detectedAt: "desc" },
        take: 3,
      },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    website: c.website,
    description: c.description,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    latestSnapshot: c.snapshots[0]
      ? {
          id: c.snapshots[0].id,
          title: c.snapshots[0].title,
          summary: c.snapshots[0].summary,
          pricing: c.snapshots[0].pricing,
          features: c.snapshots[0].features,
          rawContent: c.snapshots[0].rawContent,
          capturedAt: c.snapshots[0].capturedAt.toISOString(),
        }
      : null,
    changes: c.changes.map((ch) => ({
      id: ch.id,
      type: ch.type,
      oldValue: ch.oldValue,
      newValue: ch.newValue,
      detectedAt: ch.detectedAt.toISOString(),
    })),
  }));
}

export async function getCompetitorHistory(competitorId: string) {
  const competitor = await prisma.competitor.findUnique({
    where: { id: competitorId },
    include: {
      snapshots: {
        orderBy: { capturedAt: "desc" },
      },
      changes: {
        orderBy: { detectedAt: "desc" },
      },
    },
  });

  if (!competitor) return null;

  return {
    competitor: {
      id: competitor.id,
      name: competitor.name,
      website: competitor.website,
      description: competitor.description,
      createdAt: competitor.createdAt.toISOString(),
      updatedAt: competitor.updatedAt.toISOString(),
    },
    snapshots: competitor.snapshots.map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
      pricing: s.pricing,
      features: s.features,
      rawContent: s.rawContent,
      capturedAt: s.capturedAt.toISOString(),
    })),
    changes: competitor.changes.map((ch) => ({
      id: ch.id,
      type: ch.type,
      oldValue: ch.oldValue,
      newValue: ch.newValue,
      detectedAt: ch.detectedAt.toISOString(),
    })),
  };
}
