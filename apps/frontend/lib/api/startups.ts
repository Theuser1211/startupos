"use client";

import { apiClient } from "./client";
import type { Startup, CreateStartupPayload } from "@startupos/shared";
import type { StartupResponse, StartupsResponse } from "@startupos/shared";

export async function createStartup(payload: CreateStartupPayload): Promise<Startup> {
  const data = await apiClient.post<StartupResponse>("/startups", payload);
  return data.startup;
}

export async function getStartups(): Promise<Startup[]> {
  const data = await apiClient.get<Startup[] | StartupsResponse>("/startups");
  return Array.isArray(data) ? data : data.startups || [];
}

export async function getStartup(id: string): Promise<Startup> {
  const data = await apiClient.get<StartupResponse>(`/startups/${id}`);
  return data.startup;
}
