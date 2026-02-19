/**
 * Type definitions for RepoLens backend
 */

/**
 * AI Provider types
 */
export type AIProvider = "gemini" | "openai" | "anthropic" | "groq";

/**
 * Repository metadata from GitHub
 */
export interface RepoMetadata {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  owner: {
    login: string;
    avatarUrl: string;
  };
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  license: string | null;
  createdAt: string;
  updatedAt: string;
  defaultBranch: string;
  topics: string[];
  homepage: string | null;
}

/**
 * File node in repository tree
 */
export interface FileNode {
  path: string;
  type: "file" | "dir";
  sha: string;
  size?: number;
  url?: string;
}

/**
 * Repository file tree
 */
export interface RepoTree {
  sha: string;
  tree: FileNode[];
  truncated: boolean;
}

/**
 * Important file with content
 */
export interface ImportantFile {
  path: string;
  content: string;
  size: number;
  language?: string;
}

/**
 * Package/dependency file content
 */
export interface PackageFile {
  type: "package.json" | "requirements.txt" | "Cargo.toml" | "pom.xml" | "go.mod" | "Gemfile" | "build.gradle" | "composer.json" | "setup.py" | "pyproject.toml" | null;
  content: string;
  dependencies: string[];
}

/**
 * Full repository context for analysis
 */
export interface RepoContext {
  metadata: RepoMetadata;
  tree: RepoTree;
  readme: string;
  packageFile: PackageFile | null;
  importantFiles: ImportantFile[];
  languages: Record<string, number>;
  contributors: number;
  lastCommit: {
    sha: string;
    message: string;
    date: string;
    author: string;
  };
}

/**
 * Score breakdown dimensions
 */
export interface ScoreBreakdown {
  codeQuality: number;
  documentation: number;
  testing: number;
  activity: number;
  dependencies: number;
  community: number;
}

/**
 * Repository analysis result
 */
export interface AnalysisResult {
  explanation: string;
  score: {
    overall: number;
    breakdown: ScoreBreakdown;
    details: Record<keyof ScoreBreakdown, string[]>;
  };
  diagrams: {
    architecture: string;
    workflow: string;
  };
  deploymentGuide: {
    free: DeploymentOption[];
    paid: DeploymentOption[];
  };
  mcpConfig: Record<string, unknown>;
}

/**
 * Deployment platform option
 */
export interface DeploymentOption {
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  steps: string[];
  features: string[];
  estimatedTime: string;
  pricing: string;
}

/**
 * Chat message
 */
export interface ChatMessage {
  id: number;
  repoId: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

/**
 * User settings
 */
export interface UserSettings {
  id?: number;
  userId: string;
  provider: AIProvider;
  model: string;
  apiKeys: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
    groq?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * GitHub OAuth session
 */
export interface GitHubSession {
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    githubAccessToken: string;
  };
  expires: string;
}

/**
 * LLM response
 */
export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProvider;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * API Response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * README generation request
 */
export interface ReadmeGenerationRequest {
  repoContext: RepoContext;
  analysis: AnalysisResult;
  includeBadges: boolean;
  includeBanner: boolean;
  includeToc: boolean;
  tone: "professional" | "casual" | "technical";
}

/**
 * Zod validation schemas
 */
export const AnalyzeRepoSchema = {
  url: "string",
  provider: "AIProvider.optional()",
  model: "string.optional()",
};

export const ChatMessageSchema = {
  message: "string",
  provider: "AIProvider.optional()",
  model: "string.optional()",
};

export const SaveApiKeysSchema = {
  provider: "AIProvider",
  apiKey: "string",
  model: "string.optional()",
};
