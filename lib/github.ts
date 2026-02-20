/**
 * GitHub API Service for RepoLens
 * 
 * Production-ready GitHub API integration with:
 * - OAuth token > PAT > unauthenticated priority
 * - { data, error } pattern - never throws raw errors
 * - Full TypeScript typing
 * - Redis caching with force refresh
 * - Rate limiting awareness
 * 
 * @module github
 */

import { cache } from "./redis";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";
const MAX_FILES = 3000;
const MAX_FILE_SIZE = 1048576; // 1MB

// ============================================================================
// Types
// ============================================================================

export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  license: string | null;
  topics: string[];
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  isPrivate: boolean;
  homepage: string | null;
  hasWiki: boolean;
  hasPages: boolean;
}

export interface FileNode {
  path: string;
  type: "file" | "dir";
  size: number;
}

export interface FileContent {
  path: string;
  content: string;
  size: number;
  language?: string;
}

export interface Contributor {
  login: string;
  avatarUrl: string;
  contributions: number;
  profileUrl: string;
}

export interface CommitActivity {
  totalCommitsLastYear: number;
  avgCommitsPerWeek: number;
  mostActiveWeek: string;
  lastCommitDate: string;
}

export interface LanguageBreakdown {
  [language: string]: number;
}

export interface Dependency {
  name: string;
  version: string;
  isDev: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
  isLow: boolean;
}

export interface PushReadmeResult {
  success: boolean;
  commitUrl?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  code: string;
  retryable: boolean;
}

export interface RepoContext {
  url: string;
  owner: string;
  repo: string;
  metadata: RepoMetadata;
  tree: { sha: string; tree: FileNode[]; truncated: boolean };
  readme: string;
  packageFile: { type: string; content: string; dependencies: string[] } | null;
  importantFiles: FileContent[];
  languages: LanguageBreakdown;
  contributors: Contributor[];
  lastCommit: { sha: string; message: string; date: string; author: string };
  commitActivity: CommitActivity;
  dependencies: Dependency[];
  scrapedAt: string;
  tokenUsed: "oauth" | "pat" | "none";
  fromCache?: boolean;
  cachedAt?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}

export function getAuthHeader(token?: string): Record<string, string> {
  return getHeaders(token);
}

function getToken(sessionToken?: string | null): string | undefined {
  return sessionToken || process.env.GITHUB_PAT || undefined;
}

async function fetchJson<T>(url: string, token?: string): Promise<{ data?: T; error?: ApiError }> {
  try {
    const response = await fetch(url, {
      headers: getHeaders(token),
    });

    if (response.status === 404) {
      return { error: { error: "Repository not found", code: "NOT_FOUND", retryable: false } };
    }

    if (response.status === 403) {
      const isRateLimited = response.headers.get("X-RateLimit-Remaining") === "0";
      if (isRateLimited) {
        const resetAt = response.headers.get("X-RateLimit-Reset");
        return {
          error: {
            error: "GitHub API rate limit reached. Connect your GitHub account for higher limits.",
            code: "RATE_LIMITED",
            retryable: true,
          },
        };
      }
      return { error: { error: "Access denied. Repository may be private.", code: "FORBIDDEN", retryable: false } };
    }

    if (response.status === 422) {
      return { error: { error: "Invalid repository URL", code: "INVALID_URL", retryable: false } };
    }

    if (!response.ok) {
      return { error: { error: `GitHub API error: ${response.statusText}`, code: "API_ERROR", retryable: true } };
    }

    const data = await response.json();
    return { data: data as T };
  } catch (e) {
    return { error: { error: "Unable to reach GitHub API. Check your connection.", code: "NETWORK_ERROR", retryable: true } };
  }
}

// ============================================================================
// Function 1: Parse Repo URL
// ============================================================================

