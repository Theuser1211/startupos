"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Globe,
  Palette,
  ImageIcon,
  Target,
  DollarSign,
  Map,
  Flame,
  Scale,
  LucideIcon,
  Sparkles,
  FolderOpen,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  { id: "logo", label: "Logo", icon: ImageIcon },
  { id: "icp", label: "ICP", icon: Target },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "roast", label: "Roast", icon: Flame },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  founderName?: string;
  blueprintId?: string;
  isPublished?: boolean;
  shareToken?: string | null;
  onPublishToggle?: () => void | Promise<void>;
}

export function Sidebar({
  activeTab,
  onTabChange,
  founderName,
  blueprintId,
  isPublished,
  shareToken,
  onPublishToggle,
}: SidebarProps) {
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/public/${shareToken}`
    : null;

  const handlePublishToggle = async () => {
    if (!onPublishToggle) return;

    if (isPublished) {
      const confirmed = window.confirm("Are you sure you want to unpublish this blueprint? The public URL will no longer work.");
      if (!confirmed) return;
    }

    setPublishing(true);
    try {
      await onPublishToggle();
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-glass-border bg-background/50 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-5 border-b border-glass-border">
        <Image
          src="/logo-square.png"
          alt="StartupOS"
          width={1254}
          height={1254}
          className="h-7 w-7 shrink-0"
          priority
        />
        <span className="text-sm font-bold tracking-tight">
          Startup<span className="text-primary">OS</span>
        </span>
      </div>

      {/* Founder info */}
      {founderName && (
        <div className="px-5 py-4 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {founderName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{founderName}</p>
              <p className="text-xs text-muted-foreground">Founder</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={cn("h-4 w-4 relative z-10", isActive && "text-primary")} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Publish section */}
      {blueprintId && (
        <div className="px-3 py-3 border-t border-glass-border space-y-2">
          {isPublished && shareUrl && (
            <div className="flex items-center gap-1 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate flex-1">
                {shareUrl}
              </span>
              <button
                onClick={handleCopyUrl}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                title="Copy URL"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
          <button
            onClick={handlePublishToggle}
            disabled={publishing}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
              isPublished
                ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
              publishing && "opacity-50 cursor-not-allowed"
            )}
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            {publishing ? "Publishing..." : isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      )}

      {/* Back link */}
      <div className="px-3 py-3 border-t border-glass-border space-y-1">
        <Link
          href="/blueprints"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          My Blueprints
        </Link>
        <Link
          href="/auth/settings"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Settings
        </Link>
        <Link
          href="/billing"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <DollarSign className="h-3.5 w-3.5" />
          Billing
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </div>
    </aside>
  );
}
