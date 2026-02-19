/**
 * GitHub Scraper Service
 * Fetches repository data, file tree, README, and important files
 */

import type {
  RepoContext,
  RepoMetadata,
  RepoTree,
  ImportantFile,
  PackageFile,
  FileNode,
} from "../lib/types";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Rate limit tracking
 */
interface RateLimit {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Parse GitHub URL to extract owner and repo
 * @param url - GitHub repository URL
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } {
  const cleanUrl = url
    .replace("https://", "")
    .replace("http://", "")
    .replace("github.com/", "");
  const parts = cleanUrl.split("/");

  if (parts.length < 2) {
    throw new Error("Invalid GitHub URL format");
  }

  return {
    owner: parts[0],
    repo: parts[1].replace(/\.git$/, "").split("#")[0].split("?")[0],
  };
}

/**
 * Get authorization header
 * @param accessToken - GitHub OAuth access token
 */
export function getAuthHeader(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoLens/1.0",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * Check rate limit status
 * @param accessToken - GitHub OAuth access token
 */
export async function checkRateLimit(accessToken?: string): Promise<RateLimit> {
  const response = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
    headers: getAuthHeader(accessToken),
  });

  if (!response.ok) {
    throw new Error("Failed to check rate limit");
  }

  const data = await response.json();
  return {
    limit: data.rate.limit,
    remaining: data.rate.remaining,
    reset: data.rate.reset,
  };
}

/**
 * Fetch repository metadata
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param accessToken - GitHub OAuth access token
 */
export async function fetchRepoMetadata(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<RepoMetadata> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: getAuthHeader(accessToken),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Repository not found");
    }
    if (response.status === 403) {
      throw new Error("API rate limit exceeded. Please try again later.");
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    owner: {
      login: data.owner.login,
      avatarUrl: data.owner.avatar_url,
    },
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    language: data.language,
    license: data.license?.spdx_id || null,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    defaultBranch: data.default_branch,
    topics: data.topics || [],
    homepage: data.homepage,
  };
}

/**
 * Fetch repository file tree
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name (default: repo's default branch)
 * @param accessToken - GitHub OAuth access token
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch?: string,
  accessToken?: string
): Promise<RepoTree> {
  // First get the reference to the branch
  const refResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${branch || "main"}`,
    {
      headers: getAuthHeader(accessToken),
    }
  );

  if (!refResponse.ok) {
    // Try 'master' if 'main' fails
    const masterResponse = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/master`,
      {
        headers: getAuthHeader(accessToken),
      }
    );

    if (!masterResponse.ok) {
      throw new Error("Failed to fetch repository tree");
    }

    const masterData = await masterResponse.json();
    branch = "master";
  }

  const refData = await refResponse.json();
  const sha = refData.object.sha;

  // Get the tree recursively
  const treeResponse = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`,
    {
      headers: getAuthHeader(accessToken),
    }
  );

  if (!treeResponse.ok) {
    throw new Error("Failed to fetch repository tree");
  }

  const treeData = await treeResponse.json();

  return {
    sha: treeData.sha,
    tree: treeData.tree.map((item: Record<string, unknown>) => ({
      path: item.path as string,
      type: item.type === "tree" ? "dir" : "file",
      sha: item.sha as string,
      size: item.size as number | undefined,
      url: item.url as string | undefined,
    })),
    truncated: treeData.truncated,
  };
}

/**
 * Fetch file content
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param path - File path
 * @param branch - Branch name
 * @param accessToken - GitHub OAuth access token
 */
export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch?: string,
  accessToken?: string
): Promise<{ content: string; size: number }> {
  const url = new URL(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`
  );
  if (branch) {
    url.searchParams.append("ref", branch);
  }

  const response = await fetch(url.toString(), {
    headers: getAuthHeader(accessToken),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${path}`);
  }

  const data = await response.json();

  // Decode base64 content
  const content = Buffer.from(data.content, "base64").toString("utf-8");

  return {
    content,
    size: data.size,
  };
}

/**
 * Fetch README content
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name
 * @param accessToken - GitHub OAuth access token
 */
export async function fetchReadme(
  owner: string,
  repo: string,
  branch?: string,
  accessToken?: string
): Promise<string> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
      {
        headers: getAuthHeader(accessToken),
      }
    );

    if (!response.ok) {
      return "";
    }

    const data = await response.json();
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

/**
 * Detect package file type and content
 * @param tree - Repository file tree
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name
 * @param accessToken - GitHub OAuth access token
 */