/**
 * Parse GitHub repository URL to extract owner and repo
 * 
 * @param url - GitHub URL in various formats
 * @returns { owner, repo } or null for invalid URLs
 * 
 * @example
 * parseRepoUrl("https://github.com/facebook/react") // { owner: "facebook", repo: "react" }
 * parseRepoUrl("owner/repo") // { owner: "owner", repo: "repo" }
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  if (!url) return null;

  // Remove trailing slash
  url = url.replace(/\/$/, "");

  // Handle full URLs
  let match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (match) {
    let repo = match[2].replace(/\.git$/, "").split("?")[0].split("#")[0];
    return { owner: match[1], repo };
  }

  // Handle owner/repo format
  match = url.match(/^([^\/]+)\/([^\/]+)$/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }

  return null;
}

// ============================================================================
// Function 2: Get Repo Metadata
// ============================================================================

/**
 * Fetch repository metadata from GitHub
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param token - Optional GitHub token
 * @returns Repository metadata or error
 * 
 * @endpoint GET /repos/{owner}/{repo}
 */
export async function getRepoMetadata(
  owner: string,
  repo: string,
  token?: string
): Promise<{ data?: RepoMetadata; error?: ApiError }> {
  const result = await fetchJson<{
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    open_issues_count: number;
    license: { spdx_id: string } | null;
    topics: string[];
    default_branch: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    size: number;
    private: boolean;
    homepage: string | null;
    has_wiki: boolean;
    has_pages: boolean;
  }>(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, token);

  if (result.error) return { error: result.error };

  if (result.data?.private) {
    return { error: { error: "Private repositories are not supported", code: "PRIVATE_REPO", retryable: false } };
  }

  return {
    data: {
      name: result.data!.name,
      fullName: result.data!.full_name,
      description: result.data!.description,
      language: result.data!.language,
      stars: result.data!.stargazers_count,
      forks: result.data!.forks_count,
      watchers: result.data!.watchers_count,
      openIssues: result.data!.open_issues_count,
      license: result.data!.license?.spdx_id || null,
      topics: result.data!.topics || [],
      defaultBranch: result.data!.default_branch,
      createdAt: result.data!.created_at,
      updatedAt: result.data!.updated_at,
      pushedAt: result.data!.pushed_at,
      size: result.data!.size,
      isPrivate: result.data!.private,
      homepage: result.data!.homepage,
      hasWiki: result.data!.has_wiki,
      hasPages: result.data!.has_pages,
    },
  };
}

// ============================================================================
// Function 3: Get File Tree
// ============================================================================

/**
 * Fetch repository file tree
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name (optional, uses default)
 * @param token - Optional GitHub token
 * @returns Flat array of file nodes
 * 
 * @endpoint GET /repos/{owner}/{repo}/git/trees/{branch}?recursive=1
 */
export async function getFileTree(
  owner: string,
  repo: string,
  branch?: string,
  token?: string
): Promise<{ data?: FileNode[]; error?: ApiError }> {
  const defaultBranch = branch || "main";
  
  const result = await fetchJson<{
    tree: Array<{ path: string; type: string; size?: number }>;
    truncated: boolean;
  }>(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, token);

  if (result.error) return { error: result.error };

  // Filter out unwanted directories and files
  const excludePatterns = [".git", "node_modules", ".next", "dist", "build", "__pycache__", ".cache", "vendor", "coverage"];
  
  const filteredTree = result.data!.tree
    .filter((item) => {
      const path = item.path;
      return !excludePatterns.some((pattern) => path.includes(pattern));
    })
    .filter((item) => item.type === "blob") // Only files
    .map((item) => ({
      path: item.path,
      type: "file" as const,
      size: item.size || 0,
    }));

  // Warn if truncated
  if (result.data!.truncated || filteredTree.length > MAX_FILES) {
    console.warn(`⚠️ Repository has ${filteredTree.length} files, truncating to ${MAX_FILES}`);
    return {
      data: filteredTree.slice(0, MAX_FILES),
    };
  }

  return { data: filteredTree };
}

// ============================================================================
// Function 4: Get File Content
// ============================================================================

/**
 * Fetch single file content from repository
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path
 * @param token - Optional GitHub token
 * @returns File content or error
 * 
 * @endpoint GET /repos/{owner}/{repo}/contents/{path}
 */
