/**
 * API Route: POST /api/readme/push
 * Push README to GitHub repository
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pushReadme } from "@/services/github-push";

const RequestSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  content: z.string().min(10, "README content too short"),
  message: z.string().optional().default("Update README.md via RepoLens"),
  branch: z.string().optional().default("main"),
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

    const { owner, repo, content, message, branch } = parsed.data;

    // Get GitHub access token from authorization header
    const authHeader = request.headers.get("authorization");
    let accessToken: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      accessToken = authHeader.slice(7);
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "GitHub access token required. Please authenticate first.",
        },
        { status: 401 }
      );
    }

    // Push README
    const url = `https://github.com/${owner}/${repo}`;
    const result = await pushReadme(url, content, message, branch, accessToken);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        message: "README pushed successfully",
      },
    });
  } catch (error) {
    console.error("README push error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
