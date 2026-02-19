/**
 * POST /api/analyze
 * Main analysis endpoint - scrapes repo and runs AI analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseRepoUrl, scrapeRepository } from '@/services/github-scraper';
import { analyzeRepository } from '@/services/analysis';
import { getMergedSettings } from '@/services/settings';
import { setCache, getCache, getAnalysisCacheKey } from '@/lib/redis';
import { analyzeRequestSchema } from '@/types/schemas';
import { ApiResponse, AnalysisResult, RepoContext } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AnalysisResult & { repo: RepoContext }>>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validated = analyzeRequestSchema.parse(body);
    
    // Parse repository URL
    const { owner, repo } = parseRepoUrl(validated.url);
    
    // Check cache first
    const cacheKey = getAnalysisCacheKey(owner, repo, validated.provider);
    const cached = await getCache<AnalysisResult & { repo: RepoContext }>(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
        cachedAt: new Date().toISOString(),
      });
    }
    
    // Get user settings
    const settings = getMergedSettings();
    
    // Determine provider
    const provider = validated.provider || settings.preferredProvider;
    
    // Scrape repository
    console.log(`Scraping ${owner}/${repo}...`);
    const repoContext = await scrapeRepository(owner, repo);
    
    // Run analysis
    console.log(`Analyzing with ${provider}...`);
    const analysis = await analyzeRepository(
      repoContext,
      provider,
      settings
    );
    
    // Prepare response
    const result = {
      ...analysis,
      repo: repoContext,
    };
    
    // Cache the result
    await setCache(cacheKey, result);
    
    return NextResponse.json({
      success: true,
      data: result,
      cached: false,
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    
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
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
