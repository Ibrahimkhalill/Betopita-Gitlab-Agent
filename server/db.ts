import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'gitlab_intel.db');
export const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    full_path TEXT,
    web_url TEXT,
    last_analyzed DATETIME
  );

  CREATE TABLE IF NOT EXISTS project_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id TEXT,
    features TEXT, -- JSON
    unique_features TEXT, -- JSON
    quality_score INTEGER,
    quality_report TEXT,
    analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS global_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    summary TEXT,
    reusable_percentage REAL,
    suggested_products TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS scan_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    status TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export function getConfig(key: string): string | null {
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setConfig(key: string, value: string) {
  db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value);
}
