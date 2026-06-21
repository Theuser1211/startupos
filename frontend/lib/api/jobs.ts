"use client";

import { apiClient } from "./client";
import type { Job } from "@/lib/types";

interface JobWrapper {
  job: Job;
}

function normalizeJob(job: Job): Job {
  return {
    ...job,
    status: job.status?.toLowerCase() as Job["status"],
  };
}

export async function getJob(id: string): Promise<Job> {
  const data = await apiClient.get<Job | JobWrapper>(`/jobs/${id}`);
  if (data && typeof data === "object" && "job" in data) {
    return normalizeJob(data.job);
  }
  return normalizeJob(data as Job);
}

export async function pollJob(
  id: string,
  options: { intervalMs?: number; maxAttempts?: number } = {},
): Promise<Job> {
  const { intervalMs = 2000, maxAttempts = 90 } = options;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const job = await getJob(id);
    if (job.status === "completed" || job.status === "failed") {
      return job;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    attempts++;
  }

  throw new Error("Job polling timed out");
}
