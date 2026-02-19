/**
 * LLM Service
 * Handles multiple LLM providers (Gemini, OpenAI, Anthropic, Groq)
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { LLMProvider, UserSettings } from '@/types';

/**
 * LLM Client interfaces
 */
interface GeminiClient {
  type: 'gemini';
  client: GoogleGenerativeAI;
}

interface OpenAIClient {
  type: 'openai';
  client: OpenAI;
}

interface AnthropicClient {
  type: 'anthropic';
  client: Anthropic;
}

interface GroqClient {
  type: 'groq';
  client: Groq;
}

type LLMClient = GeminiClient | OpenAIClient | AnthropicClient | GroqClient;

/**
 * Get default model for provider
 */
export function getDefaultModel(provider: LLMProvider): string {
  switch (provider) {
    case 'gemini':
      return 'gemini-1.5-flash';
    case 'openai':
      return 'gpt-4o-mini';
    case 'anthropic':
      return 'claude-3-5-sonnet-20241022';
    case 'groq':
      return 'llama-3.1-70b-versatile';
    default:
      return 'gemini-1.5-flash';
  }
}

/**
 * Initialize LLM client based on provider
 */
export function initLLMClient(
  provider: LLMProvider,
  apiKey: string
): LLMClient {
  switch (provider) {
    case 'gemini':
      return {
        type: 'gemini',
        client: new GoogleGenerativeAI(apiKey),
      };
    case 'openai':
      return {
        type: 'openai',
        client: new OpenAI({ apiKey }),
      };
    case 'anthropic':
      return {
        type: 'anthropic',
        client: new Anthropic({ apiKey }),
      };
    case 'groq':
      return {
        type: 'groq',
        client: new Groq({ apiKey }),
      };
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Generate text using specified provider
 */
export async function generateText(
  client: LLMClient,
  prompt: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  switch (client.type) {
    case 'gemini':
      return generateWithGemini(client.client, prompt, model, systemPrompt);
    case 'openai':
      return generateWithOpenAI(client.client, prompt, model, systemPrompt);
    case 'anthropic':
      return generateWithAnthropic(client.client, prompt, model, systemPrompt);
    case 'groq':
      return generateWithGroq(client.client, prompt, model, systemPrompt);
    default:
      throw new Error('Unknown client type');
  }
}

/**
 * Generate with Gemini
 */
async function generateWithGemini(
  client: GoogleGenerativeAI,
  prompt: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  const genModel = client.getGenerativeModel({ model });
  
  const result = await genModel.generateContent({
    contents: [
      ...(systemPrompt ? [{ role: 'user' as const, parts: [{ text: systemPrompt }] }] : []),
      { role: 'user', parts: [{ text: prompt }] },
    ],
  });
  
  return result.response.text();
}

/**
 * Generate with OpenAI
 */
async function generateWithOpenAI(
  client: OpenAI,
  prompt: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: prompt });
  
  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });
  
  return response.choices[0]?.message?.content || '';
}

/**
 * Generate with Anthropic
 */
async function generateWithAnthropic(
  client: Anthropic,
  prompt: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: prompt },
    ],
  });
  
  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  return '';
}

/**
 * Generate with Groq
 */
async function generateWithGroq(
  client: Groq,
  prompt: string,
  model: string,
  systemPrompt?: string
): Promise<string> {
  const messages: { role: 'system' | 'user'; content: string }[] = [];
  
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  
  messages.push({ role: 'user', content: prompt });
  
  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 4000,
  });
  
  return response.choices[0]?.message?.content || '';
}

/**
 * Generate streaming text (for chat)
 */
export async function* generateTextStream(
  client: LLMClient,
  prompt: string,
  model: string,
  systemPrompt?: string
): AsyncGenerator<string> {
  // For now, return full text (streaming can be added later)
  const text = await generateText(client, prompt, model, systemPrompt);
  yield text;
}

/**
 * Validate API key by making a test call
 */
export async function validateApiKey(
  provider: LLMProvider,
  apiKey: string
): Promise<boolean> {
  try {
    const client = initLLMClient(provider, apiKey);
    
    // Make a simple test call
    const model = getDefaultModel(provider);
    await generateText(client, 'Hello', model);
    
    return true;
  } catch (error) {
    console.error(`API key validation failed for ${provider}:`, error);
    return false;
  }
}

/**
 * Get API key from settings or environment
 */
export function getApiKey(
  provider: LLMProvider,
  userSettings?: UserSettings
): string | undefined {
  // First check user settings
  if (userSettings?.apiKeys?.[provider]) {
    return userSettings.apiKeys[provider];
  }
  
  // Fall back to environment variables
  switch (provider) {
    case 'gemini':
      return process.env.GEMINI_API_KEY;
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    case 'groq':
      return process.env.GROQ_API_KEY;
    default:
      return undefined;
  }
}
