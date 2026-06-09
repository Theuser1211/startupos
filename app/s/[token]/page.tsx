import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { StartupOSBadge } from "@/components/startup/startuos-badge";
import { ShareMenu } from "@/components/startup/share-menu";
import type { StartupBlueprint } from "@/lib/startup/blueprint";

type Verdict = StartupBlueprint["verdict"];
type ICP = StartupBlueprint["icp"];
type Revenue = StartupBlueprint["revenue"];
type Roadmap = StartupBlueprint["roadmap"];
type Roast = StartupBlueprint["roast"];
type Competitor = StartupBlueprint["competitors"][number];

interface PublicBlueprintResponse {
  startupName: string;
  tagline: string;
  verdict: Verdict;
  icp?: ICP;
  revenue?: Revenue;
  roadmap?: Roadmap;
  roast?: Roast;
  competitors?: Competitor[];
  publicViews: number;
  shareUrl: string;
}

const fetchPublicBlueprint = cache(async (token: string): Promise<PublicBlueprintResponse | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blueprints")
    .select("blueprint, public_sections, public_views, name")
    .eq("share_token", token)
    .eq("visibility", "public")
    .single();

  if (error || !data) {
    return null;
  }

  const blueprint = data.blueprint as unknown as StartupBlueprint;
  const publicSections = (data.public_sections as string[]) || [];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://startupos.app";

  const response: PublicBlueprintResponse = {
    startupName: blueprint.startupName,
    tagline: blueprint.tagline,
    verdict: blueprint.verdict,
    publicViews: data.public_views || 0,
    shareUrl: `${baseUrl}/s/${token}`,
  };

  if (publicSections.includes("icp")) response.icp = blueprint.icp;
  if (publicSections.includes("revenue")) response.revenue = blueprint.revenue;
  if (publicSections.includes("roadmap")) response.roadmap = blueprint.roadmap;
  if (publicSections.includes("roast")) response.roast = blueprint.roast;
  if (publicSections.includes("competitors")) response.competitors = blueprint.competitors;

  return response;
});

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const blueprint = await fetchPublicBlueprint(token);

  if (!blueprint) {
    return { title: "Blueprint Not Found" };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://startupos.app";

  return {
    title: `${blueprint.startupName} — StartupOS Blueprint`,
    description: blueprint.tagline,
    openGraph: {
      title: blueprint.startupName,
      description: blueprint.tagline,
      type: "website",
      url: `${baseUrl}/s/${token}`,
    },
    twitter: {
      card: "summary_large_image",
      title: blueprint.startupName,
      description: blueprint.tagline,
    },
    alternates: {
      canonical: `${baseUrl}/s/${token}`,
    },
  };
}

const badgeColors: Record<string, string> = {
  pass: "bg-green-500/20 text-green-400 border-green-500/30",
  conditional: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "needs-work": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  fail: "bg-red-500/20 text-red-400 border-red-500/30",
};

function VerdictCard({ verdict }: { verdict: Verdict }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Verdict</h2>
        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${badgeColors[verdict.badge] || badgeColors["needs-work"]}`}>
          {verdict.badgeLabel}
        </span>
      </div>
      <div className="text-3xl font-bold text-white mb-2">{verdict.compositeScore}/100</div>
      <p className="text-white/70">{verdict.summary}</p>
    </div>
  );
}

function RoadmapSection({ roadmap }: { roadmap: Roadmap }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">Roadmap</h2>
      <div className="space-y-6">
        {roadmap.map((phase, i) => (
          <div key={i}>
            <h3 className="text-sm font-medium text-white/60 mb-3">{phase.quarter}</h3>
            <div className="space-y-2">
              {phase.items.map((item, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                    item.status === "done" ? "bg-green-400" :
                    item.status === "in-progress" ? "bg-yellow-400" : "bg-white/30"
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-white/50">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoastSection({ roast }: { roast: Roast }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Roast</h2>
        <span className="text-2xl font-bold text-white">{roast.score}/10</span>
      </div>
      <p className="text-white/70 mb-4">{roast.verdict}</p>
      <div className="space-y-2">
        {roast.items.slice(0, 5).map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={`px-2 py-0.5 text-xs rounded ${
              item.severity === "high" ? "bg-red-500/20 text-red-400" :
              item.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-white/10 text-white/60"
            }`}>
              {item.rating}/10
            </span>
            <div>
              <div className="text-sm font-medium text-white">{item.category}</div>
              <div className="text-xs text-white/50">{item.feedback}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ICPSection({ icp }: { icp: ICP }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">Ideal Customer Profile</h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-white/60">Title</div>
          <div className="text-white">{icp.title}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-white/60">Pain Points</div>
          <ul className="mt-1 space-y-1">
            {icp.painPoints.map((point, i) => (
              <li key={i} className="text-sm text-white/70">• {point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RevenueSection({ revenue }: { revenue: Revenue }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">Revenue Model</h2>
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-white/60">Model</div>
          <div className="text-white">{revenue.model}</div>
        </div>
        <div>
          <div className="text-sm font-medium text-white/60">Pricing</div>
          <div className="text-white">{revenue.pricing}</div>
        </div>
      </div>
    </div>
  );
}

function CompetitorsSection({ competitors }: { competitors: Competitor[] }) {
  return (
    <div className="p-6 rounded-xl border border-white/10 bg-white/5">
      <h2 className="text-lg font-semibold text-white mb-4">Competitors</h2>
      <div className="space-y-4">
        {competitors.map((comp, i) => (
          <div key={i} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <div className="font-medium text-white">{comp.name}</div>
            <div className="text-xs text-white/50 mt-1">
              <span className="text-green-400">Strength:</span> {comp.strength}
            </div>
            <div className="text-xs text-white/50">
              <span className="text-red-400">Weakness:</span> {comp.weakness}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PublicBlueprintPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const blueprint = await fetchPublicBlueprint(token);

  if (!blueprint) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-8">
          <StartupOSBadge />
          <h1 className="text-4xl font-bold text-white mt-4">{blueprint.startupName}</h1>
          <p className="text-xl text-white/70 mt-2">{blueprint.tagline}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
            <span>{blueprint.publicViews.toLocaleString()} views</span>
          </div>
        </div>

        {/* Verdict */}
        <div className="mb-6">
          <VerdictCard verdict={blueprint.verdict} />
        </div>

        {/* Roadmap */}
        {blueprint.roadmap && (
          <div className="mb-6">
            <RoadmapSection roadmap={blueprint.roadmap} />
          </div>
        )}

        {/* Roast */}
        {blueprint.roast && (
          <div className="mb-6">
            <RoastSection roast={blueprint.roast} />
          </div>
        )}

        {/* ICP (if enabled) */}
        {blueprint.icp && (
          <div className="mb-6">
            <ICPSection icp={blueprint.icp} />
          </div>
        )}

        {/* Revenue (if enabled) */}
        {blueprint.revenue && (
          <div className="mb-6">
            <RevenueSection revenue={blueprint.revenue} />
          </div>
        )}

        {/* Competitors (if enabled) */}
        {blueprint.competitors && (
          <div className="mb-6">
            <CompetitorsSection competitors={blueprint.competitors} />
          </div>
        )}

        {/* Share Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <ShareMenu
            shareUrl={blueprint.shareUrl}
            startupName={blueprint.startupName}
            tagline={blueprint.tagline}
          />
        </div>
      </div>
    </div>
  );
}
