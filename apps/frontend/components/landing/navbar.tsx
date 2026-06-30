"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="mx-auto flex h-12 max-w-2xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm font-medium">
          StartupOS
        </Link>
        <Link
          href="/auth/sign-in"
          className="text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}
