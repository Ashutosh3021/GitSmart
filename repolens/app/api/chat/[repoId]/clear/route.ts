/**
 * DELETE /api/chat/[repoId]
 * Clear chat history for a repository
 */

import { NextRequest, NextResponse } from 'next/server';
import { clearChatHistory } from '@/services/chat';
import { ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{
    repoId: string;
  }>;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<{ deleted: number }>>> {
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
    
    // Decode repoId
    const decodedRepoId = decodeURIComponent(repoId);
    
    // Clear chat history
    console.log(`Clearing chat history for ${decodedRepoId}...`);
    const deleted = clearChatHistory(decodedRepoId);
    
    return NextResponse.json({
      success: true,
      data: { deleted },
    });
    
  } catch (error) {
    console.error('Clear chat error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear chat history',
      },
      { status: 500 }
    );
  }
}
