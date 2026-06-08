"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import Link from "next/link";

function ForgotPasswordForm() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-md px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary"
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-display font-bold mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            We sent a password reset link to <strong className="text-foreground">{email}</strong>.
            Click the link to create a new password.
          </p>
          <Link href="/auth/sign-in">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">
              Startup<span className="text-primary">OS</span>
            </span>
          </Link>
          <h1 className="text-2xl font-display font-bold mb-2">Forgot password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <Button type="submit" className="w-full glow-purple" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/auth/sign-in" className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 grid-bg" />
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
