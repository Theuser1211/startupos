"use client";

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://startupos-backend-production.up.railway.app";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const TOKEN_KEY = "startupos-token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

interface ApiError {
  error: string;
  status: number;
}

async function refreshAndGetToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const token = getToken();
      if (!token) return null;
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        clearToken();
        return null;
      }
      const data = await res.json() as { token: string };
      setToken(data.token);
      return data.token;
    } catch {
      clearToken();
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && token && path !== "/auth/refresh") {
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
    };
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json();
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
  BASE_URL,
};
