/**
 * GitHub Scraper Service
 * Fetches and parses repository data from GitHub
 */

import {
  fetchRepoMetadata,
  fetchRepoTree,
  fetchFileContent,
  fetchReadme,
  fetchRepoLanguages,
} from '@/lib/github';
import { RepoContext, Dependencies, ImportantFile, FileTreeItem } from '@/types';

/**
 * Important file patterns to prioritize
 */
const IMPORTANT_PATTERNS = [
  // Config files
  /package\.json$/,
  /requirements\.txt$/,
  /Cargo\.toml$/,
  /go\.mod$/,
  /pom\.xml$/,
  /build\.gradle$/,
  /CMakeLists\.txt$/,
  /Dockerfile$/,
  /docker-compose\.yml$/,
  /\.env\.example$/,
  /next\.config\./,
  /tailwind\.config\./,
  /tsconfig\.json$/,
  /vite\.config\./,
  /webpack\.config\./,
  
  // Entry points
  /index\.(js|ts|jsx|tsx|py|rs|go)$/,
  /main\.(js|ts|py|rs|go|c|cpp)$/,
  /app\.(js|ts|py)$/,
  /server\.(js|ts)$/,
  
  // Core application files
  /routes\./,
  /controller\./,
  /api\/.*\.(js|ts)$/,
  /src\/.*\.(js|ts|jsx|tsx|py|rs|go)$/,
  /lib\/.*\.(js|ts|py|rs|go)$/,
  
  // Documentation
  /CONTRIBUTING/,
  /LICENSE/,
  /CHANGELOG/,
  
  // CI/CD
  /\.github\/workflows/,
  /\.gitlab-ci\.yml$/,
  /vercel\.json$/,
  /netlify\.toml$/,
];

/**
 * Maximum file size to fetch (100KB)
 */
const MAX_FILE_SIZE = 100 * 1024;

/**
 * Maximum number of important files to fetch
 */
const MAX_IMPORTANT_FILES = 20;

/**
 * Parse owner and repo from URL or owner/repo format
 */
export function parseRepoUrl(url: string): { owner: string; repo: string } {
  // Remove protocol and domain if present
  let cleanUrl = url.trim();
  
  if (cleanUrl.includes('github.com')) {
    const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  }
  
  // Handle owner/repo format
  const parts = cleanUrl.split('/');
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  }
  
  throw new Error('Invalid repository URL format');
}

/**
 * Calculate file importance score
 */
function calculateImportance(path: string): number {
  let score = 0;
  
  for (const pattern of IMPORTANT_PATTERNS) {
    if (pattern.test(path)) {
      score += 10;
    }
  }
  
  // Boost score for files in root directory
  if (!path.includes('/')) {
    score += 5;
  }
  
  // Boost for config files
  if (path.includes('config') || path.startsWith('.')) {
    score += 3;
  }
  
  return score;
}

/**
 * Detect project type and parse dependencies
 */
async function parseDependencies(
  owner: string,
  repo: string,
  tree: FileTreeItem[]
): Promise<Dependencies | null> {
  // Check for package.json (Node.js)
  const packageJson = tree.find((f) => f.path === 'package.json');
  if (packageJson) {
    try {
      const content = await fetchFileContent(owner, repo, 'package.json');
      const pkg = JSON.parse(content);
      return {
        name: pkg.name,
        version: pkg.version,
        dependencies: pkg.dependencies || {},
        devDependencies: pkg.devDependencies || {},
        scripts: pkg.scripts || {},
        type: 'npm',
      };
    } catch (error) {
      console.error('Failed to parse package.json:', error);
    }
  }
  
  // Check for requirements.txt (Python)
  const requirementsTxt = tree.find((f) => f.path === 'requirements.txt');
  if (requirementsTxt) {
    try {
      const content = await fetchFileContent(owner, repo, 'requirements.txt');
      const deps: Record<string, string> = {};
      content.split('\n').forEach((line) => {
        const match = line.match(/^([a-zA-Z0-9_-]+)==(.+)$/);
        if (match) {
          deps[match[1]] = match[2];
        }
      });
      return {
        dependencies: deps,
        type: 'python',
      };
    } catch (error) {
      console.error('Failed to parse requirements.txt:', error);
    }
  }
  
  // Check for Cargo.toml (Rust)
  const cargoToml = tree.find((f) => f.path === 'Cargo.toml');
  if (cargoToml) {
    return { type: 'rust' };
  }
  
  // Check for go.mod (Go)
  const goMod = tree.find((f) => f.path === 'go.mod');
  if (goMod) {
    return { type: 'go' };
  }
  
  return null;
}

/**
 * Detect language from file extension
 */
function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'py': 'python',
    'rs': 'rust',
    'go': 'go',
    'java': 'java',
    'rb': 'ruby',
    'php': 'php',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'md': 'markdown',
    'json': 'json',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
    'xml': 'xml',
  };
  
  return langMap[ext || ''] || 'unknown';
}

/**
 * Fetch important files content
 */
async function fetchImportantFiles(
  owner: string,
  repo: string,
  tree: FileTreeItem[]
): Promise<ImportantFile[]> {
  // Score and sort files
  const scoredFiles = tree
    .filter((f) => f.type === 'blob' && (f.size || 0) < MAX_FILE_SIZE)
    .map((f) => ({
      ...f,
      importance: calculateImportance(f.path),
      language: detectLanguage(f.path),
    }))
    .filter((f) => f.importance > 0)
    .sort((a, b) => b.importance - a.importance)
    .slice(0, MAX_IMPORTANT_FILES);
  
  // Fetch content for each file
  const files: ImportantFile[] = [];
  
  for (const file of scoredFiles) {
    try {
      const content = await fetchFileContent(owner, repo, file.path);
      
      // Count lines
      const lines = content.split('\n').length;
      
      files.push({
        path: file.path,
        content: content.slice(0, 5000), // Limit content size
        language: file.language,
        size: file.size || 0,
        importance: file.importance,
      });
    } catch (error) {
      console.error(`Failed to fetch ${file.path}:`, error);
    }
  }
  
  return files;
}

/**
 * Scrape repository and build context
 */
export async function scrapeRepository(
  owner: string,
  repo: string
): Promise<RepoContext> {
  console.log(`Scraping repository: ${owner}/${repo}`);
  
  // Fetch metadata
  const metadata = await fetchRepoMetadata(owner, repo);
  
  // Fetch file tree
  const tree = await fetchRepoTree(owner, repo, metadata.default_branch);
  
  // Fetch README
  const readme = await fetchReadme(owner, repo);
  
  // Parse dependencies
  const dependencies = await parseDependencies(owner, repo, tree);
  
  // Fetch important files
  const importantFiles = await fetchImportantFiles(owner, repo, tree);
  
  // Fetch language stats
  const languages = await fetchRepoLanguages(owner, repo);
  
  // Calculate stats
  const totalFiles = tree.filter((f) => f.type === 'blob').length;
  const totalLines = importantFiles.reduce((sum, f) => {
    return sum + f.content.split('\n').length;
  }, 0);
  
  const context: RepoContext = {
    owner,
    repo,
    metadata,
    fileTree: tree,
    readme,
    dependencies,
    importantFiles,
    stats: {
      totalFiles,
      totalLines,
      languages,
    },
    fetchedAt: new Date().toISOString(),
  };
  
  console.log(`Scraped ${owner}/${repo}: ${totalFiles} files, ${importantFiles.length} important files`);
  
  return context;
}
