"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/auth-context";
import { useStartups } from "@/lib/hooks/use-startup";
import { toFriendlyError, apiClient, type ApiError } from "@/lib/api/client";
import { Plus, Calendar, Loader2, AlertTriangle } from "lucide-react";

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
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-sm font-mono font-medium">StartupOS</Link>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <button onClick={handleSignOut} className="text-xs font-mono text-muted-foreground hover:text-foreground">Sign out</button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">My Startups</h1>
          <Button size="sm" className="text-xs font-mono" asChild>
            <Link href="/interview"><Plus className="h-3 w-3" /> New Startup</Link>
          </Button>
        </div>

        {!apiClient.getToken() ? (
          <div className="border border-border rounded p-8 text-center">
            <p className="text-sm text-muted-foreground font-mono mb-4">Sign in to save and manage startups.</p>
            <Button className="font-mono text-xs" asChild>
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="border border-border rounded p-4">
            {(error as unknown as ApiError).status === 401 ? (
              <>
                <p className="text-sm font-medium text-amber-400">Authentication required</p>
                <p className="text-xs text-muted-foreground mt-1">{(error as unknown as ApiError).tokenExisted ? "Your session has expired." : "Please sign up or sign in to continue."}</p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">Failed to load startups</p>
                <p className="text-xs text-muted-foreground mt-1">{toFriendlyError(error instanceof Error ? error.message : "Something went wrong")}</p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2 font-mono text-xs">Retry</Button>
              </>
            )}
          </div>
        ) : !startups || startups.length === 0 ? (
          <div className="border border-border rounded p-8 text-center">
            <p className="text-sm text-muted-foreground font-mono mb-4">No startups yet.</p>
            <Button className="font-mono text-xs" asChild>
              <Link href="/interview"><Plus className="h-3 w-3" /> Start Interview</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup) => (
              <div key={startup.id} className="border border-border rounded hover:border-muted-foreground/30 transition-colors">
                <div className="p-4">
                  <h3 className="text-sm font-medium mb-1 line-clamp-1">{startup.name}</h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{startup.idea || startup.description || ""}</p>

                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    {startup.industry && (
                      <span className="text-[9px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded">{startup.industry}</span>
                    )}
                    {startup.stage && (
                      <span className="text-[9px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded">{startup.stage}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-2">
                    {startup.createdAt && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3" />
                        {new Date(startup.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-1.5 font-mono" asChild>
                        <Link href={`/workspace?id=${startup.id}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
