/**
 * POST /api/chat/[repoId]
 * Send a message and get AI response
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendChatMessage } from '@/services/chat';
import { scrapeRepository } from '@/services/github-scraper';
import { analyzeRepository } from '@/services/analysis';
import { getMergedSettings } from '@/services/settings';
import { chatMessageSchema } from '@/types/schemas';
import { ApiResponse, ChatMessage } from '@/types';

interface RouteParams {
  params: Promise<{
    repoId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<ChatMessage>>> {
  try {
    const { repoId } = await params;
    
    if (!repoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Repository ID is required',
        },
        { status: 400 }
      );
    }
    
    // Decode repoId (format: "owner--repo")
    const decodedRepoId = decodeURIComponent(repoId);
    
    // Parse request body
    const body = await request.json();
    const validated = chatMessageSchema.parse(body);
    
    // Get user settings
    const settings = getMergedSettings();
    
    // Determine provider
    const provider = validated.provider || settings.preferredProvider;
    
    // Parse owner/repo from repoId
    const [owner, repo] = decodedRepoId.split('/');
    
    if (!owner || !repo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid repository ID format. Expected: owner/repo',
        },
        { status: 400 }
      );
    }
    
    // Get repo context and analysis for system prompt
    console.log(`Loading context for ${owner}/${repo}...`);
    const repoContext = await scrapeRepository(owner, repo);
    const analysis = await analyzeRepository(repoContext, provider, settings);
    
    // Send message and get response
    console.log(`Sending chat message for ${decodedRepoId}...`);
    const response = await sendChatMessage(
      decodedRepoId,
      validated.message,
      repoContext,
      analysis.explanation,
      provider,
      settings
    );
    
    return NextResponse.json({
      success: true,
      data: response,
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
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
        error: error instanceof Error ? error.message : 'Failed to send message',
      },
      { status: 500 }
    );
  }
}
