"use client";

import { apiClient } from "./client";
import type { DailyBriefData } from "@startupos/shared";

export async function getBrief(startupId: string): Promise<DailyBriefData> {
  return apiClient.get<DailyBriefData>(`/brief/${startupId}`);
}
