"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const redirectTo = searchParams.get("redirect") || "/interview";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        if (error.toLowerCase().includes("already registered") || error.toLowerCase().includes("already exists")) {
          setError("This email is already registered. Try signing in instead.");
        } else if (error.toLowerCase().includes("rate limit")) {
          setError("Too many attempts. Please wait a moment and try again.");
        } else {
          setError(error);
        }
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 text-center max-w-md px-6">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded bg-primary/10 border border-primary/20">
            <Check className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold mb-1">Account created</h1>
          <p className="text-xs text-muted-foreground mb-6 font-mono">
            $ welcome --onboard
          </p>
          <Button onClick={() => router.push(redirectTo)} className="font-mono text-xs border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary">
            start building
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <div className="p-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image src="/logo-full.png" alt="StartupOS" width={1536} height={1024} className="h-8 w-auto" priority />
          </Link>
          <h1 className="text-xl font-bold mb-1">create account</h1>
          <p className="text-xs font-mono text-muted-foreground">$ sign_up --save blueprints</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mono-label block text-xs mb-1.5">Email</label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div>
            <label htmlFor="password" className="mono-label block text-xs mb-1.5">Password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mono-label block text-xs mb-1.5">Confirm Password</label>
            <Input id="confirmPassword" type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>

          <Button type="submit" className="w-full font-mono text-xs border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-mono text-primary hover:underline">Sign in</Link>
        </p>
        </div>
      </div>
    </div>
  );
}

function SignUpFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpForm />
    </Suspense>
  );
}
