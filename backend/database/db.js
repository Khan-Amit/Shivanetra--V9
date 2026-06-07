const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'shivanetra_v9.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      day INTEGER,
      month INTEGER,
      year INTEGER,
      gender TEXT,
      ruling_number INTEGER,
      kua_number INTEGER,
      kua_group TEXT,
      kabbalah_number INTEGER,
      missing_numbers TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS ai_patterns (
      key TEXT PRIMARY KEY,
      value TEXT,
      frequency INTEGER DEFAULT 1,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS api_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      endpoint TEXT,
      params TEXT,
      response TEXT,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function saveQuery(name, day, month, year, gender, loShu, kua, kabbalah) {
  const stmt = db.prepare(`
    INSERT INTO users (name, day, month, year, gender, ruling_number, kua_number, kua_group, kabbalah_number, missing_numbers)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(name, day, month, year, gender, loShu.rulingNumber, kua.kua, kua.group, kabbalah.kabbalahNumber, JSON.stringify(loShu.missingNumbers));
  stmt.finalize();
}

function updateAIPattern(key, value) {
  db.run(`
    INSERT INTO ai_patterns (key, value, frequency) 
    VALUES (?, ?, 1)
    ON CONFLICT(key) DO UPDATE SET 
      frequency = frequency + 1,
      last_updated = CURRENT_TIMESTAMP
  `, [key, value]);
}

function getAIInsights(callback) {
  db.all("SELECT key, value, frequency FROM ai_patterns ORDER BY frequency DESC LIMIT 20", callback);
}

module.exports = { db, saveQuery, updateAIPattern, getAIInsights };
