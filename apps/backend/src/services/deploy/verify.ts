import { DeploymentProvider, VerificationResult } from "./types.js";
import { logger } from "../../lib/logger.js";

export async function verifyDeployment(
  provider: DeploymentProvider,
  url: string,
  maxRetries = 3,
  delayMs = 5000,
): Promise<VerificationResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logger.info({ url, attempt }, "Verifying deployment");

    const result = await provider.verify(url);

    if (result.reachable && result.hasContent) {
      logger.info({ url, statusCode: result.statusCode }, "Deployment verified successfully");
      return result;
    }

    if (result.hasContent && (result.statusCode === 401 || result.statusCode === 403)) {
      logger.warn(
        { url, statusCode: result.statusCode },
        "Deployment has content but is behind auth (Vercel Deployment Protection). Treating as success.",
      );
      return { ...result, reachable: true };
    }

    if (attempt < maxRetries) {
      logger.warn(
        { url, attempt, statusCode: result.statusCode, hasContent: result.hasContent },
        `Deployment not ready, retrying in ${delayMs}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  const lastResult = await provider.verify(url);
  logger.error({ url, result: lastResult }, "Deployment verification failed after all retries");
  return lastResult;
}
