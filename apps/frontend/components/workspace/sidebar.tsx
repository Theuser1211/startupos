"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Globe, Palette, Target, DollarSign, Map,
  LucideIcon, FolderOpen, Crosshair,
} from "lucide-react";
import Link from "next/link";
import type { StartupBlueprint } from "@/lib/types";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

const tabs: Tab[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "website", label: "Website", icon: Globe },
  { id: "brand", label: "Brand", icon: Palette },
  { id: "icp", label: "ICP", icon: Target },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "roadmap", label: "Roadmap", icon: Map },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  founderName?: string;
  startupId?: string;
  blueprint?: StartupBlueprint | null;
}

export function Sidebar({ activeTab, onTabChange, founderName, startupId, blueprint }: SidebarProps) {
  const stage = blueprint?.companySnapshot?.stage || "";

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
      <div className="flex items-center h-14 px-5 border-b border-border">
        <Link href="/" className="text-sm font-bold tracking-tight font-mono">startupos</Link>
      </div>

      {founderName && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded border border-primary/30 bg-primary/10 flex items-center justify-center text-xs font-bold text-primary font-mono">
              {founderName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{founderName}</p>
              <p className="text-[10px] text-muted-foreground font-mono">
                stage: {stage || "unknown"}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium",
                isActive
                  ? "text-primary border-l-2 border-l-primary bg-primary/[0.03]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent border-l-2 border-l-transparent"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-2 py-2 border-t border-border space-y-0.5">
        {startupId && (
          <Link
            href={`/competitors?startupId=${startupId}`}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded"
          >
            <Crosshair className="h-3.5 w-3.5" />
            Competitors
          </Link>
        )}
        <Link
          href="/blueprints"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          My Startups
        </Link>
      </div>
    </aside>
  );
}
