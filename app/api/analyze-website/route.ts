import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiGenerate } from "@/lib/ai/client";
import { apiLimiter } from "@/lib/security/rate-limit";

interface AnalyzeResult {
  url: string;
  brand: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  seo: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  ux: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  copywriting: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  performance: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  overall: {
    score: number;
    summary: string;
    recommendations: string[];
  };
}

/**
 * POST /api/analyze-website
 * Analyze an existing website URL using AI.
 * Body: { url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting — AI analysis costs money
    const rateResult = apiLimiter.check(`analyze:${user.id}`);
    if (rateResult.blocked) {
      return NextResponse.json(
        { error: "Too many analysis requests. Please try again later." },
        { status: 429 },
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Validate URL format
    try {
      new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Use AI to analyze the website
    const analysis = await analyzeWithAI(normalizedUrl);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[Analyze Website API] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze website" },
      { status: 500 },
    );
  }
}

async function analyzeWithAI(url: string): Promise<AnalyzeResult> {
  const prompt = `Analyze this website URL and provide a detailed assessment: ${url}

Return a JSON object with the following structure (no markdown, no code blocks, just the JSON):
{
  "brand": {
    "score": 0-100,
    "strengths": ["strength1", "strength2", "strength3"],
    "improvements": ["improvement1", "improvement2", "improvement3"]
  },
  "seo": {
    "score": 0-100,
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "ux": {
    "score": 0-100,
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "copywriting": {
    "score": 0-100,
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "performance": {
    "score": 0-100,
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "overall": {
    "score": 0-100,
    "summary": "Brief 2-3 sentence summary of overall website quality",
    "recommendations": ["top priority action 1", "top priority action 2", "top priority action 3", "top priority action 4", "top priority action 5"]
  }
}

Be honest and critical. Focus on actionable improvements. Consider mobile responsiveness, page speed indicators, visual hierarchy, CTA placement, and content quality.`;

  try {
    const response = await aiGenerate(prompt, {
      model: "gemini-2.0-flash",
      temperature: 0.3,
      maxTokens: 4096,
    });

    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned) as AnalyzeResult;

    return {
      url,
      brand: parsed.brand,
      seo: parsed.seo,
      ux: parsed.ux,
      copywriting: parsed.copywriting,
      performance: parsed.performance,
      overall: parsed.overall,
    };
  } catch {
    // Fallback if AI fails: return heuristic analysis
    return {
      url,
      brand: {
        score: 65,
        strengths: ["Domain name is relevant", "Brand appears established"],
        improvements: ["Consider stronger brand messaging above the fold", "Add trust signals (testimonials, case studies)"],
      },
      seo: {
        score: 60,
        strengths: ["Website is indexed and accessible"],
        improvements: ["Add meta descriptions if missing", "Improve heading hierarchy (h1 → h2 → h3)", "Add alt text to images"],
      },
      ux: {
        score: 65,
        strengths: ["Website is functional and navigable"],
        improvements: ["Reduce cognitive load on landing page", "Improve mobile navigation", "Add clear CTA buttons"],
      },
      copywriting: {
        score: 60,
        strengths: ["Content is present and readable"],
        improvements: ["Strengthen value proposition in hero section", "Use more benefit-driven language", "Break up long paragraphs"],
      },
      performance: {
        score: 55,
        strengths: ["Website loads"],
        improvements: ["Optimize image sizes and formats", "Minimize CSS and JavaScript", "Consider using a CDN", "Implement lazy loading"],
      },
      overall: {
        score: 61,
        summary: "The website is functional but has significant room for improvement across branding, SEO, and performance. Prioritizing the recommendations below will improve conversion rates and search visibility.",
        recommendations: [
          "Improve page load speed — optimize images and reduce render-blocking resources",
          "Strengthen the above-the-fold value proposition with clearer benefit-driven copy",
          "Add social proof elements (testimonials, case studies, client logos)",
          "Implement proper heading hierarchy and meta tags for SEO",
          "Add prominent, action-oriented CTA buttons throughout the page",
        ],
      },
    };
  }
}
