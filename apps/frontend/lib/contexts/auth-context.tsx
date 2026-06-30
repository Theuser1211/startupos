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
import { apiClient as apiClientModule } from "@/lib/api/client";
import type { AuthUser } from "@/lib/types";
import { useRouter } from "next/navigation";

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

async function validateTokenWithBackend(token: string): Promise<AuthUser | null> {
  try {
    const res = await apiClientModule.request<{ user: AuthUser }>("/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.user;
  } catch (err: unknown) {
    const apiError = err as { status?: number; error?: string };
    if (apiError?.status === 401) {
      return null;
    }
    throw err;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      const token = apiClient.getToken();
      if (!token) {
        if (mounted) setIsLoading(false);
        return;
      }

      const localUser = getCurrentUser();
      if (!localUser) {
        apiClient.clearToken();
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const validatedUser = await validateTokenWithBackend(token);
        if (mounted) {
          if (validatedUser) {
            setUser(validatedUser);
          } else {
            apiClient.clearToken();
            setUser(null);
            router.push("/auth/sign-in?expired=1");
          }
        }
      } catch {
        if (mounted) {
          apiClient.clearToken();
          setUser(null);
          router.push("/auth/sign-in?expired=1");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const handler = () => {
      apiClient.clearToken();
      setUser(null);
      router.push("/auth/sign-in?expired=1");
    };

    setUnauthorizedHandler(handler);

    return () => {
      mounted = false;
      clearUnauthorizedHandler();
    };
  }, [router]);

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
    router.push("/auth/sign-in");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
