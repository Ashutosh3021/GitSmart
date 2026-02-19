/**
 * Zod Validation Schemas
 * Input validation for all API routes
 */

import { z } from 'zod';
import { AVAILABLE_MODELS, LLMProvider } from '@/types';

/**
 * Repository URL validation
 */
export const repoUrlSchema = z.object({
  url: z.string()
    .min(1, 'Repository URL is required')
    .refine(
      (val) => {
        // Accept full URLs or owner/repo format
        const githubPattern = /^(https:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
        const shortPattern = /^[\w-]+\/[\w.-]+$/;
        return githubPattern.test(val) || shortPattern.test(val);
      },
      {
        message: 'Invalid repository URL. Use format: github.com/owner/repo or owner/repo',
      }
    ),
});

/**
 * Owner and repo parameters
 */
export const repoParamsSchema = z.object({
  owner: z.string().min(1).regex(/^[\w-]+$/, 'Invalid owner name'),
  repo: z.string().min(1).regex(/^[\w.-]+$/, 'Invalid repository name'),
});

/**
 * Analysis request schema
 */
export const analyzeRequestSchema = z.object({
  url: repoUrlSchema.shape.url,
  provider: z.enum(['gemini', 'openai', 'anthropic', 'groq'] as const).optional(),
  model: z.string().optional(),
});

/**
 * README generation request
 */
export const readmeGenerateSchema = z.object({
  owner: repoParamsSchema.shape.owner,
  repo: repoParamsSchema.shape.repo,
  provider: z.enum(['gemini', 'openai', 'anthropic', 'groq'] as const).optional(),
  model: z.string().optional(),
  options: z.object({
    includeBadges: z.boolean().default(true),
    includeBanner: z.boolean().default(true),
    includeToc: z.boolean().default(true),
  }).optional(),
});

/**
 * README push request
 */
export const readmePushSchema = z.object({
  owner: repoParamsSchema.shape.owner,
  repo: repoParamsSchema.shape.repo,
  content: z.string().min(1, 'README content is required'),
  message: z.string().default('docs: Update README via RepoLens'),
  branch: z.string().default('main'),
});

/**
 * Chat message request
 */
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(4000, 'Message too long'),
  provider: z.enum(['gemini', 'openai', 'anthropic', 'groq'] as const).optional(),
  model: z.string().optional(),
});

/**
 * API keys settings schema
 */
export const apiKeysSchema = z.object({
  gemini: z.string().optional().refine(
    (val) => !val || val.startsWith('AI'),
    { message: 'Invalid Gemini API key format' }
  ),
  openai: z.string().optional().refine(
    (val) => !val || val.startsWith('sk-'),
    { message: 'Invalid OpenAI API key format' }
  ),
  anthropic: z.string().optional().refine(
    (val) => !val || val.startsWith('sk-ant-'),
    { message: 'Invalid Anthropic API key format' }
  ),
  groq: z.string().optional().refine(
    (val) => !val || val.startsWith('gsk_'),
    { message: 'Invalid Groq API key format' }
  ),
});

/**
 * User settings schema
 */
export const userSettingsSchema = z.object({
  apiKeys: apiKeysSchema,
  preferredProvider: z.enum(['gemini', 'openai', 'anthropic', 'groq'] as const).default('gemini'),
  preferredModels: z.object({
    gemini: z.string().default('gemini-1.5-flash'),
    openai: z.string().default('gpt-4o-mini'),
    anthropic: z.string().default('claude-3-5-sonnet-20241022'),
    groq: z.string().default('llama-3.1-70b-versatile'),
  }).default({
    gemini: 'gemini-1.5-flash',
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-20241022',
    groq: 'llama-3.1-70b-versatile',
  }),
});

/**
 * Type exports from schemas
 */
export type RepoUrlInput = z.infer<typeof repoUrlSchema>;
export type RepoParamsInput = z.infer<typeof repoParamsSchema>;
export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
export type ReadmeGenerateInput = z.infer<typeof readmeGenerateSchema>;
export type ReadmePushInput = z.infer<typeof readmePushSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type ApiKeysInput = z.infer<typeof apiKeysSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
