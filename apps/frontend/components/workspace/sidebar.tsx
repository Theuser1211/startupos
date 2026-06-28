"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Globe, Palette, Target, DollarSign, Map, Flame, Scale,
  LucideIcon, FolderOpen, TrendingUp, Crosshair, Command,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { OnboardingChecklist, useOnboarding } from "@/components/ui/onboarding-checklist";
import { PanicButton } from "./panic-button";
import type { StartupBlueprint } from "@/lib/types";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

const tabs: Tab[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "verdict", label: "Verdict", icon: Scale },
  { id: "website", label: "Website", icon: Globe },
  { id: "brand", label: "Brand", icon: Palette },
  { id: "icp", label: "ICP", icon: Target },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "roast", label: "Roast", icon: Flame },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  founderName?: string;
  startupId?: string;
  blueprint?: StartupBlueprint | null;
}

export function Sidebar({ activeTab, onTabChange, founderName, startupId, blueprint }: SidebarProps) {
  const { completed, dismissed, show, dismiss } = useOnboarding();
  const stage = blueprint?.companySnapshot?.stage || "";

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card">
      <div className="flex items-center gap-2.5 h-14 px-5 border-b border-border">
        <Image
          src="/logo-square.png"
          alt="StartupOS"
          width={1254}
          height={1254}
          className="h-7 w-7 shrink-0"
          priority
        />
        <span className="text-sm font-bold tracking-tight font-mono">
          <span className="text-primary">$</span> startupos
        </span>
      </div>

      {founderName && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg border border-primary/30 bg-surface-green flex items-center justify-center text-xs font-bold text-primary font-mono">
              {founderName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{founderName}</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                <span className="status-dot" />
                {stage ? `$ stage: ${stage}` : "$ founder"}
              </div>
            </div>
          </div>
        </div>
      )}

      {show && (
        <div className="px-3 pt-3">
          <OnboardingChecklist completed={completed} onDismiss={dismiss} />
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] text-muted-foreground font-mono uppercase tracking-wider mono-label">$ workspace</div>
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
                "flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-all duration-150 relative",
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

      <div className="px-2 pb-1">
        <PanicButton blueprint={blueprint} />
      </div>

      <div className="px-2 py-2 border-t border-border space-y-0.5">
        <div className="px-3 pb-1 text-[10px] text-muted-foreground font-mono uppercase tracking-wider mono-label">$ nav</div>
        {startupId && (
          <>
            <Link
              href={`/dashboard?id=${startupId}`}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all border-l-2 border-l-transparent hover:border-l-primary/30"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href={`/competitors?startupId=${startupId}`}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all border-l-2 border-l-transparent hover:border-l-primary/30"
            >
              <Crosshair className="h-3.5 w-3.5" />
              Competitors
            </Link>
          </>
        )}
        <Link
          href="/blueprints"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all border-l-2 border-l-transparent hover:border-l-primary/30"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          My Startups
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all border-l-2 border-l-transparent hover:border-l-primary/30"
        >
          <Command className="h-3.5 w-3.5" />
          Home
        </Link>
      </div>
    </aside>
  );
}
