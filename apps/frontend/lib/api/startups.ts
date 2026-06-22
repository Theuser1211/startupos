"use client";

import { apiClient } from "./client";
import type { Startup } from "@/lib/types";

export interface CreateStartupPayload {
  name: string;
  industry?: string;
  description?: string;
  logo?: string;
}

interface StartupWrapper {
  startup: Startup;
}

interface StartupsWrapper {
  startups: Startup[];
}

export async function createStartup(payload: CreateStartupPayload): Promise<Startup> {
  const data = await apiClient.post<StartupWrapper>("/startups", payload);
  return data.startup;
}

export async function getStartups(): Promise<Startup[]> {
  const data = await apiClient.get<Startup[] | StartupsWrapper>("/startups");
  return Array.isArray(data) ? data : data.startups || [];
}

export async function getStartup(id: string): Promise<Startup> {
  const data = await apiClient.get<StartupWrapper>(`/startups/${id}`);
  return data.startup;
}
