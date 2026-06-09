"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase/auth-context";
import { Sparkles, Plus, ExternalLink, Trash2, Calendar, Loader2, AlertTriangle, LogOut } from "lucide-react";
import Link from "next/link";

interface BlueprintSummary {
  id: string;
  name: string;
  idea: string;
  industry: string;
  stage: string;
  created_at: string;
}

export default function BlueprintsPage() {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [blueprints, setBlueprints] = useState<BlueprintSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBlueprints = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/blueprints");
      if (!res.ok) {
        throw new Error("Failed to load blueprints");
      }
      const data = await res.json();
      setBlueprints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/sign-in");
      return;
    }

    if (user) {
      fetchBlueprints(); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [user, authLoading, fetchBlueprints]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blueprint? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/blueprints?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setBlueprints((prev) => prev.filter((bp) => bp.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

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
      {/* Header */}
      <header className="glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/">
            <Image
              src="/logo-full.png"
              alt="StartupOS"
              width={1536}
              height={1024}
              className="h-5 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline ml-1.5">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">My Blueprints</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {blueprints.length} blueprint{blueprints.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <Button size="sm" className="glow-purple" asChild>
            <Link href="/interview">
              <Plus className="h-4 w-4" />
              New Blueprint
            </Link>
          </Button>
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">Loading your blueprints...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchBlueprints}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && blueprints.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/10">
                <Sparkles className="h-7 w-7 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold mb-2">No blueprints yet</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Complete the founder interview to generate your first startup blueprint.
              </p>
              <Button className="glow-purple" asChild>
                <Link href="/interview">
                  <Plus className="h-4 w-4" />
                  Start Interview
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && blueprints.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blueprints.map((bp, i) => (
              <motion.div
                key={bp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl p-5 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-600/20">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </div>
                  <button
                    onClick={() => handleDelete(bp.id)}
                    disabled={deletingId === bp.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    aria-label="Delete blueprint"
                  >
                    {deletingId === bp.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{bp.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{bp.idea}</p>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                    {bp.industry}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/5 text-muted-foreground">
                    {bp.stage}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(bp.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" asChild>
                    <Link href={`/workspace?id=${bp.id}`}>
                      Open
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
