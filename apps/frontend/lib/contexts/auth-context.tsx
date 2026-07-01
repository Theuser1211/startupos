"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from "@/lib/api/auth";
import { apiClient, setUnauthorizedHandler, clearUnauthorizedHandler } from "@/lib/api/client";
import type { AuthUser } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);

    const handler = () => {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in?expired=1";
      }
    };

    setUnauthorizedHandler(handler);

    return () => {
      clearUnauthorizedHandler();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { user: authUser } = await apiLogin(email, password);
      setUser(authUser);
      document.cookie = "startupos-guest=; path=/; max-age=0";
      return { error: null };
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "error" in err
          ? (err as { error: string }).error
          : "Sign in failed";
      return { error: message };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { user: authUser } = await apiRegister(email, password);
      setUser(authUser);
      document.cookie = "startupos-guest=; path=/; max-age=0";
      return { error: null };
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "error" in err
          ? (err as { error: string }).error
          : "Sign up failed";
      return { error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    apiLogout();
    setUser(null);
    document.cookie = "startupos-guest=; path=/; max-age=0";
    if (typeof window !== "undefined") {
      window.location.href = "/auth/sign-in";
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
