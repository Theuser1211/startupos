import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  addDomainToVercel,
  verifyDomainOnVercel,
  removeDomainFromVercel,
  getDnsInstructions,
  saveDomainRecord,
  updateDomainStatus,
} from "@/lib/startup/domains";

/**
 * POST /api/domains
 * Add a custom domain to a deployed website.
 * Body: { domain: string, websiteId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domain, websiteId } = await request.json();

    if (!domain || !websiteId) {
      return NextResponse.json(
        { error: "domain and websiteId are required" },
        { status: 400 },
      );
    }

    // Validate domain format
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format. Use e.g. example.com" },
        { status: 400 },
      );
    }

    // Verify the user owns the website
    const serviceClient = createServiceClient();
    const { data: website } = await serviceClient
      .from("generated_websites")
      .select("id, user_id, deployment_url")
      .eq("id", websiteId)
      .single();

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }
    if (website.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Add domain to Vercel
    const vercelResult = await addDomainToVercel(domain);

    if (!vercelResult.success) {
      return NextResponse.json(
        { error: vercelResult.error || "Failed to add domain" },
        { status: 500 },
      );
    }

    // Get DNS instructions
    const dnsInstructions = getDnsInstructions(domain, vercelResult.verificationToken);

    // Save domain record
    const record = await saveDomainRecord(user.id, domain, websiteId, dnsInstructions);

    if (!record) {
      return NextResponse.json(
        { error: "Failed to save domain record" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      domainId: record.id,
      dnsInstructions,
      verificationToken: vercelResult.verificationToken,
      message: "Domain added. Update your DNS records to complete verification.",
    });
  } catch (error) {
    console.error("[Domains API] Error:", error);
    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/domains
 * List user's custom domains.
 * Query: ?websiteId=xxx (optional filter)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("websiteId");

    const serviceClient = createServiceClient();
    let query = serviceClient
      .from("custom_domains")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (websiteId) {
      query = query.eq("website_id", websiteId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ domains: data || [] });
  } catch (error) {
    console.error("[Domains API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/domains
 * Verify a custom domain.
 * Body: { domainId: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { domainId } = await request.json();
    if (!domainId) {
      return NextResponse.json({ error: "domainId is required" }, { status: 400 });
    }

    // Get domain record
    const serviceClient = createServiceClient();
    const { data: domainRecord } = await serviceClient
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .eq("user_id", user.id)
      .single();

    if (!domainRecord) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Verify on Vercel
    const result = await verifyDomainOnVercel(domainRecord.domain);

    // Update status
    await updateDomainStatus(domainId, result.verified ? "verified" : "failed");

    return NextResponse.json({
      verified: result.verified,
      status: result.verified ? "verified" : "failed",
      error: result.error,
    });
  } catch (error) {
    console.error("[Domains API] Error:", error);
    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/domains?id=xxx
 * Remove a custom domain.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get("id");

    if (!domainId) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Get the domain record
    const { data: domainRecord } = await serviceClient
      .from("custom_domains")
      .select("*")
      .eq("id", domainId)
      .eq("user_id", user.id)
      .single();

    if (!domainRecord) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    // Remove from Vercel
    await removeDomainFromVercel(domainRecord.domain);

    // Delete from database
    const { error } = await serviceClient
      .from("custom_domains")
      .delete()
      .eq("id", domainId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Domains API] Error:", error);
    return NextResponse.json(
      { error: "Failed to remove domain" },
      { status: 500 },
    );
  }
}
