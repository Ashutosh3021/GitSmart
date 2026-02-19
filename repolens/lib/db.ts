/**
 * Database Configuration
 * SQLite database setup for chat persistence
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'chat.db');

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Initialize database with schema
 */
export function initDatabase(): Database.Database {
  ensureDataDir();
  
  const db = new Database(DB_PATH);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  
  // Create chats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      repo_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      model TEXT,
      provider TEXT
    );
    
    CREATE INDEX IF NOT EXISTS idx_chats_repo_id ON chats(repo_id);
    CREATE INDEX IF NOT EXISTS idx_chats_timestamp ON chats(timestamp);
  `);
  
  // Create cache table for simple key-value storage
  db.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      expires_at DATETIME
    );
    
    CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);
  `);
  
  // Create settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT PRIMARY KEY,
      api_keys TEXT,
      preferred_provider TEXT DEFAULT 'gemini',
      preferred_models TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  return db;
}

/**
 * Get database instance (singleton)
 */
let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
