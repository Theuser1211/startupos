/**
 * Email Notification Module
 *
 * Sends transactional email notifications when website generation completes.
 * Uses MailerSend API with a lightweight fetch wrapper (no SDK dependency issues).
 *
 * Env vars required:
 *   MAILERSEND_API_KEY  — MailerSend API key (server-side only)
 *   MAILERSEND_FROM_EMAIL — verified sender email in MailerSend
 *   MAILERSEND_FROM_NAME — sender display name (defaults to "StartupOS")
 */

import { createServiceClient } from "@/lib/supabase/service";

/* ─── Types ─── */

export interface WebsiteCompleteEmailData {
  userName: string;
  startupName: string;
  sectionsCount: number;
  workspaceUrl: string;
  previewUrl?: string;
  generationTimeMs?: number;
}

/* ─── Constants ─── */

const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY || "";
const FROM_EMAIL = process.env.MAILERSEND_FROM_EMAIL || "noreply@startupos.app";
const FROM_NAME = process.env.MAILERSEND_FROM_NAME || "StartupOS";

const MAILERSEND_API = "https://api.mailersend.com/v1";

/* ─── Send Email via MailerSend API ─── */

interface MailerSendResponse {
  message?: string;
  errors?: Array<{ message: string; field?: string }>;
}

/**
 * Send a raw email via the MailerSend REST API.
 * Uses fetch directly to avoid SDK module resolution issues in Next.js serverless.
 */
async function sendMailerSendEmail(params: {
  to: { email: string; name?: string }[];
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
}): Promise<{ success: boolean; error?: string }> {
  if (!MAILERSEND_API_KEY) {
    console.warn("[Email] MAILERSEND_API_KEY not configured — skipping email");
    return { success: false, error: "MAILERSEND_API_KEY not configured" };
  }

  try {
    const response = await fetch(`${MAILERSEND_API}/email`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAILERSEND_API_KEY}`,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text || "",
        tags: params.tags || ["startupos", "website-generated"],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: "Unknown error" })) as MailerSendResponse;
      const errorMsg = errorBody.errors?.[0]?.message || errorBody.message || `HTTP ${response.status}`;
      console.error("[Email] MailerSend API error:", errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Failed to send email:", message);
    return { success: false, error: message };
  }
}

/* ─── Email Templates ─── */

/**
 * Build the HTML email for website generation completion.
 */
function buildWebsiteCompleteHtml(data: WebsiteCompleteEmailData): string {
  const sectionsWord = data.sectionsCount === 1 ? "section" : "sections";
  const genTime = data.generationTimeMs
    ? `${(data.generationTimeMs / 1000).toFixed(1)} seconds`
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f1f1f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#12121a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 0;text-align:center;">
              <div style="width:48px;height:48px;margin:0 auto 16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:24px;line-height:1;">✦</span>
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#f1f1f5;letter-spacing:-0.02em;">
                Your website is ready! 🚀
              </h1>
              <p style="margin:12px 0 0;font-size:16px;color:rgba(255,255,255,0.6);line-height:1.6;">
                <strong style="color:#f1f1f5;">${escapeHtml(data.startupName)}</strong> has been analyzed and transformed into a custom website specification with <strong style="color:#f1f1f5;">${data.sectionsCount} ${sectionsWord}</strong>.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <div style="height:1px;background:rgba(255,255,255,0.08);"></div>
            </td>
          </tr>

          <!-- Stats -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:16px 24px;background:rgba(99,102,241,0.08);border-radius:12px;border:1px solid rgba(99,102,241,0.15);">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="width:33%;padding:8px;">
                          <div style="font-size:28px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${data.sectionsCount}</div>
                          <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Sections</div>
                        </td>
                        ${genTime ? `
                        <td align="center" style="width:33%;padding:8px;">
                          <div style="font-size:16px;font-weight:700;color:#f1f1f5;">${genTime}</div>
                          <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Generation</div>
                        </td>` : ""}
                        <td align="center" style="width:33%;padding:8px;">
                          <div style="font-size:16px;font-weight:700;color:#f1f1f5;">AI</div>
                          <div style="font-size:11px;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:1px;margin-top:2px;">Powered</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:32px 40px 0;text-align:center;">
              <a href="${escapeHtml(data.workspaceUrl)}"
                 style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;border-radius:12px;font-size:16px;font-weight:600;box-shadow:0 4px 20px rgba(99,102,241,0.25);">
                View in Workspace →
              </a>
            </td>
          </tr>

          <!-- Preview link -->
          ${data.previewUrl ? `
          <tr>
            <td style="padding:16px 40px 0;text-align:center;">
              <a href="${escapeHtml(data.previewUrl)}"
                 style="color:rgba(255,255,255,0.5);text-decoration:underline;font-size:13px;">
                Or open live preview
              </a>
            </td>
          </tr>` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding:40px;text-align:center;">
              <div style="height:1px;background:rgba(255,255,255,0.08);margin-bottom:24px;"></div>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);">
                Generated by StartupOS &bull; AI-powered startup analysis
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:rgba(255,255,255,0.35);">
                This is an automated message from StartupOS.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWebsiteCompleteText(data: WebsiteCompleteEmailData): string {
  return [
    `Your website for ${data.startupName} is ready! 🚀`,
    ``,
    `The AI has analyzed your startup and generated a custom website specification with ${data.sectionsCount} sections.`,
    ``,
    `View it in your workspace:`,
    data.workspaceUrl,
    ...(data.previewUrl ? [`Live preview: ${data.previewUrl}`] : []),
    ``,
    `— StartupOS`,
  ].join("\n");
}

/* ─── Public API ─── */

/**
 * Send a website generation completion email to a user.
 *
 * Flow:
 * 1. Look up user's email from Supabase
 * 2. Build the email HTML template
 * 3. Send via MailerSend
 * 4. Update the job's notified_at timestamp
 *
 * Returns { success: true } on success, or { success: false, error } on failure.
 */
export async function sendWebsiteCompleteEmail(params: {
  userId: string;
  jobId: string;
  startupName: string;
  sectionsCount: number;
  generationTimeMs?: number;
  previewUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { userId, jobId, startupName, sectionsCount, generationTimeMs, previewUrl } = params;

  // Step 1: Look up user email
  const supabase = createServiceClient();
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);

  if (userError || !user?.user?.email) {
    const msg = userError?.message || "User not found or has no email";
    console.error("[Email] Cannot send notification —", msg);
    return { success: false, error: msg };
  }

  const userEmail = user.user.email;
  const userName = user.user.user_metadata?.display_name || user.user.user_metadata?.full_name || startupName;

  // Step 2: Build email data
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const emailData: WebsiteCompleteEmailData = {
    userName,
    startupName,
    sectionsCount,
    workspaceUrl: `${appUrl}/workspace`,
    previewUrl,
    generationTimeMs,
  };

  // Step 3: Send email
  const emailResult = await sendMailerSendEmail({
    to: [{ email: userEmail, name: userName }],
    subject: `✨ Your website for ${startupName} is ready!`,
    html: buildWebsiteCompleteHtml(emailData),
    text: buildWebsiteCompleteText(emailData),
    tags: ["startupos", "website-generated", jobId],
  });

  if (!emailResult.success) {
    console.error("[Email] Failed to send website complete notification:", emailResult.error);
    return emailResult;
  }

  // Step 4: Update notified_at
  await supabase
    .from("website_generation_jobs")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", jobId);

  console.log(`[Email] Website complete notification sent to ${userEmail} for job ${jobId}`);
  return { success: true };
}

/* ─── Utility ─── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
