/**
 * POST /api/readme/push
 * Push README to GitHub repository
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pushReadmeToGitHub } from '@/services/readme-generator';
import { readmePushSchema } from '@/types/schemas';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ pushed: boolean }>>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = readmePushSchema.parse(body);
    
    // Check for GitHub token
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'GitHub token not configured',
        },
        { status: 401 }
      );
    }
    
    // Push README
    console.log(`Pushing README to ${validated.owner}/${validated.repo}...`);
    await pushReadmeToGitHub(
      validated.owner,
      validated.repo,
      validated.content,
      validated.message,
      validated.branch
    );
    
    return NextResponse.json({
      success: true,
      data: { pushed: true },
    });
    
  } catch (error) {
    console.error('README push error:', error);
    
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
        error: error instanceof Error ? error.message : 'Failed to push README',
      },
      { status: 500 }
    );
  }
}
