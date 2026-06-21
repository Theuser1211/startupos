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
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { user: authUser } = await apiLogin(email, password);
      setUser(authUser);
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
