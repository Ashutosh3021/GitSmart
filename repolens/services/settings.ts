/**
 * Settings Service
 * Manages user settings and API key storage
 */

import { getDatabase } from '@/lib/db';
import { UserSettings, LLMProvider } from '@/types';
import { validateApiKey } from '@/services/llm';

/**
 * Get user settings
 */
export function getUserSettings(userId: string = 'default'): UserSettings | null {
  const db = getDatabase();
  
  const stmt = db.prepare('SELECT * FROM settings WHERE user_id = ?');
  const row = stmt.get(userId) as any;
  
  if (!row) {
    return null;
  }
  
  return {
    apiKeys: row.api_keys ? JSON.parse(row.api_keys) : {},
    preferredProvider: row.preferred_provider || 'gemini',
    preferredModels: row.preferred_models ? JSON.parse(row.preferred_models) : {
      gemini: 'gemini-1.5-flash',
      openai: 'gpt-4o-mini',
      anthropic: 'claude-3-5-sonnet-20241022',
      groq: 'llama-3.1-70b-versatile',
    },
  };
}

/**
 * Save user settings
 */
export function saveUserSettings(
  userId: string = 'default',
  settings: Partial<UserSettings>
): UserSettings {
  const db = getDatabase();
  
  const existing = getUserSettings(userId);
  
  const merged: UserSettings = {
    apiKeys: { ...existing?.apiKeys, ...settings.apiKeys },
    preferredProvider: settings.preferredProvider || existing?.preferredProvider || 'gemini',
    preferredModels: { ...existing?.preferredModels, ...settings.preferredModels },
  };
  
  const stmt = db.prepare(`
    INSERT INTO settings (user_id, api_keys, preferred_provider, preferred_models, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      api_keys = excluded.api_keys,
      preferred_provider = excluded.preferred_provider,
      preferred_models = excluded.preferred_models,
      updated_at = CURRENT_TIMESTAMP
  `);
  
  stmt.run(
    userId,
    JSON.stringify(merged.apiKeys),
    merged.preferredProvider,
    JSON.stringify(merged.preferredModels)
  );
  
  return merged;
}

/**
 * Save API keys with validation
 */
export async function saveApiKeys(
  keys: Partial<UserSettings['apiKeys']>,
  userId: string = 'default'
): Promise<{
  success: boolean;
  validKeys: Record<string, boolean>;
  error?: string;
}> {
  const validKeys: Record<string, boolean> = {};
  const validatedKeys: Partial<UserSettings['apiKeys']> = {};
  
  // Validate each key
  for (const [provider, key] of Object.entries(keys)) {
    if (!key) continue;
    
    const isValid = await validateApiKey(provider as LLMProvider, key);
    validKeys[provider] = isValid;
    
    if (isValid) {
      validatedKeys[provider as LLMProvider] = key;
    }
  }
  
  // Save valid keys
  if (Object.keys(validatedKeys).length > 0) {
    saveUserSettings(userId, { apiKeys: validatedKeys });
  }
  
  return {
    success: Object.values(validKeys).some(v => v),
    validKeys,
  };
}

/**
 * Update preferred provider
 */
export function setPreferredProvider(
  provider: LLMProvider,
  userId: string = 'default'
): UserSettings {
  return saveUserSettings(userId, { preferredProvider: provider });
}

/**
 * Update preferred model for a provider
 */
export function setPreferredModel(
  provider: LLMProvider,
  model: string,
  userId: string = 'default'
): UserSettings {
  const existing = getUserSettings(userId);
  
  const preferredModels = {
    ...existing?.preferredModels,
    [provider]: model,
  };
  
  return saveUserSettings(userId, { preferredModels });
}

/**
 * Delete API key
 */
export function deleteApiKey(
  provider: LLMProvider,
  userId: string = 'default'
): UserSettings {
  const existing = getUserSettings(userId);
  
  if (existing?.apiKeys) {
    const { [provider]: _, ...remainingKeys } = existing.apiKeys;
    return saveUserSettings(userId, { apiKeys: remainingKeys });
  }
  
  return existing || {
    apiKeys: {},
    preferredProvider: 'gemini',
    preferredModels: {
      gemini: 'gemini-1.5-flash',
      openai: 'gpt-4o-mini',
      anthropic: 'claude-3-5-sonnet-20241022',
      groq: 'llama-3.1-70b-versatile',
    },
  };
}

/**
 * Get default settings
 */
export function getDefaultSettings(): UserSettings {
  return {
    apiKeys: {
      gemini: process.env.GEMINI_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      groq: process.env.GROQ_API_KEY,
    },
    preferredProvider: 'gemini',
    preferredModels: {
      gemini: 'gemini-1.5-flash',
      openai: 'gpt-4o-mini',
      anthropic: 'claude-3-5-sonnet-20241022',
      groq: 'llama-3.1-70b-versatile',
    },
  };
}

/**
 * Merge settings with defaults
 */
export function getMergedSettings(userId: string = 'default'): UserSettings {
  const userSettings = getUserSettings(userId);
  const defaults = getDefaultSettings();
  
  return {
    apiKeys: {
      ...defaults.apiKeys,
      ...userSettings?.apiKeys,
    },
    preferredProvider: userSettings?.preferredProvider || defaults.preferredProvider,
    preferredModels: {
      ...defaults.preferredModels,
      ...userSettings?.preferredModels,
    },
  };
}
