"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2, Check, Eye, EyeOff, AlertTriangle, ArrowLeft, LogOut,
  User, Building2, Briefcase, CreditCard,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, updateEmail, updatePassword, updateProfile, deleteAccount, signOut } = useAuth();

  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailLoading(true);
    const { error } = await updateEmail(newEmail);
    if (error) {
      setEmailError(error);
    } else {
      setEmailSuccess("Confirmation email sent. Check your inbox to verify the new address.");
      setNewEmail("");
    }
    setEmailLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);
    const { error } = await updatePassword(password);
    if (error) {
      setPasswordError(error);
    } else {
      setPasswordSuccess("Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeleteLoading(true);

    const { error } = await deleteAccount();
    if (error) {
      setDeleteError(error);
      setDeleteLoading(false);
    }
    // If successful, the context signs out and redirects
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) {
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
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blueprints">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline ml-1.5">My Blueprints</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-display font-bold">Account Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Signed in as <span className="text-foreground">{user.email}</span>
          </p>
        </div>

        {/* Change Email */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-glass-border bg-glass-bg p-6 space-y-4"
        >
          <div>
            <h2 className="text-base font-semibold">Change Email</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              A confirmation link will be sent to your new address
            </p>
          </div>

          <form onSubmit={handleUpdateEmail} className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="New email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <Button type="submit" disabled={emailLoading} size="sm">
              {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
          </form>

          {emailError && (
            <p className="text-xs text-red-400">{emailError}</p>
          )}
          {emailSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-400 flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> {emailSuccess}
            </motion.p>
          )}
        </motion.section>

        {/* Change Password */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-glass-border bg-glass-bg p-6 space-y-4"
        >
          <div>
            <h2 className="text-base font-semibold">Change Password</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose a strong password with at least 6 characters
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button type="submit" disabled={passwordLoading} size="sm">
              {passwordLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>

          {passwordError && (
            <p className="text-xs text-red-400">{passwordError}</p>
          )}
          {passwordSuccess && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-400 flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> {passwordSuccess}
            </motion.p>
          )}
        </motion.section>

        {/* Profile Info */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-glass-border bg-glass-bg p-6 space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Profile Information</h2>
              <p className="text-xs text-muted-foreground">
                Update your public profile details
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="displayName" className="block text-xs font-medium text-foreground mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  className="pl-9"
                  placeholder="Your name"
                  defaultValue={profile?.display_name || ""}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && val !== profile?.display_name) {
                      updateProfile({ display_name: val });
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label htmlFor="companyName" className="block text-xs font-medium text-foreground mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  className="pl-9"
                  placeholder="Your startup or company"
                  defaultValue={profile?.company_name || ""}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && val !== profile?.company_name) {
                      updateProfile({ company_name: val });
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block text-xs font-medium text-foreground mb-1.5">
                Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="role"
                  className="pl-9"
                  placeholder="e.g. Founder, CEO, Developer"
                  defaultValue={profile?.role || ""}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && val !== profile?.role) {
                      updateProfile({ role: val });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link href="/billing">
              <Button variant="outline" size="sm" className="gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Billing & Plan
              </Button>
            </Link>
          </div>
        </motion.section>

        {/* Delete Account */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-red-400">Delete Account</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>

          {!deleteConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirm(true)}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              Delete my account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-red-400/80">
                Are you sure? This will permanently delete all your blueprints, startups, logos, and website deployments.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {deleteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Yes, delete my account"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
              </div>
              {deleteError && (
                <p className="text-xs text-red-400">{deleteError}</p>
              )}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
