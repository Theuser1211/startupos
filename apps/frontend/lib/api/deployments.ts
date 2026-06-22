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
}

export async function createDeployment(payload: DeployPayload): Promise<DeployResponse> {
  return apiClient.post<DeployResponse>("/deployments/create", payload);
}

export async function deploy(payload: DeployPayload): Promise<DeployResponse> {
  return apiClient.post<DeployResponse>("/deployments/create", payload);
}

export async function getDeployment(id: string): Promise<DeployResponse> {
  return apiClient.get<DeployResponse>(`/deployments/${id}`);
}
