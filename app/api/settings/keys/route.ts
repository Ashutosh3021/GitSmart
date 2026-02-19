/**
 * API Route: POST /api/settings/keys
 * Save API keys for AI providers
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { llmService } from "@/services/llm";
import { settingsDb } from "@/lib/db";
import type { AIProvider } from "@/lib/types";

const RequestSchema = z.object({
  provider: z.enum(["gemini", "openai", "anthropic", "groq"]),
  apiKey: z.string().min(10, "API key too short"),
  model: z.string().optional(),
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

    const { provider, apiKey, model } = parsed.data;

    // Validate API key by making a test call
    const isValid = await llmService.validateApiKey(provider as AIProvider, apiKey);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid API key. Please check and try again.",
        },
        { status: 400 }
      );
    }

    // Register the provider
    llmService.registerProvider(provider as AIProvider, { apiKey, model });

    // Save to database (in production, encrypt this)
    // For now, we'll store it in the service only
    // In production, use a userId from session
    const userId = "anonymous"; // TODO: Get from session
    
    await settingsDb.upsert(userId, {
      provider: provider as AIProvider,
      model,
      [`apiKey${provider.charAt(0).toUpperCase() + provider.slice(1)}`]: apiKey,
    } as Record<string, string>);

    return NextResponse.json({
      success: true,
      message: `${provider} API key saved successfully`,
      data: {
        provider,
        model: model || "default",
        validated: true,
      },
    });
  } catch (error) {
    console.error("Settings save error:", error);
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
 * API Route: GET /api/settings/keys
 * Get saved API keys (without revealing full keys)
 */
export async function GET(request: NextRequest) {
  try {
    // In production, get userId from session
    const userId = "anonymous"; // TODO: Get from session

    const settings = await settingsDb.get(userId);

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          provider: "gemini",
          apiKeys: {},
        },
      });
    }

    // Mask API keys for security
    const maskKey = (key: string | null) => {
      if (!key) return null;
      if (key.length <= 8) return "***";
      return key.slice(0, 4) + "..." + key.slice(-4);
    };

    return NextResponse.json({
      success: true,
      data: {
        provider: (settings as Record<string, unknown>).provider,
        model: (settings as Record<string, unknown>).model,
        apiKeys: {
          gemini: maskKey((settings as Record<string, string>).api_key_gemini),
          openai: maskKey((settings as Record<string, string>).api_key_openai),
          anthropic: maskKey((settings as Record<string, string>).api_key_anthropic),
          groq: maskKey((settings as Record<string, string>).api_key_groq),
        },
      },
    });
  } catch (error) {
    console.error("Settings fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
