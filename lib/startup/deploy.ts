/**
 * Vercel Deployment Client for StartupOS
 *
 * Takes a WebsiteSpec, renders it to HTML server-side, and deploys to Vercel.
 * Requires VERCEL_TOKEN environment variable to be set.
 *
 * Flow:
 * 1. Render WebsiteSpec → HTML
 * 2. Prepare deployment files
 * 3. Call Vercel REST API to create a deployment
 * 4. Poll for deployment status
 * 5. Return the deployment URL
 */

import { createServiceClient } from "@/lib/supabase/service";
import type { WebsiteSpec } from "@/lib/startup/website-spec";
import { validateWebsiteSpec } from "@/lib/startup/website-spec";

/* ─── Types ─── */

export type DeploymentProvider = "vercel";

export type DeploymentStatus = "pending" | "building" | "deployed" | "failed";

export interface DeployOptions {
  websiteSpec: WebsiteSpec;
  startupName: string;
  websiteId: string;
  userId: string;
  startupId?: string;
}

export interface DeployResult {
  success: boolean;
  url: string | null;
  status: DeploymentStatus;
  logs: string[];
}

/* ─── Constants ─── */

const VERCEL_API = "https://api.vercel.com";
const _VERCEL_DEPLOY_HOOK = process.env.VERCEL_DEPLOY_HOOK_URL || "";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || "";

/* ─── Deployment Log Helpers ─── */

let deploymentLogs: string[] = [];

function log(message: string) {
  const entry = `[${new Date().toISOString()}] ${message}`;
  deploymentLogs.push(entry);
  console.log("[Deploy]", entry);
}

function resetLogs() {
  deploymentLogs = [];
}

function getLogs(): string[] {
  return [...deploymentLogs];
}

/* ─── Vercel API Client ─── */

interface VercelDeploymentResponse {
  id: string;
  url: string;
  readyState: "INITIALIZING" | "BUILDING" | "READY" | "ERROR" | "CANCELED";
  state?: "INITIALIZING" | "BUILDING" | "READY" | "ERROR" | "CANCELED";
  alias: string[];
  createdAt: number;
  builder: { id: string };
  target: string;
}

/**
 * Create a deployment on Vercel by uploading files directly.
 * Uses the Vercel REST API v13.
 */
