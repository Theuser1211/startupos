import { describe, it, expect, vi } from "vitest";
import { VercelProvider } from "../src/services/deploy/vercel.js";

describe("VercelProvider", () => {
  it("has correct name", () => {
    const provider = new VercelProvider();
    expect(provider.name).toBe("vercel");
  });

  it("verify returns unreachable for invalid URL", async () => {
    const provider = new VercelProvider();
    const result = await provider.verify("https://nonexistent-domain-12345.example.com");

    expect(result.reachable).toBe(false);
    expect(result.statusCode).toBe(0);
    expect(result.hasContent).toBe(false);
  });

  it("deploy sends files to Vercel API", async () => {
    const originalFetch = globalThis.fetch;
    let capturedUrl = "";
    let capturedBody = "";

    globalThis.fetch = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url);
      capturedBody = init?.body as string;
      return new Response(JSON.stringify({ id: "dpl_test123", url: "test.vercel.app", readyState: "READY" }), { status: 200 });
    }) as typeof fetch;

    try {
      const provider = new VercelProvider();
      const result = await provider.deploy(
        [{ path: "index.html", content: "<html><body>Test</body></html>" }],
        "test-site",
      );

      expect(capturedUrl).toContain("api.vercel.com/v13/deployments");
      expect(result.url).toBe("https://test.vercel.app");
      expect(result.deploymentId).toBe("dpl_test123");
      expect(result.provider).toBe("vercel");

      const body = JSON.parse(capturedBody);
      expect(body.name).toContain("startupos-test-site");
      expect(body.files).toHaveLength(1);
      expect(body.files[0].file).toBe("index.html");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
