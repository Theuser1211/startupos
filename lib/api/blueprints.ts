"use client";

import { apiClient } from "./client";
import type { StartupBlueprint } from "@/lib/types";

export interface GenerateBlueprintPayload {
  startupId: string;
  prompt: string;
}

export interface GenerateBlueprintResponse {
  jobId: string;
  status: string;
}

export async function generateBlueprint(
  payload: GenerateBlueprintPayload,
): Promise<GenerateBlueprintResponse> {
  return apiClient.post<GenerateBlueprintResponse>("/blueprints/generate", payload);
}

export async function getBlueprint(
  id: string,
): Promise<{ blueprint: StartupBlueprint; id: string }> {
  return apiClient.get(`/blueprints/${id}`);
}