async function createVercelDeployment(
  html: string,
  projectName: string,
): Promise<{ deploymentId: string; url: string } | null> {
  if (!VERCEL_TOKEN) {
    log("VERCEL_TOKEN not configured — skipping deployment");
    return null;
  }

  // Prepare the file structure for Vercel
  // We deploy the HTML as an index.html in the root
  const files: Record<string, { file: string; data: string; encoding: "base64" }> = {
    "index.html": {
      file: "index.html",
      data: Buffer.from(html).toString("base64"),
      encoding: "base64",
    },
  };

  // Sanitize project name for Vercel (alphanumeric + hyphens only)
  const sanitizedName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "startup-site";

  // Each deployment gets a unique name to avoid URL collisions
  const uniqueName = `${sanitizedName}-${Date.now().toString(36)}`;

  log(`Creating Vercel deployment for "${projectName}" (${uniqueName})...`);

  try {
    const response = await fetch(`${VERCEL_API}/v13/deployments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: uniqueName,
        project: uniqueName,
        files,
        // Default Vercel project settings — static deployment
        framework: null,
        version: 2,
        // Skip build step since we're uploading static HTML
        builds: [
          {
            src: "index.html",
            use: "@vercel/static",
          },
        ],
        routes: [
          {
            src: "/(.*)",
            dest: "/index.html",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      log(`Vercel API error (${response.status}): ${errorBody}`);
      return null;
    }

    const data = (await response.json()) as VercelDeploymentResponse;
    log(`Deployment created: ${data.url}`);

    return {
      deploymentId: data.id,
      url: data.url,
    };
  } catch (err) {
    log(`Vercel API request failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    return null;
  }
}

/**
 * Poll for deployment readiness. Vercel deployments are typically
 * ready within seconds for static HTML.
 */
async function pollDeploymentStatus(
  deploymentId: string,
  maxRetries = 20,
  intervalMs = 2000,
): Promise<"READY" | "ERROR" | "CANCELED"> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(
        `${VERCEL_API}/v13/deployments/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
          },
        },
      );

      if (!response.ok) {
        log(`Status poll failed (${response.status}), retrying...`);
        await new Promise((r) => setTimeout(r, intervalMs));
        continue;
      }

      const data = (await response.json()) as VercelDeploymentResponse;
      const state = data.readyState || data.state || "BUILDING";

      if (state === "READY") return "READY";
      if (state === "ERROR") return "ERROR";
      if (state === "CANCELED") return "CANCELED";

      log(`Deployment status: ${state} (${i + 1}/${maxRetries})`);
    } catch {
      log(`Status poll error, retrying...`);
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  log("Deployment status poll timed out");
  return "ERROR";
}

/* ─── Main Deploy Function ─── */

/**
 * Deploy a generated landing page to Vercel.
 *
 * Steps:
 * 1. Create a Vercel deployment with the HTML content
 * 2. Poll until the deployment is ready
 * 3. Save the deployment record to the database
 * 4. Update the generated_websites record with the URL
 */
export async function deployToVercel(options: DeployOptions): Promise<DeployResult> {
  const { websiteSpec, startupName, websiteId, userId, startupId } = options;

  resetLogs();
  log(`Starting deployment for "${startupName}"...`);

  // Step 0: Render WebsiteSpec to HTML
  const { renderSpecToHtml } = await import("@/lib/startup/render-spec-to-html");
  const html = renderSpecToHtml(websiteSpec);

  if (!html) {
    log("Failed to render WebsiteSpec to HTML");
    return {
      success: false,
      url: null,
      status: "failed",
      logs: getLogs(),
    };
  }

  const supabase = createServiceClient();

  // STEP 1: Record the deployment in the database (pending)
  const { data: deploymentRecord, error: insertError } = await supabase
    .from("deployments")
    .insert({
      user_id: userId,
      website_id: websiteId,
      startup_id: startupId || null,
      provider: "vercel",
      deployment_status: "pending",
      deployment_logs: getLogs(),
      metadata: { startupName },
    })
    .select()
    .single();

  if (insertError || !deploymentRecord) {
    log(`Failed to create deployment record: ${insertError?.message || "Unknown"}`);
    return {
      success: false,
      url: null,
      status: "failed",
      logs: getLogs(),
    };
  }

  const deploymentId = deploymentRecord.id;

  // Update website status to building
  await supabase
    .from("generated_websites")
    .update({ deployment_status: "building" })
    .eq("id", websiteId);

  // STEP 2: Create the Vercel deployment
  const vercelResult = await createVercelDeployment(html, startupName);

  if (!vercelResult) {
    log("Vercel deployment creation failed");

    // Mark deployment as failed
    await supabase
      .from("deployments")
      .update({
        deployment_status: "failed",
        deployment_logs: getLogs(),
      })
      .eq("id", deploymentId);

    await supabase
      .from("generated_websites")
      .update({ deployment_status: "failed" })
      .eq("id", websiteId);

    return {
      success: false,
      url: null,
      status: "failed",
      logs: getLogs(),
    };
  }

  // Update deployment record with pending URL
  await supabase
    .from("deployments")
    .update({
      deployment_status: "building",
      deployment_url: `https://${vercelResult.url}`,
      deployment_logs: getLogs(),
    })
    .eq("id", deploymentId);

  // STEP 3: Poll for readiness
  const finalState = await pollDeploymentStatus(vercelResult.deploymentId);

  const isReady = finalState === "READY";
  const status: DeploymentStatus = isReady ? "deployed" : "failed";
  const finalUrl = isReady ? `https://${vercelResult.url}` : null;

  log(`Deployment ${isReady ? "succeeded" : "failed"}: ${finalUrl || "no URL"}`);

  // STEP 4: Update records
  await supabase
    .from("deployments")
    .update({
      deployment_status: status,
      deployment_url: finalUrl,
      deployment_logs: getLogs(),
    })
    .eq("id", deploymentId);

  await supabase
    .from("generated_websites")
    .update({
      deployment_status: status,
      deployment_url: finalUrl,
      deployment_logs: getLogs(),
    })
    .eq("id", websiteId);

  return {
    success: isReady,
    url: finalUrl,
    status,
    logs: getLogs(),
  };
}

/**
 * Retry a failed deployment.
 * Creates a new Vercel deployment using the same website's HTML content.
 */
export async function retryDeployment(
  websiteId: string,
  userId: string,
): Promise<DeployResult | null> {
  const supabase = createServiceClient();

  // Fetch the website content
  const { data: website } = await supabase
    .from("generated_websites")
    .select("*")
    .eq("id", websiteId)
    .eq("user_id", userId)
    .single();

  if (!website) {
    console.error("[Deploy] Website not found:", websiteId);
    return null;
  }

  const spec = (website.content as { websiteSpec?: WebsiteSpec })?.websiteSpec;
  const startupName = (website.metadata as { startupName?: string })?.startupName || "Startup";

  if (!spec || !validateWebsiteSpec(spec).success) {
    console.error("[Deploy] No valid WebsiteSpec found for website:", websiteId);
    return null;
  }

  return deployToVercel({
    websiteSpec: spec,
    startupName,
    websiteId,
    userId,
    startupId: website.startup_id || undefined,
  });
}
