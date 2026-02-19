/**
 * POST /api/settings/keys
 * Save API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveApiKeys, setPreferredProvider, setPreferredModel } from '@/services/settings';
import { apiKeysSchema } from '@/types/schemas';
import { ApiResponse, LLMProvider } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ validKeys: Record<string, boolean> }>>> {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate API keys
    const validated = apiKeysSchema.parse(body.apiKeys || {});
    
    // Save provider preference if provided
    if (body.preferredProvider) {
      setPreferredProvider(body.preferredProvider as LLMProvider);
    }
    
    // Save model preference if provided
    if (body.preferredModel && body.provider) {
      setPreferredModel(body.provider as LLMProvider, body.preferredModel);
    }
    
    // Save and validate API keys
    const result = await saveApiKeys(validated);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid API keys provided',
          data: { validKeys: result.validKeys },
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { validKeys: result.validKeys },
    });
    
  } catch (error) {
    console.error('Settings save error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save settings',
      },
      { status: 500 }
    );
  }
}
