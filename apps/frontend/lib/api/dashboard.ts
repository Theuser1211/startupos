"use client";

import { apiClient } from "./client";
import type { DashboardData } from "@startupos/shared";

export async function getDashboard(startupId: string): Promise<DashboardData> {
  return apiClient.get<DashboardData>(`/dashboard/${startupId}`);
}