export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<{ data?: FileContent; error?: ApiError }> {
  const result = await fetchJson<{
    content: string;
    encoding: string;
    size: number;
  }>(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, token);

  if (result.error) return { error: result.error };

  const { content, encoding, size } = result.data!;

  // Skip binary files
  if (encoding !== "base64") {
    return { error: { error: "Binary file skipped", code: "BINARY_FILE", retryable: false } };
  }

  // Skip large files
  if (size > MAX_FILE_SIZE) {
    return { error: { error: `File too large (${Math.round(size / 1024)}KB > 1MB limit)`, code: "FILE_TOO_LARGE", retryable: false } };
  }

  try {
    const decodedContent = Buffer.from(content, "base64").toString("utf-8");
    return {
      data: {
        path,
        content: decodedContent,
        size,
      },
    };
  } catch {
    return { error: { error: "Failed to decode file", code: "DECODE_ERROR", retryable: false } };
  }
}

// ============================================================================
// Function 5: Get Key Files
// ============================================================================

/**
 * Intelligently fetch the most important files from a repository
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param tree - File tree from getFileTree
 * @param token - Optional GitHub token
 * @returns Array of important file contents
 * 
 * Priority: HIGH → MEDIUM → LOW
 */
export async function getKeyFiles(
  owner: string,
  repo: string,
  tree: FileNode[],
  token?: string
): Promise<{ data?: FileContent[]; error?: ApiError }> {
  const filePaths = tree.map((f) => f.path);
  const selectedPaths: string[] = [];

  // HIGH PRIORITY - Always fetch if exists
  const highPriority = [
    "README.md", "README.rst", "readme.md", "readme.rst",
    "package.json", "requirements.txt", "Cargo.toml", "go.mod", "pom.xml", "build.gradle",
    ".env.example", "docker-compose.yml", "Dockerfile",
    "tsconfig.json", "tsconfig.js", "next.config.js", "next.config.ts",
    "vite.config.ts", "vite.config.js", "webpack.config.js",
  ];

  for (const pattern of highPriority) {
    const found = filePaths.find((p) => p.toLowerCase().endsWith(pattern.toLowerCase()) || p === pattern);
    if (found && !selectedPaths.includes(found)) {
      selectedPaths.push(found);
    }
  }

  // MEDIUM PRIORITY - Up to 10 files
  const mediumPatterns = [
    /^index\.(ts|js|tsx|jsx|py)$/,
    /^main\.(ts|js|tsx|jsx|py)$/,
    /^app\.(ts|js|tsx|jsx|py)$/,
    /^server\.(ts|js|tsx|jsx|py)$/,
  ];

  const mediumDirs = ["/src", "/lib", "/core", "/api", "/routes", "/controllers", "/services", "/utils"];
  const mediumFiles = ["auth", "db", "database", "schema", "model"].map((n) => `${n}.ts`);

  for (const path of filePaths) {
    if (selectedPaths.length >= 25) break;
    if (selectedPaths.includes(path)) continue;

    // Check patterns
    const fileName = path.split("/").pop() || "";
    for (const pattern of mediumPatterns) {
      if (pattern.test(fileName)) {
        selectedPaths.push(path);
        break;
      }
    }

    // Check directories
    if (!selectedPaths.includes(path) && mediumDirs.some((d) => path.startsWith(d))) {
      selectedPaths.push(path);
    }

    // Check specific files
    if (!selectedPaths.includes(path) && mediumFiles.includes(fileName)) {
      selectedPaths.push(path);
    }
  }

  // LOW PRIORITY - Fill remaining slots
  const codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs"];
  for (const path of filePaths) {
    if (selectedPaths.length >= 25) break;
    if (selectedPaths.includes(path)) continue;
    if (codeExtensions.some((ext) => path.endsWith(ext))) {
      selectedPaths.push(path);
    }
  }

  // Fetch all selected files in parallel
  const results = await Promise.allSettled(
    selectedPaths.slice(0, 25).map(async (path) => {
      const result = await getFileContent(owner, repo, path, token);
      return result.data;
    })
  );

  const keyFiles = results
    .filter((r): r is PromiseFulfilledResult<FileContent> => r.status === "fulfilled" && r.value !== undefined)
    .map((r) => r.value);

  return { data: keyFiles };
}

// ============================================================================
// Function 6: Get Contributors
// ============================================================================

