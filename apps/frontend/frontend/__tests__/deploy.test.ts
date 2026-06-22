import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================
// Hoisted mock factories — these run before the imports,
// so they must reference only hoisted variables.
// ============================================================

const { singleMock, updateMock, insertMock, eqMock, selectMock, orderMock, limitMock } = vi.hoisted(() => {
  const single = vi.fn();
  const update = vi.fn().mockReturnThis();
  const insert = vi.fn().mockReturnThis();
  const eq = vi.fn().mockReturnThis();
  const select = vi.fn().mockReturnThis();
  const order = vi.fn().mockReturnThis();
  const limit = vi.fn().mockReturnThis();
  return { singleMock: single, updateMock: update, insertMock: insert, eqMock: eq, selectMock: select, orderMock: order, limitMock: limit };
});

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: vi.fn(function (this: Record<string, unknown>) {
      return this;
    }),
    insert: insertMock,
    update: updateMock,
    select: selectMock,
    eq: eqMock,
    order: orderMock,
    limit: limitMock,
    single: singleMock,
  }),
}));

// Minimal valid WebsiteSpec for tests
function createMockSpec(overrides: Record<string, unknown> = {}) {
  return {
    version: "1.0" as const,
    visualStyle: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#06b6d4",
      background: "#0a0a0f",
      surface: "#12121a",
      radius: "12px",
      fontHeading: "Inter",
      fontBody: "Inter",
      heroScale: "balanced" as const,
      spacing: "100px",
    },
    layoutType: "single-page" as const,
    sectionOrder: ["hero", "cta"],
    sections: [
      {
        id: "hero",
        type: "hero" as const,
        variant: 0,
        heading: "TestCo",
        subheading: "Built for teams",
        body: "We help teams move faster.",
        items: [
          { title: "Users", description: "Active users", meta: "10K+" },
        ],
      },
    ],
    copy: {
      tagline: "Move faster",
      ctaPrimary: "Get Started",
      ctaSecondary: "Learn More",
      ctaSubtext: "Free trial, no credit card.",
    },
    metadata: {
      provider: "groq",
      model: "llama-3.3-70b",
      generatedAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockClear();
  vi.stubGlobal("fetch", mockFetch);

  singleMock.mockClear();
  updateMock.mockClear();
  insertMock.mockClear();
  eqMock.mockClear();
  selectMock.mockClear();
  orderMock.mockClear();
  limitMock.mockClear();
});

async function freshDeploy() {
  vi.resetModules();
  return await import("@/lib/startup/deploy");
}

describe("deployToVercel — no VERCEL_TOKEN", () => {
  it("should skip deployment and return failure if VERCEL_TOKEN is not set", async () => {
    vi.stubEnv("VERCEL_TOKEN", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");

    singleMock.mockResolvedValue({
      data: { id: "deploy-1", user_id: "user-456", website_id: "website-123" },
      error: null,
    });

    const { deployToVercel } = await freshDeploy();

    const result = await deployToVercel({
      websiteSpec: createMockSpec(),
      startupName: "TestCo",
      websiteId: "website-123",
      userId: "user-456",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.url).toBeNull();
    expect(result.logs.some((l) => l.includes("VERCEL_TOKEN not configured"))).toBe(true);
  });
});

describe("deployToVercel — with VERCEL_TOKEN", () => {
  it("should call the Vercel API and return a deployed URL on success", async () => {
    vi.stubEnv("VERCEL_TOKEN", "test-vercel-token");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");

    singleMock
      .mockResolvedValueOnce({
        data: { id: "deploy-1", user_id: "user-456", website_id: "website-123" },
        error: null,
      });

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "vercel-deploy-1",
          url: "testco-abc123.vercel.app",
          readyState: "INITIALIZING",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "vercel-deploy-1",
          url: "testco-abc123.vercel.app",
          readyState: "READY",
        }),
      });

    const { deployToVercel } = await freshDeploy();

    const result = await deployToVercel({
      websiteSpec: createMockSpec(),
      startupName: "TestCo",
      websiteId: "website-123",
      userId: "user-456",
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("deployed");
    expect(result.url).toBe("https://testco-abc123.vercel.app");

    const createCall = mockFetch.mock.calls[0];
    expect(createCall[0]).toBe("https://api.vercel.com/v13/deployments");
    expect(createCall[1].headers.Authorization).toBe("Bearer test-vercel-token");
  });

  it("should handle Vercel API errors gracefully", async () => {
    vi.stubEnv("VERCEL_TOKEN", "test-vercel-token");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");

    singleMock.mockResolvedValue({
      data: { id: "deploy-2" },
      error: null,
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad request: invalid project name",
    });

    const { deployToVercel } = await freshDeploy();

    const result = await deployToVercel({
      websiteSpec: createMockSpec(),
      startupName: "TestCo",
      websiteId: "website-123",
      userId: "user-456",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
    expect(result.url).toBeNull();
    expect(result.logs.some((l) => l.includes("Vercel API error"))).toBe(true);
  });

  it("should handle fetch network errors gracefully", async () => {
    vi.stubEnv("VERCEL_TOKEN", "test-vercel-token");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");

    singleMock.mockResolvedValue({
      data: { id: "deploy-3" },
      error: null,
    });

    mockFetch.mockRejectedValueOnce(new Error("Network failure"));

    const { deployToVercel } = await freshDeploy();

    const result = await deployToVercel({
      websiteSpec: createMockSpec(),
      startupName: "TestCo",
      websiteId: "website-123",
      userId: "user-456",
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe("failed");
  });
});

describe("retryDeployment", () => {
  it("should return null if website is not found", async () => {
    vi.stubEnv("VERCEL_TOKEN", "test-vercel-token");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");

    singleMock.mockResolvedValue({ data: null, error: null });

    const { retryDeployment } = await freshDeploy();
    const result = await retryDeployment("nonexistent-id", "user-456");
    expect(result).toBeNull();
  });

  it("should return null if website has no valid WebsiteSpec", async () => {
    vi.stubEnv("VERCEL_TOKEN", "test-vercel-token");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");

    singleMock.mockResolvedValue({
      data: {
        id: "website-123",
        user_id: "user-456",
        content: {},
        metadata: {},
      },
      error: null,
    });

    const { retryDeployment } = await freshDeploy();
    const result = await retryDeployment("website-123", "user-456");
    expect(result).toBeNull();
  });
});
