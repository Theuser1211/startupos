"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/api/dashboard";
import type { DashboardData } from "@startupos/shared";

export function useDashboard(startupId: string | null) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", startupId],
    queryFn: () => getDashboard(startupId!),
    enabled: !!startupId,
  });
}
