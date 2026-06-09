/**
 * Custom Domain Manager for StartupOS
 *
 * Integrates with Vercel API to add, verify, and manage custom domains
 * for deployed websites. Provides DNS configuration instructions.
 *
 * Requires VERCEL_TOKEN environment variable.
 */

import { createServiceClient } from "@/lib/supabase/service";

/* ─── Types ─── */

export type DomainStatus = "pending" | "verified" | "failed";

export interface DomainConfig {
  id: string;
  domain: string;
  verificationStatus: DomainStatus;
  dnsConfig: {
    type: string;
    name: string;
    value: string;
  }[];
  verifiedAt: string | null;
  createdAt: string;
}

export interface VercelDomainResponse {
  name: string;
  verified: boolean;
  verification: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
}

/* ─── Constants ─── */

const VERCEL_API = "https://api.vercel.com";
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || "";
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || "";
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || "";

/* ─── DNS Templates ─── */

const DNS_INSTRUCTIONS: Record<string, { type: string; name: string; value: string; ttl: string }[]> = {
  vercel: [
    { type: "CNAME", name: "@", value: "cname.vercel-dns.com", ttl: "600" },
    { type: "TXT", name: "@", value: "vc-domain-verify=[[token]]", ttl: "600" },
  ],
};

export function getDnsInstructions(
  domain: string,
  verificationToken?: string,
): { type: string; name: string; value: string; ttl: string }[] {
  return DNS_INSTRUCTIONS.vercel.map((record) => ({
    ...record,
    value: verificationToken
      ? record.value.replace("[[token]]", verificationToken)
      : record.value,
  }));
}

/* ─── Vercel API Integration ─── */

function vercelHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json",
  };
  if (VERCEL_TEAM_ID) headers["x-vercel-team-id"] = VERCEL_TEAM_ID;
  return headers;
}

const vercelBase = (path: string) => {
  const qs = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : "";
  return `${VERCEL_API}${path}${qs}`;
};

/**
 * Add a domain to a Vercel project.
 * Returns DNS verification instructions.
 */
export async function addDomainToVercel(
  domain: string,
): Promise<{ success: boolean; verificationToken?: string; error?: string }> {
  if (!VERCEL_TOKEN) {
    return { success: false, error: "VERCEL_TOKEN not configured" };
  }
  if (!VERCEL_PROJECT_ID) {
    return { success: false, error: "VERCEL_PROJECT_ID not configured" };
  }

  try {
    const response = await fetch(
      vercelBase(`/v10/projects/${VERCEL_PROJECT_ID}/domains`),
      {
        method: "POST",
        headers: vercelHeaders(),
        body: JSON.stringify({ name: domain }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const msg = data.error?.message || data.message || "Failed to add domain";
      return { success: false, error: msg };
    }

    // Extract verification token from Vercel response
    const verification = data.verification?.[0];
    const verificationToken = verification?.value?.split("=")[1];

    return { success: true, verificationToken };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Verify domain ownership on Vercel.
 */
export async function verifyDomainOnVercel(
  domain: string,
): Promise<{ verified: boolean; error?: string }> {
  if (!VERCEL_TOKEN) {
    return { verified: false, error: "VERCEL_TOKEN not configured" };
  }

  try {
    const response = await fetch(
      vercelBase(`/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}/verify`),
      {
        method: "POST",
        headers: vercelHeaders(),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return { verified: false, error: data.error?.message || "Verification failed" };
    }

    return { verified: data.verified || false };
  } catch (err) {
    return {
      verified: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Check domain status on Vercel.
 */
export async function checkDomainStatus(
  domain: string,
): Promise<{ verified: boolean; verification: VercelDomainResponse["verification"] }> {
  const response = await fetch(
    vercelBase(`/v6/domains/${domain}`),
    { headers: vercelHeaders() },
  );

  const data = await response.json();
  return {
    verified: data.verified || false,
    verification: data.verification || [],
  };
}

/**
 * Remove a domain from a Vercel project.
 */
export async function removeDomainFromVercel(
  domain: string,
): Promise<{ success: boolean; error?: string }> {
  if (!VERCEL_TOKEN) {
    return { success: false, error: "VERCEL_TOKEN not configured" };
  }

  try {
    const response = await fetch(
      vercelBase(`/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}`),
      { method: "DELETE", headers: vercelHeaders() },
    );

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.error?.message || "Failed to remove domain" };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/* ─── Database Operations ─── */

/**
 * Save a custom domain record to Supabase.
 */
export async function saveDomainRecord(
  userId: string,
  domain: string,
  websiteId: string,
  dnsConfig: DomainConfig["dnsConfig"],
): Promise<{ id: string } | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("custom_domains")
    .insert({
      user_id: userId,
      website_id: websiteId,
      domain,
      dns_config: dnsConfig,
      verification_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[Domains] Failed to save domain record:", error);
    return null;
  }

  return data;
}

/**
 * Update domain verification status.
 */
export async function updateDomainStatus(
  domainId: string,
  status: DomainStatus,
): Promise<boolean> {
  const supabase = createServiceClient();

  const update: Record<string, unknown> = {
    verification_status: status,
  };
  if (status === "verified") {
    update.verified_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("custom_domains")
    .update(update)
    .eq("id", domainId);

  return !error;
}

/**
 * Fetch user's custom domains.
 */
export async function getUserDomains(userId: string): Promise<DomainConfig[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("custom_domains")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Domains] Failed to fetch domains:", error);
    return [];
  }

  return (data || []).map((d) => ({
    id: d.id,
    domain: d.domain,
    verificationStatus: d.verification_status as DomainStatus,
    dnsConfig: d.dns_config as DomainConfig["dnsConfig"],
    verifiedAt: d.verified_at,
    createdAt: d.created_at,
  }));
}
