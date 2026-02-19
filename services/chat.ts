/**
 * Chat Service
 * Handles chat history persistence and LLM-powered responses
 */

import type { ChatMessage, RepoContext, AIProvider } from "../lib/types";
import { chatDb } from "../lib/db";
import { llmService } from "./llm";

/**
 * System prompt for repository chat
 * @param context - Repository context
 * @param explanation - AI explanation of the repository
 */
function buildSystemPrompt(context: RepoContext, explanation: string): string {
  return `You are RepoLens, an AI assistant specialized in analyzing GitHub repositories. You have access to detailed information about the repository ${context.metadata.fullName}.

Repository Overview:
${explanation.slice(0, 1500)}

Key Files:
${context.importantFiles.slice(0, 5).map((f) => `- ${f.path}`).join("\n")}

Tech Stack:
- Primary Language: ${context.metadata.language || "Unknown"}
- Stars: ${context.metadata.stars}
- License: ${context.metadata.license || "N/A"}

Instructions:
1. Answer questions about the codebase accurately and concisely
2. Reference specific files when relevant
3. Explain technical concepts clearly
4. If unsure, acknowledge limitations
5. Provide code examples when helpful
6. Maintain context from previous messages

You are helpful, knowledgeable, and focused on helping users understand this repository.`;
}

/**
 * Format chat history for LLM context
 * @param messages - Chat messages
 */
function formatChatHistory(
  messages: ChatMessage[]
): Array<{ role: "user" | "assistant"; content: string }> {
  return messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }));
}

/**
 * Get chat history for a repository
 * @param repoId - Repository identifier (owner/repo)
 * @param limit - Maximum number of messages
 */
export function getChatHistory(repoId: string, limit: number = 20): ChatMessage[] {
  const messages = chatDb.getHistory(repoId, limit) as ChatMessage[];
  return messages;
}

/**
 * Send a message and get AI response
 * @param repoId - Repository identifier
 * @param message - User message
 * @param context - Repository context
 * @param explanation - AI explanation of the repository
 * @param provider - AI provider
 * @param model - Model name
 * @param userId - Optional user ID
 */
export async function sendMessage(
  repoId: string,
  message: string,
  context: RepoContext,
  explanation: string,
  provider: AIProvider = "gemini",
  model?: string,
  userId?: string
): Promise<{ response: string; messages: ChatMessage[] }> {
  console.log(`💬 Sending message for ${repoId}: ${message.slice(0, 50)}...`);

  // Check if provider is registered
  if (!llmService.isRegistered(provider)) {
    throw new Error(
      `Provider ${provider} not registered. Please set the API key in settings.`
    );
  }

  // Save user message
  chatDb.saveMessage(repoId, "user", message, userId);

  // Get recent chat history (last 20 messages)
  const history = getChatHistory(repoId, 20);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(context, explanation);

  // Format conversation for LLM
  const conversation = formatChatHistory(history);

  // Create prompt with context
  const fullPrompt = `System: ${systemPrompt}

Previous conversation:
${conversation.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

User: ${message}

Assistant:`;

  // Call LLM
  const llmResponse = await llmService.generateCompletion(provider, fullPrompt, {
    model,
    temperature: 0.7,
    maxTokens: 2000,
  });

  // Save AI response
  chatDb.saveMessage(repoId, "assistant", llmResponse.content, userId);

  console.log(`✅ Response received (${llmResponse.content.length} chars)`);

  // Return updated history
  const updatedHistory = getChatHistory(repoId, 20);

  return {
    response: llmResponse.content,
    messages: updatedHistory,
  };
}

/**
 * Send a message with streaming response
 * @param repoId - Repository identifier
 * @param message - User message
 * @param context - Repository context
 * @param explanation - AI explanation
 * @param provider - AI provider
 * @param model - Model name
 * @param onChunk - Callback for each chunk
 * @param userId - Optional user ID
 */
export async function sendMessageStream(
  repoId: string,
  message: string,
  context: RepoContext,
  explanation: string,
  provider: AIProvider = "gemini",
  model?: string,
  onChunk?: (chunk: string) => void,
  userId?: string
): Promise<string> {
  console.log(`💬 Streaming message for ${repoId}...`);

  // Check if provider is registered
  if (!llmService.isRegistered(provider)) {
    throw new Error(`Provider ${provider} not registered.`);
  }

  // Save user message
  chatDb.saveMessage(repoId, "user", message, userId);

  // Get recent chat history
  const history = getChatHistory(repoId, 20);

  // Build system prompt
  const systemPrompt = buildSystemPrompt(context, explanation);

  // Format conversation
  const conversation = formatChatHistory(history);

  // Create prompt
  const fullPrompt = `System: ${systemPrompt}

Previous conversation:
${conversation.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}

User: ${message}

Assistant:`;

  // For now, simulate streaming by calling regular completion
  // In production, implement actual streaming based on provider
  const llmResponse = await llmService.generateCompletion(provider, fullPrompt, {
    model,
    temperature: 0.7,
    maxTokens: 2000,
  });

  // Simulate streaming chunks
  if (onChunk) {
    const words = llmResponse.content.split(" ");
    for (const word of words) {
      onChunk(word + " ");
      // Small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  // Save AI response
  chatDb.saveMessage(repoId, "assistant", llmResponse.content, userId);

  return llmResponse.content;
}

/**
 * Clear chat history for a repository
 * @param repoId - Repository identifier
 */
export function clearChatHistory(repoId: string): void {
  console.log(`🗑️ Clearing chat history for ${repoId}`);
  chatDb.clearHistory(repoId);
}

/**
 * Get message count for a repository
 * @param repoId - Repository identifier
 */
export function getMessageCount(repoId: string): number {
  return chatDb.getMessageCount(repoId);
}

/**
 * Get all repositories with chat history for a user
 * @param userId - User identifier
 */
export function getUserChats(userId: string) {
  return chatDb.getUserChats(userId);
}

/**
 * Initialize system message for a repository
 * @param repoId - Repository identifier
 * @param context - Repository context
 * @param explanation - AI explanation
 * @param userId - Optional user ID
 */
export function initializeSystemMessage(
  repoId: string,
  context: RepoContext,
  explanation: string,
  userId?: string
): void {
  // Check if there's already a system message
  const history = getChatHistory(repoId, 1);
  if (history.length === 0) {
    const systemMessage = `Welcome! I'm your AI assistant for analyzing **${context.metadata.name}**. 

This repository ${context.metadata.description ? `"${context.metadata.description}"` : "is an open-source project"} built primarily with ${context.metadata.language || "various technologies"}.

I can help you:
- Understand the codebase structure
- Explain specific functions or components
- Identify key architectural patterns
- Suggest improvements or best practices
- Answer questions about the implementation

What would you like to know about this repository?`;

    chatDb.saveMessage(repoId, "assistant", systemMessage, userId);
  }
}
