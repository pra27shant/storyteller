const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'storyteller.sqlite');

if (dbPath !== ':memory:') {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initialize() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      genre TEXT,
      description TEXT,
      content TEXT,
      duration INTEGER,
      cover_image TEXT,
      audio_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      favorite_genres TEXT DEFAULT '[]',
      preferred_narrator TEXT,
      audio_speed REAL DEFAULT 1.0,
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id)
    );

    CREATE TABLE IF NOT EXISTS listening_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      story_id TEXT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
      progress INTEGER DEFAULT 0,
      completed BOOLEAN DEFAULT 0,
      listened_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

initialize();

module.exports = db;
