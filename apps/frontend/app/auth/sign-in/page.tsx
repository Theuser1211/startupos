"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/workspace";
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      if (error.toLowerCase().includes("invalid credentials") || error.toLowerCase().includes("invalid login")) {
        setError("Invalid email or password. Please try again.");
      } else if (error.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email address before signing in.");
      } else if (error.toLowerCase().includes("rate limit")) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(error);
      }
      setIsLoading(false);
    } else {
      router.push(redirect);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Image src="/logo-full.png" alt="StartupOS" width={1536} height={1024} className="h-8 w-auto" priority />
          </Link>
          <h1 className="text-2xl font-display font-bold mb-2">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to access your blueprints</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full glow-purple" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="text-primary hover:underline">Sign up</Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/interview" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Continue without signing in →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 grid-bg" />
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
