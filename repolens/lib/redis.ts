/**
 * Redis Cache Configuration
 * Upstash Redis client for caching analyzed repos
 */

import { Redis } from '@upstash/redis';
import { CacheEntry } from '@/types';

/**
 * Cache TTL in seconds (24 hours)
 */
export const CACHE_TTL = 24 * 60 * 60; // 24 hours

/**
 * Initialize Redis client
 */
function initRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('Redis not configured - caching disabled');
    return null;
  }
  
  return new Redis({
    url,
    token,
  });
}

/**
 * Redis client instance (singleton)
 */
let redisInstance: Redis | null = null;

export function getRedis(): Redis | null {
  if (!redisInstance) {
    redisInstance = initRedis();
  }
  return redisInstance;
}

/**
 * Generate cache key for repository
 */
export function getRepoCacheKey(owner: string, repo: string): string {
  return `repo:${owner}:${repo}`;
}

/**
 * Generate cache key for analysis
 */
export function getAnalysisCacheKey(owner: string, repo: string, provider?: string): string {
  return `analysis:${owner}:${repo}:${provider || 'default'}`;
}

/**
 * Set cache entry with TTL
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number = CACHE_TTL
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + (ttl * 1000),
  };
  
  await redis.set(key, JSON.stringify(entry), { ex: ttl });
}

/**
 * Get cache entry
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  
  const result = await redis.get<string>(key);
  if (!result) return null;
  
  try {
    const entry: CacheEntry<T> = JSON.parse(result);
    
    // Check if expired
    if (entry.expiresAt < Date.now()) {
      await redis.del(key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Delete cache entry
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  await redis.del(key);
}

/**
 * Clear all cache (use with caution)
 */
export async function clearCache(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  await redis.flushall();
}
