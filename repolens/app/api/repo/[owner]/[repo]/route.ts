/**
 * GET /api/repo/[owner]/[repo]
 * Get cached repository data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache, getRepoCacheKey } from '@/lib/redis';
import { scrapeRepository, parseRepoUrl } from '@/services/github-scraper';
import { RepoContext, ApiResponse } from '@/types';

interface RouteParams {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<RepoContext>>> {
  try {
    const { owner, repo } = await params;
    
    // Validate parameters
    if (!owner || !repo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Owner and repo are required',
        },
        { status: 400 }
      );
    }
    
    // Check cache first
    const cacheKey = getRepoCacheKey(owner, repo);
    const cached = await getCache<RepoContext>(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }
    
    // Scrape repository
    console.log(`Fetching repo data: ${owner}/${repo}`);
    const repoContext = await scrapeRepository(owner, repo);
    
    // Cache the result
    await setCache(cacheKey, repoContext);
    
    return NextResponse.json({
      success: true,
      data: repoContext,
      cached: false,
    });
    
  } catch (error) {
    console.error('Repo fetch error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch repository',
      },
      { status: 500 }
    );
  }
}