export async function detectPackageFile(
  tree: RepoTree,
  owner: string,
  repo: string,
  branch?: string,
  accessToken?: string
): Promise<PackageFile | null> {
  const packageFiles = [
    { path: "package.json", type: "package.json" as const },
    { path: "requirements.txt", type: "requirements.txt" as const },
    { path: "Cargo.toml", type: "Cargo.toml" as const },
    { path: "pom.xml", type: "pom.xml" as const },
    { path: "build.gradle", type: "build.gradle" as const },
    { path: "go.mod", type: "go.mod" as const },
    { path: "Gemfile", type: "Gemfile" as const },
    { path: "composer.json", type: "composer.json" as const },
    { path: "setup.py", type: "setup.py" as const },
    { path: "pyproject.toml", type: "pyproject.toml" as const },
  ];

  for (const pkg of packageFiles) {
    const found = tree.tree.find(
      (file) => file.path === pkg.path || file.path.endsWith(`/${pkg.path}`)
    );

    if (found && found.type === "file") {
      try {
        const { content } = await fetchFileContent(
          owner,
          repo,
          found.path,
          branch,
          accessToken
        );

        // Extract dependencies based on file type
        let dependencies: string[] = [];
        try {
          if (pkg.type === "package.json") {
            const parsed = JSON.parse(content);
            dependencies = Object.keys({
              ...parsed.dependencies,
              ...parsed.devDependencies,
            });
          } else if (pkg.type === "requirements.txt") {
            dependencies = content
              .split("\n")
              .map((line) => line.split("===")[0].split(">=")[0].trim())
              .filter((line) => line && !line.startsWith("#"));
          } else if (pkg.type === "Cargo.toml") {
            const parsed = content.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
            if (parsed) {
              dependencies = parsed[1]
                .split("\n")
                .map((line) => line.split("=")[0].trim())
                .filter((line) => line && !line.startsWith("#"));
            }
          }
        } catch {
          // Ignore parsing errors
        }

        return {
          type: pkg.type,
          content,
          dependencies,
        };
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * Calculate importance score for a file
 * @param path - File path
 * @param language - Primary repository language
 */
function calculateFileImportance(path: string, language?: string | null): number {
  const fileName = path.split("/").pop() || "";
  const extension = fileName.split(".").pop() || "";

  let score = 0;

  // Entry point files
  const entryPoints = [
    "index",
    "main",
    "app",
    "server",
    "cli",
    "core",
    "init",
  ];
  if (entryPoints.some((ep) => fileName.toLowerCase().startsWith(ep))) {
    score += 50;
  }

  // Configuration files
  const configFiles = [
    "config",
    ".config",
    "settings",
    "setup",
    "webpack",
    "vite",
    "rollup",
    "tsconfig",
    "jsconfig",
  ];
  if (configFiles.some((cf) => fileName.toLowerCase().includes(cf))) {
    score += 40;
  }

  // Router/Route files
  if (fileName.toLowerCase().includes("route")) {
    score += 35;
  }

  // Auth files
  if (fileName.toLowerCase().includes("auth")) {
    score += 35;
  }

  // Database files
  const dbFiles = ["db", "database", "model", "schema", "migration"];
  if (dbFiles.some((db) => fileName.toLowerCase().includes(db))) {
    score += 30;
  }

  // API files
  if (fileName.toLowerCase().includes("api")) {
    score += 25;
  }

  // Test files (lower priority)
  if (
    fileName.includes("test") ||
    fileName.includes("spec") ||
    path.includes("/__tests__/")
  ) {
    score -= 20;
  }

  // Documentation files
  if (extension === "md" || extension === "mdx") {
    score -= 10;
  }

  // Language-specific scoring
  if (language) {
    const langExtensions: Record<string, string[]> = {
      TypeScript: ["ts", "tsx"],
      JavaScript: ["js", "jsx"],
      Python: ["py"],
      Rust: ["rs"],
      Go: ["go"],
      "C++": ["cpp", "cc", "hpp"],
      Java: ["java"],
    };

    const extensions = langExtensions[language];
    if (extensions && extensions.includes(extension)) {
      score += 10;
    }
  }

  // Prefer files in root or src directory
  if (path.split("/").length <= 2) {
    score += 15;
  }

  return score;
}

/**
 * Get top important files
 * @param tree - Repository file tree
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name
 * @param language - Primary language
 * @param limit - Maximum number of files
 * @param accessToken - GitHub OAuth access token
 */
export async function getImportantFiles(
  tree: RepoTree,
  owner: string,
  repo: string,
  branch?: string,
  language?: string | null,
  limit: number = 20,
  accessToken?: string
): Promise<ImportantFile[]> {
  // Filter and score files
  const scoredFiles = tree.tree
    .filter(
      (file) =>
        file.type === "file" &&
        !file.path.includes("node_modules/") &&
        !file.path.includes(".git/") &&
        !file.path.includes("dist/") &&
        !file.path.includes("build/") &&
        (file.size || 0) < 50000 // Skip files larger than 50KB
    )
    .map((file) => ({
      ...file,
      score: calculateFileImportance(file.path, language),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Fetch content for each file
  const importantFiles: ImportantFile[] = [];

  for (const file of scoredFiles) {
    try {
      const { content, size } = await fetchFileContent(
        owner,
        repo,
        file.path,
        branch,
        accessToken
      );

      // Detect language from extension
      const extension = file.path.split(".").pop() || "";
      const languageMap: Record<string, string> = {
        ts: "TypeScript",
        tsx: "TypeScript",
        js: "JavaScript",
        jsx: "JavaScript",
        py: "Python",
        rs: "Rust",
        go: "Go",
        java: "Java",
        rb: "Ruby",
        php: "PHP",
        cpp: "C++",
        c: "C",
        cs: "C#",
        swift: "Swift",
        kt: "Kotlin",
      };

      importantFiles.push({
        path: file.path,
        content,
        size,
        language: languageMap[extension],
      });
    } catch (error) {
      console.warn(`Failed to fetch file ${file.path}:`, error);
    }
  }

  return importantFiles;
}

/**
 * Fetch repository languages
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param accessToken - GitHub OAuth access token
 */
export async function fetchLanguages(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<Record<string, number>> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`,
    {
      headers: getAuthHeader(accessToken),
    }
  );

  if (!response.ok) {
    return {};
  }

  return await response.json();
}

/**
 * Fetch last commit information
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param branch - Branch name
 * @param accessToken - GitHub OAuth access token
 */
export async function fetchLastCommit(
  owner: string,
  repo: string,
  branch?: string,
  accessToken?: string
): Promise<{
  sha: string;
  message: string;
  date: string;
  author: string;
}> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=1&sha=${branch || "main"}`,
    {
      headers: getAuthHeader(accessToken),
    }
  );

  if (!response.ok) {
    return {
      sha: "",
      message: "",
      date: "",
      author: "",
    };
  }

  const data = await response.json();
  const commit = data[0];

  return {
    sha: commit?.sha || "",
    message: commit?.commit?.message || "",
    date: commit?.commit?.committer?.date || "",
    author: commit?.commit?.author?.name || "",
  };
}

/**
 * Fetch contributor count
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param accessToken - GitHub OAuth access token
 */
export async function fetchContributorCount(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<number> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=1`,
    {
      headers: getAuthHeader(accessToken),
    }
  );

  if (!response.ok) {
    return 0;
  }

  // Get total count from Link header
  const linkHeader = response.headers.get("Link");
  if (linkHeader) {
    const match = linkHeader.match(/page=(\d+)[^>]*>;\s*rel="last"/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return 0;
}

/**
 * Scrape full repository context
 * @param url - GitHub repository URL
 * @param accessToken - GitHub OAuth access token
 */
export async function scrapeRepository(
  url: string,
  accessToken?: string
): Promise<RepoContext> {
  console.log(`🔍 Scraping repository: ${url}`);

  const { owner, repo } = parseRepoUrl(url);
  console.log(`   Owner: ${owner}, Repo: ${repo}`);

  // Check rate limit
  const rateLimit = await checkRateLimit(accessToken);
  if (rateLimit.remaining < 10) {
    throw new Error(
      `GitHub API rate limit almost exceeded. Resets at ${new Date(
        rateLimit.reset * 1000
      ).toLocaleString()}`
    );
  }

  console.log(`   Rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining`);

  // Fetch all data in parallel
  const [metadata, tree, readme, languages, lastCommit, contributors] =
    await Promise.all([
      fetchRepoMetadata(owner, repo, accessToken),
      fetchRepoTree(owner, repo, undefined, accessToken),
      fetchReadme(owner, repo, undefined, accessToken),
      fetchLanguages(owner, repo, accessToken),
      fetchLastCommit(owner, repo, undefined, accessToken),
      fetchContributorCount(owner, repo, accessToken),
    ]);

  console.log(`   Fetched metadata, tree (${tree.tree.length} files), README, languages`);

  // Detect package file
  const packageFile = await detectPackageFile(
    tree,
    owner,
    repo,
    metadata.defaultBranch,
    accessToken
  );

  // Get important files
  const importantFiles = await getImportantFiles(
    tree,
    owner,
    repo,
    metadata.defaultBranch,
    metadata.language,
    20,
    accessToken
  );

  console.log(`   Identified ${importantFiles.length} important files`);

  return {
    metadata,
    tree,
    readme,
    packageFile,
    importantFiles,
    languages,
    contributors,
    lastCommit,
  };
}
