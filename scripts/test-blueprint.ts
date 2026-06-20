import { PrismaClient } from "@prisma/client";
import { generateBlueprintWithFallback, getAIProvider } from "../src/services/ai/provider.js";
import { getQueue } from "../src/queue/setup.js";
import { logger } from "../src/lib/logger.js";

const prisma = new PrismaClient();

async function testBlueprintFlow() {
  console.log("=== Testing Blueprint Generation Flow ===\n");

  try {
    // 1. Test database connection
    console.log("1. Testing database connection...");
    await prisma.$queryRawUnsafe("SELECT 1");
    console.log("   ✅ Database connected\n");

    // 2. Test Redis/Queue connection
    console.log("2. Testing queue connection...");
    const queue = getQueue();
    await queue.add("test", { test: true });
    console.log("   ✅ Queue add works\n");

    // 3. Test AI provider availability
    console.log("3. Testing AI provider initialization...");
    try {
      const provider = getAIProvider();
      console.log(`   Active provider: ${provider.name}`);
      console.log("   ✅ AI provider available\n");
    } catch (e) {
      console.log("   ❌ No AI providers configured:", e instanceof Error ? e.message : e);
      console.log("   (Set FREELLM_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY)");
      return;
    }

    // 4. Test AI provider call (quick test with short prompt)
    console.log("4. Testing AI provider call (this may take 30-60s)...");
    try {
      const result = await generateBlueprintWithFallback("A test startup for AI-powered todo app");
      console.log("   ✅ AI provider returned result:", result.name);
    } catch (aiError) {
      console.log("   ❌ AI provider failed:", aiError instanceof Error ? aiError.message : aiError);
      console.log("   (This is expected if no valid API keys are set)");
    }

  } catch (error) {
    console.error("❌ Test failed:", error instanceof Error ? error.message : error);
  } finally {
    await prisma.$disconnect();
  }
}

testBlueprintFlow();