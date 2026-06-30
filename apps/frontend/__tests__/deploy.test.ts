import { describe, it, expect, vi, beforeEach } from "vitest";
import type { WebsiteSpec } from "@startupos/shared";

function createMockSpec(overrides: Record<string, unknown> = {}): WebsiteSpec {
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
const mockPost = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    post: mockPost,
  },
}));

beforeEach(() => {
  mockFetch.mockClear();
  mockPost.mockClear();
  vi.stubGlobal("fetch", mockFetch);
});

describe("createDeployment", () => {
  it("should call the deployments API and return a response", async () => {
    const expectedResponse = {
      success: true,
      status: "deployed" as const,
      url: "https://testco.vercel.app",
      id: "deploy-1",
    };
    mockPost.mockResolvedValue(expectedResponse);

    const { createDeployment } = await import("@/lib/api/deployments");
    const result = await createDeployment({
      website: { spec: createMockSpec(), id: "website-123" },
      startupName: "TestCo",
    });

    expect(result).toEqual(expectedResponse);
    expect(mockPost).toHaveBeenCalledWith("/deployments/create", {
      website: { spec: expect.any(Object), id: "website-123" },
      startupName: "TestCo",
    });
  });

  it("should handle API errors gracefully", async () => {
    mockPost.mockRejectedValue(new Error("API Error"));

    const { createDeployment } = await import("@/lib/api/deployments");
    await expect(
      createDeployment({
        website: { spec: createMockSpec(), id: "website-123" },
        startupName: "TestCo",
      })
    ).rejects.toThrow("API Error");
  });
});
