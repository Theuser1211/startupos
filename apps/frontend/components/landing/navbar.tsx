"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import Link from "next/link";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">StartupOS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            className="text-xs font-mono text-muted-foreground hover:text-foreground"
          >
            Features
          </a>
          {user ? (
            <>
              <Link
                href="/workspace"
                className="text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Workspace
              </Link>
              <button
                onClick={async () => { await signOut(); }}
                className="text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/interview"
                className="text-xs font-mono text-primary hover:text-primary/80"
              >
                Try it
              </Link>
            </>
          )}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border">
          <div className="flex flex-col gap-1 px-6 py-3">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            {user ? (
              <>
                <Link
                  href="/workspace"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
                >
                  Workspace
                </Link>
                <button
                  onClick={async () => { await signOut(); setMobileOpen(false); }}
                  className="py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/interview"
                  onClick={() => setMobileOpen(false)}
                  className="py-1.5 text-xs font-mono text-primary"
                >
                  Try it
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
