/**
 * GitHub API Client
 * Handles all GitHub API interactions with rate limiting
 */

import { RepoMetadata, FileTreeItem } from '@/types';

/**
 * GitHub API base URL
 */
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Get GitHub token from environment or session
 */
export function getGitHubToken(): string | undefined {
  return process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
}

/**
 * Make authenticated GitHub API request
 */
async function githubFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getGitHubToken();
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'RepoLens/1.0',
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${GITHUB_API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle rate limiting
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    const rateLimitReset = response.headers.get('X-RateLimit-Reset');
    
    if (rateLimitRemaining === '0' && rateLimitReset) {
      const resetDate = new Date(parseInt(rateLimitReset) * 1000);
      throw new Error(
        `GitHub API rate limit exceeded. Resets at ${resetDate.toISOString()}`
      );
    }
  }
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} - ${error}`);
  }
  
  return response;
}

/**
 * Fetch repository metadata
 */
export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata> {
  const response = await githubFetch(`/repos/${owner}/${repo}`);
  return response.json();
}

/**
 * Fetch repository file tree
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  ref: string = 'HEAD'
): Promise<FileTreeItem[]> {
  // First get the SHA of the ref
  const refResponse = await githubFetch(`/repos/${owner}/${repo}/git/ref/heads/${ref}`);
  const refData = await refResponse.json();
  const treeSha = refData.object.sha;
  
  // Then get the tree recursively
  const treeResponse = await githubFetch(
    `/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`
  );
  const treeData = await treeResponse.json();
  
  return treeData.tree.map((item: any) => ({
    path: item.path,
    type: item.type,
    sha: item.sha,
    url: item.url,
    size: item.size,
  }));
}

/**
 * Fetch file content
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string = 'HEAD'
): Promise<string> {
  const response = await githubFetch(
    `/repos/${owner}/${repo}/contents/${path}?ref=${ref}`
  );
  const data = await response.json();
  
  if (data.encoding === 'base64') {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  
  return data.content;
}

/**
 * Fetch README content
 */
export async function fetchReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const response = await githubFetch(`/repos/${owner}/${repo}/readme`);
    const data = await response.json();
    
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    
    return data.content;
  } catch (error) {
    // README might not exist
    return null;
  }
}

/**
 * Fetch repository languages
 */
export async function fetchRepoLanguages(
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  const response = await githubFetch(`/repos/${owner}/${repo}/languages`);
  return response.json();
}

/**
 * Push file to repository via GitHub Contents API
 */
export async function pushFileToRepo(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string = 'main',
  sha?: string
): Promise<void> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token required to push files');
  }
  
  const body: Record<string, string> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  const response = await githubFetch(
    `/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to push file: ${error}`);
  }
}

/**
 * Check rate limit status
 */
export async function getRateLimit(): Promise<{
  limit: number;
  remaining: number;
  reset: number;
}> {
  const response = await githubFetch('/rate_limit');
  const data = await response.json();
  
  return {
    limit: data.resources.core.limit,
    remaining: data.resources.core.remaining,
    reset: data.resources.core.reset,
  };
}
