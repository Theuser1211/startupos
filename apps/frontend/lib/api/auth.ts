"use client";

import { apiClient } from "./client";
import type { AuthUser, AuthResponse } from "@startupos/shared";

function parseUserFromToken(token: string): AuthUser | null {
  if (!apiClient.validateTokenFormat(token)) return null;
  if (apiClient.isTokenExpired(token)) return null;
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
  if (!apiClient.validateTokenFormat(token)) {
    apiClient.clearToken();
    return null;
  }
  if (apiClient.isTokenExpired(token)) {
    apiClient.clearToken();
    return null;
  }
  return parseUserFromToken(token);
}

export function logout(): void {
  apiClient.clearToken();
}

export function isAuthenticated(): boolean {
  const token = apiClient.getToken();
  if (!token) return false;
  if (!apiClient.validateTokenFormat(token)) return false;
  if (apiClient.isTokenExpired(token)) return false;
  return true;
}
