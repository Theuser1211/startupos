"use client";

import { apiClient } from "./client";
import type { RawBlueprint } from "@/lib/types";

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

interface BlueprintWrapper {
  blueprint: RawBlueprint;
}

export async function getBlueprint(
  id: string,
): Promise<{ blueprint: RawBlueprint; id: string }> {
  const data = await apiClient.get<BlueprintWrapper>(`/blueprints/${id}`);
  return { blueprint: data.blueprint, id: data.blueprint.id || id };
}
