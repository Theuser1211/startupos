import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ProviderRegistry, ProviderRegistration } from "../src/services/ai/provider-registry.js";
import { AIProvider } from "../src/types/ai.js";

vi.mock("../src/lib/logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createMockProvider(name: string): AIProvider {
  return {
    name,
    generateBlueprint: vi.fn(),
    generateWebsiteSpec: vi.fn(),
    generateWebsitePage: vi.fn(),
  };
}

describe("ProviderRegistry", () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    vi.useFakeTimers();
    registry = new ProviderRegistry();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function registerMock(
    id: string,
    provider: string,
    priority: number,
  ): void {
    registry.register({
      id,
      provider,
      model: "test-model",
      priority,
      apiKey: "test-key",
      createProvider: () => createMockProvider(provider),
    });
  }

  describe("priority ordering", () => {
    it("returns provider from highest priority tier", () => {
      registerMock("nim-1", "nim", 3);
      registerMock("groq-1", "groq", 2);
      registerMock("google-1", "google", 1);

      const first = registry.getNextAvailableProvider();
      expect(first).not.toBeNull();
      expect(first!.provider).toBe("google");

      const second = registry.getNextAvailableProvider();
      expect(second).not.toBeNull();
      expect(second!.provider).toBe("google");
    });

    it("falls through to lower tier when higher is in cooldown", () => {
      registerMock("google-1", "google", 1);
      registerMock("groq-1", "groq", 2);
      registerMock("nim-1", "nim", 3);

      registry.recordFailure("google-1", 429, 100);

      const provider = registry.getNextAvailableProvider();
      expect(provider).not.toBeNull();
      expect(provider!.provider).toBe("groq");
    });

    it("returns null when no providers registered", () => {
      expect(registry.getNextAvailableProvider()).toBeNull();
    });
  });

  describe("round robin selection", () => {
    it("alternates between providers in the same priority", () => {
      registerMock("google-1", "google", 1);
      registerMock("google-2", "google", 1);
      registerMock("google-3", "google", 1);

      const ids = Array.from({ length: 6 }, () => registry.getNextAvailableProvider()!.id);
      expect(ids).toEqual([
        "google-1",
        "google-2",
        "google-3",
        "google-1",
        "google-2",
        "google-3",
      ]);
    });

    it("falls through to lower tier when all higher tier providers are in cooldown", () => {
      registerMock("google-1", "google", 1);
      registerMock("google-2", "google", 1);
      registerMock("groq-1", "groq", 2);

      registry.recordFailure("google-1", 429, 100);
      registry.recordFailure("google-2", 429, 100);

      const provider = registry.getNextAvailableProvider();
      expect(provider).not.toBeNull();
      expect(provider!.provider).toBe("groq");
    });
  });

  describe("failover", () => {
    it("skips failed providers and moves to next", () => {
      registerMock("google-1", "google", 1);
      registerMock("google-2", "google", 1);
      registerMock("groq-1", "groq", 2);

      registry.recordFailure("google-1", 500, 100);
      registry.recordFailure("google-1", 500, 100);

      registry.recordFailure("google-2", 500, 100);
      registry.recordFailure("google-2", 500, 100);

      const next = registry.getNextAvailableProvider();
      expect(next).not.toBeNull();
      expect(next!.provider).toBe("groq");
    });

    it("continues through all tiers when all providers fail", () => {
      registerMock("google-1", "google", 1);
      registerMock("groq-1", "groq", 2);
      registerMock("nim-1", "nim", 3);
      registerMock("openrouter-1", "openrouter", 4);

      registry.recordFailure("google-1", 500, 100);
      registry.recordFailure("google-1", 500, 100);

      registry.recordFailure("groq-1", 500, 100);
      registry.recordFailure("groq-1", 500, 100);

      registry.recordFailure("nim-1", 500, 100);
      registry.recordFailure("nim-1", 500, 100);

      registry.recordFailure("openrouter-1", 500, 100);
      registry.recordFailure("openrouter-1", 500, 100);

      expect(registry.getNextAvailableProvider()).toBeNull();
    });

    it("skips only the failed provider, not the whole tier", () => {
      registerMock("google-1", "google", 1);
      registerMock("google-2", "google", 1);
      registerMock("groq-1", "groq", 2);

      registry.recordFailure("google-1", 500, 100);
      registry.recordFailure("google-1", 500, 100);

      const next = registry.getNextAvailableProvider();
      expect(next).not.toBeNull();
      expect(next!.id).toBe("google-2");
    });
  });

  describe("cooldown behavior", () => {
    it("triggers cooldown on 429", () => {
      registerMock("google-1", "google", 1);
      registry.recordFailure("google-1", 429, 100);

      expect(registry.getNextAvailableProvider()).toBeNull();
    });

    it("triggers cooldown on 2 consecutive 5xx", () => {
      registerMock("google-1", "google", 1);
      registry.recordFailure("google-1", 502, 100);
      registry.recordFailure("google-1", 502, 100);

      expect(registry.getNextAvailableProvider()).toBeNull();
    });

    it("triggers cooldown on 2 consecutive timeouts (status 0)", () => {
      registerMock("google-1", "google", 1);
      registry.recordFailure("google-1", 0, 100);
      registry.recordFailure("google-1", 0, 100);

      expect(registry.getNextAvailableProvider()).toBeNull();
    });

    it("does not trigger cooldown on single 5xx", () => {
      registerMock("google-1", "google", 1);
      registry.recordFailure("google-1", 502, 100);

      expect(registry.getNextAvailableProvider()).not.toBeNull();
    });

    it("reports cooldownRemaining in health check", () => {
      registerMock("google-1", "google", 1);
      registry.recordFailure("google-1", 429, 100);

      const health = registry.getHealth();
      expect(health[0].status).toBe("cooldown");
      expect(health[0].cooldownRemaining).toBeGreaterThan(0);
    });

    it("recovers after cooldown expires (15 min)", () => {
      registerMock("google-1", "google", 1);
      registry.recordFailure("google-1", 429, 100);

      expect(registry.getNextAvailableProvider()).toBeNull();

      vi.advanceTimersByTime(15 * 60 * 1000 + 1);

      expect(registry.getNextAvailableProvider()).not.toBeNull();
    });

    it("reset consecutive failures after successful request", () => {
      registerMock("google-1", "google", 1);

      registry.recordFailure("google-1", 500, 100);
      registry.recordSuccess("google-1", 200);

      registry.recordFailure("google-1", 500, 100);
      expect(registry.getNextAvailableProvider()).not.toBeNull();
    });
  });

  describe("recovery after cooldown", () => {
    it("provider becomes healthy again after cooldown", () => {
      registerMock("google-1", "google", 1);
      registry.recordFailure("google-1", 429, 100);

      const beforeHealth = registry.getHealth();
      expect(beforeHealth[0].status).toBe("cooldown");

      vi.advanceTimersByTime(15 * 60 * 1000 + 1);

      const afterHealth = registry.getHealth();
      expect(afterHealth[0].status).toBe("healthy");
      expect(afterHealth[0].cooldownRemaining).toBe(0);

      const provider = registry.getNextAvailableProvider();
      expect(provider).not.toBeNull();
      expect(provider!.id).toBe("google-1");
    });
  });

  describe("all providers unavailable", () => {
    it("returns null when all providers are in cooldown", () => {
      registerMock("google-1", "google", 1);
      registerMock("groq-1", "groq", 2);
      registerMock("nim-1", "nim", 3);

      registry.recordFailure("google-1", 429, 100);
      registry.recordFailure("groq-1", 429, 100);
      registry.recordFailure("nim-1", 429, 100);

      expect(registry.getNextAvailableProvider()).toBeNull();
    });

    it("getEntryCount returns correct number", () => {
      expect(registry.getEntryCount()).toBe(0);
      registerMock("google-1", "google", 1);
      expect(registry.getEntryCount()).toBe(1);
      registerMock("groq-1", "groq", 2);
      expect(registry.getEntryCount()).toBe(2);
    });
  });

  describe("health monitoring", () => {
    it("returns health data sorted by priority then id", () => {
      registerMock("nim-1", "nim", 3);
      registerMock("google-1", "google", 1);
      registerMock("groq-1", "groq", 2);

      const health = registry.getHealth();
      expect(health[0].provider).toBe("google");
      expect(health[1].provider).toBe("groq");
      expect(health[2].provider).toBe("nim");
    });

    it("tracks request and failure counts", () => {
      registerMock("google-1", "google", 1);

      registry.recordSuccess("google-1", 100);
      registry.recordSuccess("google-1", 200);
      registry.recordFailure("google-1", 500, 150);

      const health = registry.getHealth();
      expect(health[0].requestCount).toBe(3);
      expect(health[0].failureCount).toBe(1);
    });

    it("calculates avgLatencyMs correctly", () => {
      registerMock("google-1", "google", 1);

      registry.recordSuccess("google-1", 100);
      registry.recordSuccess("google-1", 300);

      const health = registry.getHealth();
      expect(health[0].avgLatencyMs).toBe(200);
    });

    it("returns 0 avg latency when no requests", () => {
      registerMock("google-1", "google", 1);

      const health = registry.getHealth();
      expect(health[0].avgLatencyMs).toBe(0);
    });
  });
});