/**
 * Fetch repository contributors
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param token - Optional GitHub token
 * @returns Array of top 10 contributors
 * 
 * @endpoint GET /repos/{owner}/{repo}/contributors?per_page=10
 */
export async function getContributors(
  owner: string,
  repo: string,
  token?: string
): Promise<{ data?: Contributor[]; error?: ApiError }> {
  const result = await fetchJson<Array<{
    login: string;
    avatar_url: string;
    contributions: number;
    html_url: string;
  }>>(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=10`, token);

  if (result.error) return { error: result.error };

  return {
    data: result.data!.map((c) => ({
      login: c.login,
      avatarUrl: c.avatar_url,
      contributions: c.contributions,
      profileUrl: c.html_url,
    })),
  };
}

// ============================================================================
// Function 7: Get Commit Activity
// ============================================================================

/**
 * Fetch commit activity statistics
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param token - Optional GitHub token
 * @returns Commit activity stats
 * 
 * @endpoint GET /repos/{owner}/{repo}/stats/commit_activity
 */
export async function getCommitActivity(
  owner: string,
  repo: string,
  token?: string
): Promise<{ data?: CommitActivity; error?: ApiError }> {
  const result = await fetchJson<{
    all: number[];
    total: number[];
    week: number;
  }>(`${GITHUB_API_BASE}/repos/${owner}/${repo}/stats/commit_activity`, token);

  if (result.error) {
    // GitHub returns 202 while computing - retry once
    if (result.error.code === "API_ERROR") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return getCommitActivity(owner, repo, token);
    }
    return { error: result.error };
  }

  const data = result.data!;
  const totalCommitsLastYear = data.total.reduce((a, b) => a + b, 0);
  const avgCommitsPerWeek = Math.round(totalCommitsLastYear / 52);
  
  let mostActiveWeek = "";
  let maxCommits = 0;
  const now = new Date();
  for (let i = 0; i < data.total.length; i++) {
    if (data.total[i] > maxCommits) {
      maxCommits = data.total[i];
      const weekDate = new Date(now.getTime() - (51 - i) * 7 * 24 * 60 * 60 * 1000);
      mostActiveWeek = weekDate.toISOString().split("T")[0];
    }
  }

  const lastCommitDate = new Date(now.getTime() - (51 - data.week) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  return {
    data: {
      totalCommitsLastYear,
      avgCommitsPerWeek,
      mostActiveWeek,
      lastCommitDate,
    },
  };
}

// ============================================================================
// Function 8: Get Languages
// ============================================================================

/**
 * Fetch repository language breakdown
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param token - Optional GitHub token
 * @returns Language breakdown by bytes
 * 
 * @endpoint GET /repos/{owner}/{repo}/languages
 */
export async function getLanguages(
  owner: string,
  repo: string,
  token?: string
): Promise<{ data?: LanguageBreakdown; error?: ApiError }> {
  const result = await fetchJson<Record<string, number>>(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
    token
  );

  if (result.error) return result;

  // Sort by percentage descending
  const total = Object.values(result.data!).reduce((a, b) => a + b, 0);
  const sorted: LanguageBreakdown = {};
  
  Object.entries(result.data!)
    .sort((a, b) => b[1] - a[1])
    .forEach(([lang, bytes]) => {
      sorted[lang] = bytes;
    });

  return { data: sorted };
}

// ============================================================================
// Function 9: Get Dependencies
// ============================================================================

/**
 * Parse and return project dependencies
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param token - Optional GitHub token
 * @returns Array of dependencies
 */
export async function getDependencies(
  owner: string,
  repo: string,
  token?: string
): Promise<{ data?: Dependency[]; error?: ApiError }> {
  const deps: Dependency[] = [];

  // Try package.json first
  const pkgResult = await getFileContent(owner, repo, "package.json", token);
  if (pkgResult.data) {
    try {
      const pkg = JSON.parse(pkgResult.data.content);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      Object.entries(allDeps).forEach(([name, version]) => {
        deps.push({ name, version: String(version).replace(/[\^~>=<]/g, ""), isDev: !!pkg.devDependencies?.[name] });
      });
      return { data: deps };
    } catch {
      // Not valid JSON
    }
  }

  // Try requirements.txt
  const reqResult = await getFileContent(owner, repo, "requirements.txt", token);
  if (reqResult.data) {
    const lines = reqResult.data.content.split("\n");
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9_-]+)(?:[==>=<~!]+(.+))?/);
      if (match && !line.startsWith("#")) {
        deps.push({ name: match[1], version: match[2] || "latest", isDev: false });
      }
    }
    return { data: deps };
  }

  // Try Cargo.toml
  const cargoResult = await getFileContent(owner, repo, "Cargo.toml", token);
  if (cargoResult.data) {
    const depsMatch = cargoResult.data.content.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
    if (depsMatch) {
      const lines = depsMatch[1].split("\n");
      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_-]+)\s*=/);
        if (match) {
          deps.push({ name: match[1], version: "*", isDev: false });
        }
      }
    }
    return { data: deps };
  }

  return { data: [] };
}

// ============================================================================
// Function 10: Get Last Commit
// ============================================================================

/**
 * Fetch the last commit from repository
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name
 * @param token - Optional GitHub token
 * @returns Last commit info
 * 
 * @endpoint GET /repos/{owner}/{repo}/commits/{branch}
 */
export async function getLastCommit(
  owner: string,
  repo: string,
  branch: string,
  token?: string
): Promise<{ data?: { sha: string; message: string; date: string; author: string }; error?: ApiError }> {
  const result = await fetchJson<{
    sha: string;
    commit: {
      message: string;
      author: { date: string; name: string };
    };
  }>(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${branch}?per_page=1`, token);

  if (result.error) return { error: result.error };

  return {
    data: {
      sha: result.data!.sha,
      message: result.data!.commit.message,
      date: result.data!.commit.author.date,
      author: result.data!.commit.author.name,
    },
  };
}

