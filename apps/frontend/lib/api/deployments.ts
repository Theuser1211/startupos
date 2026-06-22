"use client";

import { apiClient } from "./client";
import type { DeployPayload, DeployResponse } from "@startupos/shared";

export async function createDeployment(payload: DeployPayload): Promise<DeployResponse> {
  return apiClient.post<DeployResponse>("/deployments/create", payload);
}

export async function deploy(payload: DeployPayload): Promise<DeployResponse> {
  return apiClient.post<DeployResponse>("/deployments/create", payload);
}

export async function getDeployment(id: string): Promise<DeployResponse> {
  return apiClient.get<DeployResponse>(`/deployments/${id}`);
}
