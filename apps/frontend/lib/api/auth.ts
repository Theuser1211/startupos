"use client";

import { apiClient } from "./client";
import type { AuthUser, AuthResponse } from "@startupos/shared";

export async function refreshToken(): Promise<string | null> {
  try {
    const data = await apiClient.post<{ token: string }>("/auth/refresh", {});
    apiClient.setToken(data.token);
    return data.token;
  } catch {
    apiClient.clearToken();
    return null;
  }
}

function parseUserFromToken(token: string): AuthUser | null {
  const payload = apiClient.decodeJwtPayload(token);
  if (!payload) return null;
  return {
    id: (payload.userId as string) || (payload.sub as string) || (payload.id as string) || "",
    email: (payload.email as string) || "",
    name: (payload.name as string) || (payload.username as string) || "",
  };
}

export async function register(
  email: string,
  password: string,
  name?: string,
): Promise<{ user: AuthUser; token: string }> {
  const data = await apiClient.post<AuthResponse>("/auth/register", {
    email,
    password,
    name: name || email.split("@")[0],
  });
  apiClient.setToken(data.token);
  const user = data.user || parseUserFromToken(data.token) || { id: "", email };
  return { user, token: data.token };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser; token: string }> {
  const data = await apiClient.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  apiClient.setToken(data.token);
  const user = data.user || parseUserFromToken(data.token) || { id: "", email };
  return { user, token: data.token };
}

export function getCurrentUser(): AuthUser | null {
  const token = apiClient.getToken();
  if (!token) return null;
  return parseUserFromToken(token);
}

export function logout(): void {
  apiClient.clearToken();
}

export function isAuthenticated(): boolean {
  const token = apiClient.getToken();
  if (!token) return false;
  const payload = apiClient.decodeJwtPayload(token);
  if (payload?.exp && typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return false;
  }
  return true;
}
