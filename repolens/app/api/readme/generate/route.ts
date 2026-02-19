/**
 * POST /api/readme/generate
 * Generate README for a repository
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateReadme } from '@/services/readme-generator';
import { scrapeRepository } from '@/services/github-scraper';
import { analyzeRepository } from '@/services/analysis';
import { getMergedSettings } from '@/services/settings';
import { readmeGenerateSchema } from '@/types/schemas';
import { ApiResponse, ReadmeResult } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ReadmeResult>>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = readmeGenerateSchema.parse(body);
    
    // Get user settings
    const settings = getMergedSettings();
    
    // Determine provider
    const provider = validated.provider || settings.preferredProvider;
    
    // Scrape repository
    console.log(`Generating README for ${validated.owner}/${validated.repo}...`);
    const repoContext = await scrapeRepository(validated.owner, validated.repo);
    
    // Get analysis explanation
    const analysis = await analyzeRepository(repoContext, provider, settings);
    
    // Generate README
    const readme = await generateReadme(
      repoContext,
      analysis.explanation,
      provider,
      settings,
      validated.options
    );
    
    return NextResponse.json({
      success: true,
      data: readme,
    });
    
  } catch (error) {
    console.error('README generation error:', error);
    
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
        error: error instanceof Error ? error.message : 'Failed to generate README',
      },
      { status: 500 }
    );
  }
}
