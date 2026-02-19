/**
 * Chat Service
 * Manages chat history with SQLite persistence
 */

import { getDatabase } from '@/lib/db';
import { ChatMessage, RepoContext, LLMProvider, UserSettings } from '@/types';
import { initLLMClient, generateText, getApiKey, getDefaultModel } from '@/services/llm';
import Database from 'better-sqlite3';

/**
 * Maximum messages to load for context
 */
const MAX_CONTEXT_MESSAGES = 20;

/**
 * System prompt template for repo chat
 */
function buildSystemPrompt(repo: RepoContext, explanation: string): string {
  return `You are an AI assistant helping a developer understand the codebase of ${repo.owner}/${repo.repo}.

Repository Context:
- Name: ${repo.repo}
- Description: ${repo.metadata.description || 'N/A'}
- Language: ${repo.metadata.language || 'N/A'}
- Stars: ${repo.metadata.stargazers_count}

Overview: ${explanation.slice(0, 1500)}

Key Files:
${repo.importantFiles.slice(0, 5).map(f => `- ${f.path} (${f.language})`).join('\n')}

Tech Stack: ${repo.metadata.language || 'Unknown'}

Instructions:
- Answer questions about the codebase specifically
- Reference actual files and code when relevant
- Be concise but thorough
- If unsure about something, say so honestly
- Help with architecture, debugging, and understanding

You are chatting about this specific repository. Stay focused on helping the developer understand and work with this code.`;
}

/**
 * Get chat history for a repository
 */
export function getChatHistory(repoId: string, limit: number = 50): ChatMessage[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT id, repo_id, role, content, timestamp, model, provider
    FROM chats
    WHERE repo_id = ?
    ORDER BY timestamp ASC
    LIMIT ?
  `);
  
  const rows = stmt.all(repoId, limit) as any[];
  
  return rows.map(row => ({
    id: row.id,
    repo_id: row.repo_id,
    role: row.role,
    content: row.content,
    timestamp: row.timestamp,
    model: row.model,
    provider: row.provider,
  }));
}

/**
 * Get recent messages for context (last N messages)
 */
export function getRecentMessages(repoId: string, limit: number = MAX_CONTEXT_MESSAGES): ChatMessage[] {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT id, repo_id, role, content, timestamp, model, provider
    FROM chats
    WHERE repo_id = ?
    ORDER BY timestamp DESC
    LIMIT ?
  `);
  
  const rows = stmt.all(repoId, limit) as any[];
  
  // Return in chronological order
  return rows.reverse().map(row => ({
    id: row.id,
    repo_id: row.repo_id,
    role: row.role,
    content: row.content,
    timestamp: row.timestamp,
    model: row.model,
    provider: row.provider,
  }));
}

/**
 * Save a chat message
 */
export function saveMessage(
  repoId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  model?: string,
  provider?: string
): ChatMessage {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    INSERT INTO chats (repo_id, role, content, model, provider)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(repoId, role, content, model || null, provider || null);
  
  return {
    id: result.lastInsertRowid as number,
    repo_id: repoId,
    role,
    content,
    timestamp: new Date().toISOString(),
    model,
    provider,
  };
}

/**
 * Clear chat history for a repository
 */
export function clearChatHistory(repoId: string): number {
  const db = getDatabase();
  
  const stmt = db.prepare('DELETE FROM chats WHERE repo_id = ?');
  const result = stmt.run(repoId);
  
  return result.changes;
}

/**
 * Get chat statistics
 */
export function getChatStats(repoId: string): {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  lastMessageAt: string | null;
} {
  const db = getDatabase();
  
  const totalStmt = db.prepare('SELECT COUNT(*) as count FROM chats WHERE repo_id = ?');
  const userStmt = db.prepare("SELECT COUNT(*) as count FROM chats WHERE repo_id = ? AND role = 'user'");
  const assistantStmt = db.prepare("SELECT COUNT(*) as count FROM chats WHERE repo_id = ? AND role = 'assistant'");
  const lastStmt = db.prepare('SELECT timestamp FROM chats WHERE repo_id = ? ORDER BY timestamp DESC LIMIT 1');
  
  const total = (totalStmt.get(repoId) as any)?.count || 0;
  const user = (userStmt.get(repoId) as any)?.count || 0;
  const assistant = (assistantStmt.get(repoId) as any)?.count || 0;
  const last = (lastStmt.get(repoId) as any)?.timestamp || null;
  
  return {
    totalMessages: total,
    userMessages: user,
    assistantMessages: assistant,
    lastMessageAt: last,
  };
}

/**
 * Send message and get AI response
 */
export async function sendChatMessage(
  repoId: string,
  message: string,
  repo: RepoContext,
  explanation: string,
  provider: LLMProvider = 'gemini',
  userSettings?: UserSettings
): Promise<ChatMessage> {
  console.log(`Sending chat message for ${repoId}...`);
  
  // Save user message
  const userMessage = saveMessage(repoId, 'user', message);
  
  // Get API key
  const apiKey = getApiKey(provider, userSettings);
  if (!apiKey) {
    throw new Error(`No API key available for ${provider}`);
  }
  
  // Initialize LLM client
  const client = initLLMClient(provider, apiKey);
  const model = userSettings?.preferredModels?.[provider] || getDefaultModel(provider);
  
  // Build context from recent messages
  const recentMessages = getRecentMessages(repoId, MAX_CONTEXT_MESSAGES);
  const systemPrompt = buildSystemPrompt(repo, explanation);
  
  // Build conversation history for LLM
  let prompt = systemPrompt + '\n\n=== CONVERSATION HISTORY ===\n\n';
  
  for (const msg of recentMessages) {
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n\n`;
    }
  }
  
  // Add current message
  prompt += `User: ${message}\n\nAssistant:`;
  
  // Generate response
  const response = await generateText(client, prompt, model);
  
  // Save assistant message
  const assistantMessage = saveMessage(repoId, 'assistant', response, model, provider);
  
  return assistantMessage;
}

/**
 * Get all repositories with chat history
 */
export function getRepositoriesWithChats(): Array<{
  repoId: string;
  messageCount: number;
  lastAccessed: string;
}> {
  const db = getDatabase();
  
  const stmt = db.prepare(`
    SELECT 
      repo_id,
      COUNT(*) as message_count,
      MAX(timestamp) as last_accessed
    FROM chats
    GROUP BY repo_id
    ORDER BY last_accessed DESC
  `);
  
  const rows = stmt.all() as any[];
  
  return rows.map(row => ({
    repoId: row.repo_id,
    messageCount: row.message_count,
    lastAccessed: row.last_accessed,
  }));
}
