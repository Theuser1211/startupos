"use client";

import { apiClient } from "./client";

export interface DeployPayload {
  websiteId: string;
}

export interface DeployResponse {
  success?: boolean;
  url?: string;
  deployment_url?: string;
  status?: string;
  error?: string;
  vercelUrl?: string;
}

export async function deploy(payload: DeployPayload): Promise<DeployResponse> {
  const data = await apiClient.post<DeployResponse | { deployment: DeployResponse }>("/deployments/deploy", payload);
  if (data && typeof data === "object" && "deployment" in data) {
    return data.deployment;
  }
  return data as DeployResponse;
}
