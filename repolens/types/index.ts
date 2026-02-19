/**
 * RepoLens Type Definitions
 * Central type definitions for the entire application
 */

/**
 * Repository metadata from GitHub
 */
export interface RepoMetadata {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  topics: string[];
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

/**
 * Repository file tree structure
 */
export interface FileTreeItem {
  path: string;
  type: 'file' | 'tree';
  sha: string;
  url?: string;
  size?: number;
}

/**
 * Parsed dependency information from package files
 */
export interface Dependencies {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  type: 'npm' | 'python' | 'rust' | 'go' | 'unknown';
}

/**
 * Complete repository context for analysis
 */
export interface RepoContext {
  owner: string;
  repo: string;
  metadata: RepoMetadata;
  fileTree: FileTreeItem[];
  readme: string | null;
  dependencies: Dependencies | null;
  importantFiles: ImportantFile[];
  stats: {
    totalFiles: number;
    totalLines: number;
    languages: Record<string, number>;
  };
  fetchedAt: string;
}

/**
 * Important file with content
 */
export interface ImportantFile {
  path: string;
  content: string;
  language: string;
  size: number;
  importance: number;
}

/**
 * Analysis result from LLM
 */
export interface AnalysisResult {
  explanation: string;
  score: {
    overall: number;
    breakdown: {
      codeQuality: number;
      documentation: number;
      tests: number;
      activity: number;
      dependencies: number;
      community: number;
    };
    recommendations: string[];
  };
  diagrams: {
    architecture: string;
    workflow: string;
  };
  deployment: {
    free: DeploymentOption[];
    paid: DeploymentOption[];
  };
  mcp: {
    config: object;
  };
}

/**
 * Deployment option
 */
export interface DeploymentOption {
  platform: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedTime: string;
  steps: string[];
}

/**
 * README generation result
 */
export interface ReadmeResult {
  markdown: string;
  badges: string[];
  sections: string[];
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: number;
  repo_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  provider?: string;
}

/**
 * User settings
 */
export interface UserSettings {
  githubToken?: string;
  apiKeys: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
    groq?: string;
  };
  preferredProvider: 'gemini' | 'openai' | 'anthropic' | 'groq';
  preferredModels: {
    gemini: string;
    openai: string;
    anthropic: string;
    groq: string;
  };
}

/**
 * LLM Provider types
 */
export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'groq';

/**
 * Available models per provider
 */
export const AVAILABLE_MODELS: Record<LLMProvider, string[]> = {
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  groq: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
};

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  cachedAt?: string;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}
