"use client";

import { apiClient } from "./client";
import type { StartupBlueprint } from "@/lib/types";
import type { GenerateBlueprintPayload, GenerateBlueprintResponse } from "@startupos/shared";

export async function generateBlueprint(
  payload: GenerateBlueprintPayload,
): Promise<GenerateBlueprintResponse> {
  return apiClient.post<GenerateBlueprintResponse>("/blueprints/generate", payload, { timeout: 180000 });
}

export async function getBlueprint(
  id: string,
): Promise<{ blueprint: StartupBlueprint; id: string }> {
  return apiClient.get(`/blueprints/${id}`);
}
