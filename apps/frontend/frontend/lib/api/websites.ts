"use client";

import { apiClient } from "./client";
import type { Website } from "@/lib/types";

export interface GenerateWebsitePayload {
  startupId: string;
}

export interface GenerateWebsiteResponse {
  websiteId?: string;
  jobId?: string;
  status: string;
}

interface WebsiteWrapper {
  website: Website;
}

export async function generateWebsite(
  payload: GenerateWebsitePayload,
): Promise<GenerateWebsiteResponse> {
  return apiClient.post<GenerateWebsiteResponse>("/websites/generate", payload);
}

export async function getWebsite(id: string): Promise<Website> {
  const data = await apiClient.get<Website | WebsiteWrapper>(`/websites/${id}`);
  if (data && typeof data === "object" && "website" in data) {
    return data.website;
  }
  return data as Website;
}