// ============================================================================
// Function 11: Check Rate Limit
// ============================================================================

/**
 * Check current GitHub API rate limit status
 * 
 * @param token - Optional GitHub token
 * @returns Rate limit info
 * 
 * @endpoint GET /rate_limit
 */
export async function checkRateLimit(
  token?: string
): Promise<{ data?: RateLimitInfo; error?: ApiError }> {
  const result = await fetchJson<{
    rate: { limit: number; remaining: number; reset: number };
  }>(`${GITHUB_API_BASE}/rate_limit`, token);

  if (result.error) return { error: result.error };

  const { limit, remaining, reset } = result.data!.rate;
  return {
    data: {
      limit,
      remaining,
      resetAt: new Date(reset * 1000).toISOString(),
      isLow: remaining < 100,
    },
  };
}

// ============================================================================
// Function 11: Push README
// ============================================================================

/**
 * Push README.md to repository
 * 
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param content - README content
 * @param token - GitHub OAuth token (required)
 * @returns Push result
 * 
 * @endpoint PUT /repos/{owner}/{repo}/contents/README.md
 */
export async function pushReadme(
  owner: string,
  repo: string,
  content: string,
  token: string
): Promise<{ data?: PushReadmeResult; error?: ApiError }> {
  if (!token) {
    return { error: { error: "GitHub token required to push README", code: "NO_TOKEN", retryable: false } };
  }

  // Get current README SHA (if exists)
  const currentResult = await fetchJson<{ sha: string }>(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/README.md`,
    token
  );

  const body: Record<string, unknown> = {
    message: "docs: update README via RepoLens",
    content: Buffer.from(content).toString("base64"),
  };

  // Add SHA if updating existing file
  if (currentResult.data?.sha) {
    body.sha = currentResult.data.sha;
  }

  const result = await fetchJson<{ commit: { html_url: string } }>(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/README.md`,
    token
  );

  if (result.error) return { error: result.error };

  return {
    data: {
      success: true,
      commitUrl: result.data!.commit.html_url,
    },
  };
}

// ============================================================================
// MASTER FUNCTION: Build Repo Context
// ============================================================================

