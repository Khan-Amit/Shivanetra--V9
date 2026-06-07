const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'shivanetra.db');
const db = new sqlite3.Database(dbPath);

function initDB() {
    db.run(`
        CREATE TABLE IF NOT EXISTS calculations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            day INTEGER,
            month INTEGER,
            year INTEGER,
            gender TEXT,
            location TEXT,
            ruling_number INTEGER,
            kua_number INTEGER,
            kabbalah_number INTEGER,
            nakshatra TEXT,
            missing_numbers TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Database initialized');
}

function saveCalculation(data) {
    const stmt = db.prepare(`
        INSERT INTO calculations (name, day, month, year, gender, location, ruling_number, kua_number, kabbalah_number, nakshatra, missing_numbers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
        data.name, data.day, data.month, data.year, data.gender, data.location,
        data.rulingNumber, data.kuaNumber, data.kabbalahNumber, data.nakshatra, data.missingNumbers
    );
    stmt.finalize();
    console.log(`💾 Saved calculation for ${data.name}`);
}

function getHistory(callback) {
    db.all("SELECT * FROM calculations ORDER BY timestamp DESC LIMIT 50", callback);
}

module.exports = { initDB, saveCalculation, getHistory, db };
