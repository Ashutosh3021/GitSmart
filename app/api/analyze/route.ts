/**
 * API Route: POST /api/analyze
 * Main analysis endpoint - scrapes repo and runs AI analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { scrapeRepository } from "@/services/github";
import { analyzeRepository } from "@/services/analysis";
import { cache } from "@/lib/redis";
import type { AIProvider } from "@/lib/types";

const RequestSchema = z.object({
  url: z.string().url(),
  provider: z.enum(["gemini", "openai", "anthropic", "groq"]).optional().default("gemini"),
  model: z.string().optional(),
  forceRefresh: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { url, provider, model, forceRefresh } = parsed.data;

    // Parse owner and repo from URL
    const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = url.match(urlPattern);

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid GitHub URL format",
        },
        { status: 400 }
      );
    }

    const [, owner, repo] = match;
    const cacheKey = cache.generateRepoKey(owner, repo);

    // Check cache unless force refresh
    if (!forceRefresh) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        console.log(`📦 Cache hit for ${owner}/${repo}`);
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
        });
      }
    }

    // Get GitHub access token from session (if available)
    const accessToken = request.headers.get("x-github-token") || undefined;

    // Scrape repository
    console.log(`🔍 Scraping ${owner}/${repo}...`);
    const repoContext = await scrapeRepository(url, accessToken);

    // Run analysis
    console.log(`🧠 Analyzing with ${provider}...`);
    const analysis = await analyzeRepository(repoContext, provider as AIProvider, model);

    // Prepare response
    const result = {
      context: repoContext,
      analysis,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    await cache.set(cacheKey, result, 60 * 60 * 24); // 24 hours

    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
