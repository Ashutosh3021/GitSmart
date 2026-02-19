/**
 * GET /api/chat/[repoId]
 * Get chat history for a repository
 */

import { NextRequest, NextResponse } from 'next/server';
import { getChatHistory, getChatStats } from '@/services/chat';
import { ApiResponse, ChatMessage } from '@/types';

interface RouteParams {
  params: Promise<{
    repoId: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ messages: ChatMessage[]; stats: ReturnType<typeof getChatStats> }>>> {
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
    
    // Get chat history and stats
    const messages = getChatHistory(decodedRepoId);
    const stats = getChatStats(decodedRepoId);
    
    return NextResponse.json({
      success: true,
      data: {
        messages,
        stats,
      },
    });
    
  } catch (error) {
    console.error('Chat history error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chat history',
      },
      { status: 500 }
    );
  }
}
