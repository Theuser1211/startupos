"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompetitors, addCompetitor, getCompetitorHistory } from "@/lib/api/competitors";
import { apiClient } from "@/lib/api/client";
import type { CompetitorData, AddCompetitorPayload, CompetitorHistoryData } from "@startupos/shared";

export function useCompetitors(startupId: string | null) {
  return useQuery<CompetitorData[]>({
    queryKey: ["competitors", startupId],
    queryFn: () => getCompetitors(startupId!),
    enabled: !!startupId && !!apiClient.getToken(),
  });
}

export function useCompetitorHistory(competitorId: string | null) {
  return useQuery<CompetitorHistoryData>({
    queryKey: ["competitor-history", competitorId],
    queryFn: () => getCompetitorHistory(competitorId!),
    enabled: !!competitorId && !!apiClient.getToken(),
  });
}

export function useAddCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddCompetitorPayload & { startupId: string }) => addCompetitor(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["competitors", variables.startupId] });
    },
  });
}
