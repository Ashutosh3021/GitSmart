/**
 * GET /api/settings
 * Get user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMergedSettings } from '@/services/settings';
import { ApiResponse, UserSettings } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<UserSettings>>> {
  try {
    // Get settings (merged with defaults)
    const settings = getMergedSettings();
    
    // Don't return actual API keys for security
    const safeSettings: UserSettings = {
      ...settings,
      apiKeys: Object.fromEntries(
        Object.entries(settings.apiKeys).map(([k, v]) => [
          k,
          v ? `${v.slice(0, 10)}...` : undefined,
        ])
      ) as UserSettings['apiKeys'],
    };
    
    return NextResponse.json({
      success: true,
      data: safeSettings,
    });
    
  } catch (error) {
    console.error('Settings fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}
