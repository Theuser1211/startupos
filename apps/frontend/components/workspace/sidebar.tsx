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

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1.5 mono-label">
          <Command className="h-3 w-3" />
          $ workspace
        </div>
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
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "text-primary bg-surface-green"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg border border-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("h-4 w-4 relative z-10", isActive && "text-primary")} />
              <span className="relative z-10 text-xs">{tab.label}</span>
              {isActive && (
                <motion.span
                  className="relative z-10 ml-auto w-1 h-1 rounded-full bg-primary"
                  layoutId="activeDot"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-1">
        <PanicButton blueprint={blueprint} />
      </div>

      <div className="px-3 py-3 border-t border-border space-y-0.5">
        <div className="px-3 pb-1.5 text-[10px] text-muted-foreground font-mono uppercase tracking-wider mono-label">$ nav</div>
        {startupId && (
          <>
            <Link
              href={`/dashboard?id=${startupId}`}
              className="terminal-list-item flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href={`/competitors?startupId=${startupId}`}
              className="terminal-list-item flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
            >
              <Crosshair className="h-3.5 w-3.5" />
              Competitors
            </Link>
          </>
        )}
        <Link
          href="/blueprints"
          className="terminal-list-item flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          My Startups
        </Link>
        <Link
          href="/"
          className="terminal-list-item flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-surface transition-all"
        >
          <Command className="h-3.5 w-3.5" />
          Home
        </Link>
      </div>
      <div className="ascii-divider" />
      <div className="px-3 py-2 flex gap-1.5 flex-wrap">
        <span className="sticker-badge">v1.0</span>
        <span className="sticker-badge">startupos</span>
        <span className="sticker-badge sticker-hover">~$ _</span>
      </div>
    </aside>
  );
}
