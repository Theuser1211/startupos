"use client";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://startupos-backend-production.up.railway.app";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn;
}

export function clearUnauthorizedHandler() {
  unauthorizedHandler = null;
}

const TOKEN_KEY = "startupos-token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax; Secure`;
}

const friendlyMessages: [string, string][] = [
  ["all providers failed", "We're having trouble generating your startup right now. Please try again shortly."],
  ["prompt is required", "Your startup idea needs a description. Please complete the interview first."],
  ["rate limit", "You've made too many requests. Please wait a moment and try again."],
  ["invalid credentials", "Invalid email or password. Please try again."],
  ["unauthorized", "Your session has expired. Please sign in again."],
  ["not found", "The requested resource was not found. It may have been removed."],
  ["internal server error", "Something went wrong on our end. Please try again."],
  ["failed to fetch", "Unable to connect to the server. Please check your internet connection."],
];

export function toFriendlyError(raw: string, tokenExisted?: boolean): string {
  const lower = raw.toLowerCase();
  for (const [pattern, friendly] of friendlyMessages) {
    if (lower.includes(pattern)) {
      if (pattern === "unauthorized") {
        if (tokenExisted !== undefined ? tokenExisted : !!getToken()) {
          return "Your session has expired. Please sign in again.";
        }
        return "Please sign up or sign in to continue.";
      }
      return friendly;
    }
  }
  return raw;
}

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function validateTokenFormat(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  if (!parts[0] || !parts[1] || !parts[2]) return false;
  try {
    decodeJwtPayload(token);
    return true;
  } catch {
    return false;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return false;
  const exp = payload.exp as number;
  return Date.now() >= exp * 1000;
}

export interface ApiError {
  error: string;
  status: number;
  tokenExisted?: boolean;
}

function handleAuthFailure(): void {
  clearToken();
  unauthorizedHandler?.();
}

function redirectToSignIn(expired: boolean = false, redirectPath?: string): void {
  if (typeof window === "undefined") return;
  
  clearToken();
  const signInUrl = new URL("/auth/sign-in", window.location.origin);
  if (expired) signInUrl.searchParams.set("expired", "1");
  if (redirectPath) {
    signInUrl.searchParams.set("redirect", encodeURIComponent(redirectPath));
  } else {
    const currentPath = window.location.pathname + window.location.search;
    signInUrl.searchParams.set("redirect", encodeURIComponent(currentPath));
  }
  window.location.href = signInUrl.toString();
}

async function refreshAndGetToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const token = getToken();
      if (!token || !validateTokenFormat(token)) {
        handleAuthFailure();
        return null;
      }
      if (isTokenExpired(token)) {
        handleAuthFailure();
        return null;
      }
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        body: "{}",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        handleAuthFailure();
        return null;
      }
      const data = await res.json() as { token: string };
      if (!data.token || !validateTokenFormat(data.token)) {
        handleAuthFailure();
        return null;
      }
      setToken(data.token);
      return data.token;
    } catch (err) {
      console.error("[Auth] Refresh token failed:", err);
      handleAuthFailure();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const hasBody = !!options.body;
  const headers: Record<string, string> = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    if (!validateTokenFormat(token)) {
      console.warn("[Auth] Token format invalid, clearing");
      handleAuthFailure();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in?expired=1";
        return Promise.reject(new Error("Invalid token format"));
      }
    }
    if (isTokenExpired(token)) {
      console.warn("[Auth] Token expired, attempting refresh");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      if (res.status === 401 && token && path !== "/auth/refresh") {
        console.warn("[Auth] 401 received, attempting token refresh");
        const newToken = await refreshAndGetToken();
        if (newToken) {
          headers["Authorization"] = `Bearer ${newToken}`;
          const retryRes = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers,
          });
          if (retryRes.ok) {
            if (retryRes.status === 204) return undefined as T;
            return retryRes.json();
          }
        }
        console.warn("[Auth] Token refresh failed, redirecting to sign in");
        redirectToSignIn(true, path);
        throw new Error("Authentication failed - redirecting");
      }
      let body: { error?: string; message?: string } = {};
      try {
        body = await res.json();
      } catch {
        // ignore parse errors
      }
      const err: ApiError = {
        error: body.message || body.error || `Request failed with status ${res.status}`,
        status: res.status,
        tokenExisted: !!token,
      };
      throw err;
    }

    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err: unknown) {
    if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "AbortError") {
      const timeoutErr: ApiError = {
        error: "Request timed out. Please try again.",
        status: 0,
      };
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function get<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

async function post<T = unknown>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function put<T = unknown>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function del<T = unknown>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

export const apiClient = {
  request, get, post, put, del,
  getToken, setToken, clearToken, decodeJwtPayload,
  validateTokenFormat, isTokenExpired,
  BASE_URL,
};
