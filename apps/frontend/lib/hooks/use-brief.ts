"use client";

import { useQuery } from "@tanstack/react-query";
import { getBrief } from "@/lib/api/brief";
import type { DailyBriefData } from "@startupos/shared";

export function useBrief(startupId: string | null) {
  return useQuery<DailyBriefData>({
    queryKey: ["brief", startupId],
    queryFn: () => getBrief(startupId!),
    enabled: !!startupId,
    refetchOnWindowFocus: false,
  });
}
