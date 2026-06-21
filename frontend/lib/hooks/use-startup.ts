"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStartups, getStartup, createStartup, type CreateStartupPayload } from "@/lib/api/startups";
import { generateBlueprint, getBlueprint, type GenerateBlueprintPayload } from "@/lib/api/blueprints";
import { generateWebsite, getWebsite, type GenerateWebsitePayload } from "@/lib/api/websites";
import { deploy, type DeployPayload } from "@/lib/api/deployments";
import { pollJob } from "@/lib/api/jobs";
import type { Startup, RawBlueprint } from "@/lib/types";

export function useStartups() {
  return useQuery<Startup[]>({
    queryKey: ["startups"],
    queryFn: getStartups,
  });
}

export function useStartup(id: string | null) {
  return useQuery<Startup>({
    queryKey: ["startup", id],
    queryFn: () => getStartup(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 3000;
      if (!data.blueprint) return 3000;
      return false;
    },
  });
}

export function useCreateStartup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStartupPayload) => createStartup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startups"] });
    },
  });
}

export function useBlueprint(id: string | null) {
  return useQuery<{ blueprint: RawBlueprint; id: string }>({
    queryKey: ["blueprint", id],
    queryFn: () => getBlueprint(id!),
    enabled: !!id,
  });
}

export function useGenerateBlueprint() {
  return useMutation({
    mutationFn: (payload: GenerateBlueprintPayload) => generateBlueprint(payload),
  });
}

export function useGenerateWebsite() {
  return useMutation({
    mutationFn: (payload: GenerateWebsitePayload) => generateWebsite(payload),
  });
}

export function useWebsite(id: string | null) {
  return useQuery({
    queryKey: ["website", id],
    queryFn: () => getWebsite(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      if ((data as { deployment_status?: string }).deployment_status === "deployed" ||
          (data as { deployment_status?: string }).deployment_status === "failed") return false;
      return 2000;
    },
  });
}

export function useDeploy() {
  return useMutation({
    mutationFn: (payload: DeployPayload) => deploy(payload),
  });
}

export function usePollJob(jobId: string | null) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => pollJob(jobId!),
    enabled: !!jobId,
    retry: false,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;
      if (data.status === "completed" || data.status === "failed") return false;
      return 2000;
    },
  });
}
