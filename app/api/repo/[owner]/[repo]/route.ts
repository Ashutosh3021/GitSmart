/**
 * API Route: GET /api/repo/[owner]/[repo]
 * Get cached repository data and analysis
 */

import { NextRequest, NextResponse } from "next/server";
import { cache } from "@/lib/redis";

interface RouteParams {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { owner, repo } = await params;
    const cacheKey = cache.generateRepoKey(owner, repo);

    const cached = await cache.get(cacheKey);

    if (!cached) {
      return NextResponse.json(
        {
          success: false,
          error: "Repository not analyzed yet. Use POST /api/analyze first.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: cached,
    });
  } catch (error) {
    console.error("Error fetching repo data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * API Route: DELETE /api/repo/[owner]/[repo]
 * Clear cached repository data
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { owner, repo } = await params;
    const cacheKey = cache.generateRepoKey(owner, repo);

    await cache.delete(cacheKey);

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