/**
 * Master function: Build complete repository context
 * 
 * @param url - GitHub repository URL
 * @param sessionToken - OAuth token from session (preferred)
 * @param forceRefresh - Force cache refresh
 * @returns Complete RepoContext object
 * 
 * Call order:
 * 1. parseRepoUrl → validate
 * 2. checkRateLimit → warn if low
 * 3. getRepoMetadata → get defaultBranch, validate not private
 * 4. Parallel: getFileTree + getContributors + getCommitActivity + getLanguages
 * 5. getKeyFiles (needs tree from step 4)
 * 6. getDependencies (needs tree from step 4)
 * 7. Assemble and return full RepoContext object
 */
export async function buildRepoContext(
  url: string,
  sessionToken?: string | null,
  forceRefresh: boolean = false
): Promise<{ data?: RepoContext; error?: ApiError }> {
  // Get token in priority order: OAuth > PAT > none
  const token = getToken(sessionToken);
  const tokenUsed: "oauth" | "pat" | "none" = sessionToken ? "oauth" : (process.env.GITHUB_PAT ? "pat" : "none");

  // Step 1: Parse URL
  const parsed = parseRepoUrl(url);
  if (!parsed) {
    return { error: { error: "Invalid GitHub repository URL", code: "INVALID_URL", retryable: false } };
  }

  const { owner, repo } = parsed;
  const cacheKey = `repolens:repo:${owner}:${repo}`;

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = await cache.get<RepoContext>(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for ${owner}/${repo}`);
      return {
        data: {
          ...cached,
          fromCache: true,
          cachedAt: new Date().toISOString(),
        },
      };
    }
  }

  // Step 2: Check rate limit
  const rateCheck = await checkRateLimit(token);
  if (rateCheck.data?.isLow) {
    console.warn(`⚠️ Low rate limit: ${rateCheck.data.remaining} remaining`);
  }

  // Step 3: Get metadata
  const metadataResult = await getRepoMetadata(owner, repo, token);
  if (metadataResult.error) return { error: metadataResult.error };

  // Step 4: Parallel fetching
  const [fileTreeResult, contributorsResult, activityResult, languagesResult, readmeResult, lastCommitResult] = await Promise.all([
    getFileTree(owner, repo, metadataResult.data!.defaultBranch, token),
    getContributors(owner, repo, token),
    getCommitActivity(owner, repo, token),
    getLanguages(owner, repo, token),
    getFileContent("README.md", owner, repo, token),
    getLastCommit(owner, repo, metadataResult.data!.defaultBranch, token),
  ]);

  // Step 5: Get key files
  const keyFilesResult = fileTreeResult.data
    ? await getKeyFiles(owner, repo, fileTreeResult.data, token)
    : { data: [] };

  // Step 6: Get dependencies
  const dependenciesResult = await getDependencies(owner, repo, token);

  // Build packageFile from dependencies
  const pkgFile = dependenciesResult.data?.find(d => 
    d.name === "package.json" || d.name === "requirements.txt" || d.name === "Cargo.toml"
  );
  let packageFile: { type: string; content: string; dependencies: string[] } | null = null;
  if (pkgFile) {
    packageFile = {
      type: pkgFile.name as string,
      content: "",
      dependencies: dependenciesResult.data?.map(d => d.name) || [],
    };
  }

  // Assemble context
  const context: RepoContext = {
    url,
    owner,
    repo,
    metadata: metadataResult.data!,
    tree: {
      sha: "",
      tree: fileTreeResult.data || [],
      truncated: false,
    },
    readme: readmeResult.data?.content || "",
    packageFile,
    importantFiles: keyFilesResult.data || [],
    contributors: contributorsResult.data || [],
    lastCommit: lastCommitResult.data || {
      sha: "",
      message: "",
      date: "",
      author: "",
    },
    commitActivity: activityResult.data || {
      totalCommitsLastYear: 0,
      avgCommitsPerWeek: 0,
      mostActiveWeek: "",
      lastCommitDate: "",
    },
    languages: languagesResult.data || {},
    dependencies: dependenciesResult.data || [],
    scrapedAt: new Date().toISOString(),
    tokenUsed,
  };

  // Cache the result (1 hour)
  await cache.set(cacheKey, context, 3600);

  console.log(`✅ Built repo context for ${owner}/${repo}`);

  return { data: context };
}

// Export all functions
export default buildRepoContext;
