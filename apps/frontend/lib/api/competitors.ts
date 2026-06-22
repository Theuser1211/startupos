"use client";

import { apiClient } from "./client";
import type { CompetitorData, AddCompetitorPayload, CompetitorHistoryData } from "@startupos/shared";

export async function addCompetitor(payload: AddCompetitorPayload & { startupId: string }): Promise<CompetitorData> {
  const data = await apiClient.post<{ competitor: CompetitorData }>("/competitors", payload);
  return data.competitor;
}

export async function getCompetitors(startupId: string): Promise<CompetitorData[]> {
  const data = await apiClient.get<{ competitors: CompetitorData[] }>(`/competitors/${startupId}`);
  return data.competitors;
}

export async function getCompetitorHistory(competitorId: string): Promise<CompetitorHistoryData> {
  return apiClient.get<CompetitorHistoryData>(`/competitors/${competitorId}/history`);
}
