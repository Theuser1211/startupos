"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStartups, getStartup, createStartup } from "@/lib/api/startups";
import { generateBlueprint, getBlueprint } from "@/lib/api/blueprints";
import { generateWebsite, getWebsite } from "@/lib/api/websites";
import { deploy } from "@/lib/api/deployments";
import { apiClient } from "@/lib/api/client";
import type { CreateStartupPayload, GenerateBlueprintPayload, GenerateWebsitePayload, DeployPayload } from "@startupos/shared";
import type { Startup, StartupBlueprint } from "@/lib/types";

export function useStartups() {
  return useQuery<Startup[]>({
    queryKey: ["startups"],
    queryFn: getStartups,
    enabled: !!apiClient.getToken(),
  });
}

export function useStartup(id: string | null) {
  return useQuery<Startup>({
    queryKey: ["startup", id],
    queryFn: () => getStartup(id!),
    enabled: !!id && !!apiClient.getToken(),
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
  return useQuery<{ blueprint: StartupBlueprint; id: string }>({
    queryKey: ["blueprint", id],
    queryFn: () => getBlueprint(id!),
    enabled: !!id && !!apiClient.getToken(),
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
  });
}

export function useDeploy() {
  return useMutation({
    mutationFn: (payload: DeployPayload) => deploy(payload),
  });
}
