"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
  updateEmail: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  resendVerification: async () => ({ error: null }),
  deleteAccount: async () => ({ error: null }),
  updateEmail: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const data = await res.json();
        setProfile(data as Profile);
      }
    } catch {
      // Profile fetch is best-effort
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile();
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/sign-in`,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/delete-account", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Failed to delete account" };
      }
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return { error: null };
    } catch {
      return { error: "Failed to delete account. Please contact support." };
    }
  }, []);

  const updateEmail = useCallback(async (email: string) => {
    const { error } = await supabase.auth.updateUser({ email });
    return { error: error?.message ?? null };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error || "Failed to update profile" };
      }
      const data = await res.json();
      setProfile(data as Profile);
      return { error: null };
    } catch {
      return { error: "Failed to update profile" };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, isLoading, signIn, signUp, signOut, resetPassword, updatePassword, resendVerification, deleteAccount, updateEmail, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
