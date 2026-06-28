"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { useStartups } from "@/lib/hooks/use-startup";
import { toFriendlyError } from "@/lib/api/client";
import { Sparkles, Plus, ExternalLink, Calendar, Loader2, AlertTriangle, LogOut, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function BlueprintsPage() {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { data: startups, isLoading, error, refetch } = useStartups();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-[#0d0d10] border-b border-[rgba(34,197,94,0.12)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/">
            <Image src="/logo-full.png" alt="StartupOS" width={1536} height={1024} className="h-5 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <ProfileDropdown email={user.email} onSignOut={handleSignOut} />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">My Startups</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {startups?.length || 0} startup{(startups?.length || 0) !== 1 ? "s" : ""} saved
            </p>
          </div>
          <Button size="sm" className="glow-green-btn text-xs font-mono" asChild>
            <Link href="/interview"><Plus className="h-4 w-4" /> New Startup</Link>
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <p className="font-mono text-sm text-primary animate-pulse">$ loading startups...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-sm">
              {(error as { status?: number }).status === 401 ? (
                <>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangle className="h-6 w-6 text-amber-400" />
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">Authentication required</p>
                  <p className="text-xs text-muted-foreground mb-4">Your session has expired. Please sign in to continue.</p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{toFriendlyError(error instanceof Error ? error.message : "Something went wrong")}</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
                </>
              )}
            </div>
          </div>
        )}

        {!isLoading && !error && (!startups || startups.length === 0) && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2 font-mono">No startups yet</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">No startups yet. Complete the founder interview to create your first blueprint.</p>
              <Button className="glow-green-btn text-xs font-mono" asChild>
                <Link href="/interview"><Plus className="h-4 w-4" /> Start Interview</Link>
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && startups && startups.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup, i) => (
              <motion.div
                key={startup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="terminal-card group relative p-5 hover:border-primary/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                </div>

                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{startup.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{startup.idea || startup.description || ""}</p>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {startup.industry && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">{startup.industry}</span>
                  )}
                  {startup.stage && (
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/5 text-muted-foreground">{startup.stage}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  {startup.createdAt && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(startup.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                      <Link href={`/dashboard?id=${startup.id}`}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                      <Link href={`/competitors?startupId=${startup.id}`}>
                        Competitors
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                      <Link href={`/workspace?id=${startup.id}`}>
                        Open <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProfileDropdown({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const initial = email?.charAt(0).toUpperCase() || "U";

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label="User menu" aria-expanded={open}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/80 text-[10px] font-bold text-white">{initial}</div>
        <span className="hidden sm:inline max-w-[140px] truncate">{email}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-[rgba(34,197,94,0.12)] bg-[#0d0d10] shadow-xl z-50 overflow-hidden"
        >
          <div className="px-3 py-2.5 border-b border-glass-border">
            <p className="text-xs font-medium truncate">{email}</p>
            <p className="text-[10px] text-muted-foreground">Signed in</p>
          </div>
          <div className="p-1">
            <button onClick={() => { setOpen(false); onSignOut(); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
