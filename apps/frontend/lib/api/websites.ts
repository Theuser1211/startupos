"use client";

import { apiClient } from "./client";
import type { Website } from "@/lib/types";
import type { GenerateWebsitePayload, GenerateWebsiteResponse, WebsiteResponse } from "@startupos/shared";

export async function generateWebsite(
  payload: GenerateWebsitePayload,
): Promise<GenerateWebsiteResponse> {
  return apiClient.post<GenerateWebsiteResponse>("/websites/generate", payload, { timeout: 120000 });
}

export async function getWebsite(id: string): Promise<Website> {
  const data = await apiClient.get<Website | WebsiteResponse>(`/websites/${id}`);
  if (data && typeof data === "object" && "website" in data) {
    return data.website;
  }
  return data as Website;
}

export async function getWebsiteByStartup(startupId: string): Promise<Website | null> {
  const data = await apiClient.get<{ website: Website | null }>(`/websites/by-startup/${startupId}`);
  return data?.website ?? null;
}
