import { WebsiteResult } from "../../types/ai.js";

export interface DeploymentFile {
  path: string;
  content: string;
}

export interface DeploymentResult {
  url: string;
  provider: string;
  deploymentId: string;
}

export interface DeploymentProvider {
  name: string;
  deploy(files: DeploymentFile[], siteName: string): Promise<DeploymentResult>;
  verify(url: string): Promise<VerificationResult>;
}

export interface VerificationResult {
  reachable: boolean;
  statusCode: number;
  hasContent: boolean;
  error?: string;
}
