/**
 * API Route: DELETE /api/chat/[repoId]
 * Clear chat history for a repository
 */

import { NextRequest, NextResponse } from "next/server";
import { clearChatHistory } from "@/services/chat";

interface RouteParams {
  params: Promise<{
    repoId: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { repoId } = await params;
    const decodedRepoId = decodeURIComponent(repoId);

    clearChatHistory(decodedRepoId);

    return NextResponse.json({
      success: true,
      message: "Chat history cleared successfully",
      repoId: decodedRepoId,
    });
  } catch (error) {
    console.error("Error clearing chat history:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
