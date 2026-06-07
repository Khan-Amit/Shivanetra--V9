/**
 * SHIVANETRA V9 - DB-1: PROXIMITY STARS
 * Stars within 50 light years
 * Strongest celestial influence on birth chart
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure databases directory exists
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'proximity_stars.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
function initProximityStarsDB() {
    db.serialize(() => {
        // Stars table
        db.run(`
            CREATE TABLE IF NOT EXISTS stars (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                scientific_name TEXT,
                distance_ly REAL NOT NULL,
                magnitude REAL,
                constellation TEXT,
                zodiac_longitude REAL,
                zodiac_sign TEXT,
                influence TEXT,
                element TEXT,
                quality TEXT,
                description TEXT
            )
        `);

        // Star positions (daily ephemeris)
        db.run(`
            CREATE TABLE IF NOT EXISTS star_positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                star_id INTEGER,
                date TEXT NOT NULL,
                longitude REAL NOT NULL,
                declination REAL,
                right_ascension REAL,
                rising_time TEXT,
                setting_time TEXT,
                is_visible BOOLEAN DEFAULT 1,
                FOREIGN KEY (star_id) REFERENCES stars(id)
            )
        `);

        // Star influences on birth chart
        db.run(`
            CREATE TABLE IF NOT EXISTS star_influences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                star_id INTEGER,
                planet_relation TEXT,
                effect_type TEXT,
                effect_text TEXT,
                FOREIGN KEY (star_id) REFERENCES stars(id)
            )
        `);

        console.log('✅ DB-1: Proximity Stars database initialized');
    });
}

// Insert a star
function insertStar(starData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO stars 
            (name, scientific_name, distance_ly, magnitude, constellation, 
             zodiac_longitude, zodiac_sign, influence, element, quality, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            starData.name,
            starData.scientific_name || null,
            starData.distance_ly,
            starData.magnitude || null,
            starData.constellation || null,
            starData.zodiac_longitude || null,
            starData.zodiac_sign || null,
            starData.influence || 'moderate',
            starData.element || null,
            starData.quality || null,
            starData.description || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Get all stars
function getAllStars(callback) {
    db.all("SELECT * FROM stars ORDER BY distance_ly ASC", callback);
}

// Get star by ID
function getStarById(id, callback) {
    db.get("SELECT * FROM stars WHERE id = ?", [id], callback);
}

// Get stars by constellation
function getStarsByConstellation(constellation, callback) {
    db.all("SELECT * FROM stars WHERE constellation = ?", [constellation], callback);
}

// Get stars within specific zodiac sign
function getStarsByZodiac(sign, callback) {
    db.all("SELECT * FROM stars WHERE zodiac_sign = ?", [sign], callback);
}

// Save daily star positions
function saveStarPosition(positionData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO star_positions 
            (star_id, date, longitude, declination, right_ascension, rising_time, setting_time, is_visible)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            positionData.star_id,
            positionData.date,
            positionData.longitude,
            positionData.declination || null,
            positionData.right_ascension || null,
            positionData.rising_time || null,
            positionData.setting_time || null,
            positionData.is_visible !== undefined ? positionData.is_visible : 1,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Get star position for a specific date
function getStarPosition(starId, date, callback) {
    db.get(
        "SELECT * FROM star_positions WHERE star_id = ? AND date = ?",
        [starId, date],
        callback
    );
}

// Seed initial proximity stars data
function seedProximityStars() {
    const proximityStars = [
        {
            name: "Sun",
            scientific_name: "Sol",
            distance_ly: 0.000016,  // 8 light minutes
            magnitude: -26.74,
            constellation: null,
            zodiac_longitude: null,
            zodiac_sign: null,
            influence: "supreme",
            element: "Fire",
            quality: "Royal",
            description: "The center of our solar system. Represents soul, ego, and life force."
        },
        {
            name: "Alpha Centauri A",
            scientific_name: "Rigil Kentaurus",
            distance_ly: 4.37,
            magnitude: -0.01,
            constellation: "Centaurus",
            zodiac_longitude: 210.5,
            zodiac_sign: "Scorpio",
            influence: "strong",
            element: "Fire",
            quality: "Fixed",
            description: "Closest star system. Brings transformative energy."
        },
        {
            name: "Alpha Centauri B",
            scientific_name: "Toliman",
            distance_ly: 4.37,
            magnitude: 1.33,
            constellation: "Centaurus",
            zodiac_longitude: 210.5,
            zodiac_sign: "Scorpio",
            influence: "strong",
            element: "Earth",
            quality: "Fixed",
            description: "Companion star. Brings practical wisdom."
        },
        {
            name: "Barnard's Star",
            scientific_name: null,
            distance_ly: 5.96,
            magnitude: 9.54,
            constellation: "Ophiuchus",
            zodiac_longitude: 252.0,
            zodiac_sign: "Sagittarius",
            influence: "moderate",
            element: "Air",
            quality: "Mutable",
            description: "Fast-moving star. Brings change and adaptability."
        },
        {
            name: "Sirius A",
            scientific_name: "Alpha Canis Majoris",
            distance_ly: 8.60,
            magnitude: -1.46,
            constellation: "Canis Major",
            zodiac_longitude: 103.5,
            zodiac_sign: "Cancer",
            influence: "very strong",
            element: "Water",
            quality: "Fixed",
            description: "Brightest star in night sky. Brings protection and abundance."
        },
        {
            name: "Sirius B",
            scientific_name: "The Pup",
            distance_ly: 8.60,
            magnitude: 8.44,
            constellation: "Canis Major",
            zodiac_longitude: 103.5,
            zodiac_sign: "Cancer",
            influence: "moderate",
            element: "Water",
            quality: "Fixed",
            description: "White dwarf companion. Brings hidden wisdom."
        },
        {
            name: "Procyon A",
            scientific_name: "Alpha Canis Minoris",
            distance_ly: 11.46,
            magnitude: 0.34,
            constellation: "Canis Minor",
            zodiac_longitude: 112.5,
            zodiac_sign: "Cancer",
            influence: "strong",
            element: "Air",
            quality: "Mutable",
            description: "Bringers of joy, creativity, and expression."
        },
        {
            name: "Tau Ceti",
            scientific_name: null,
            distance_ly: 11.90,
            magnitude: 3.50,
            constellation: "Cetus",
            zodiac_longitude: 27.0,
            zodiac_sign: "Aries",
            influence: "moderate",
            element: "Earth",
            quality: "Cardinal",
            description: "Sun-like star. Brings stability and harmony."
        },
        {
            name: "Epsilon Eridani",
            scientific_name: null,
            distance_ly: 10.50,
            magnitude: 3.72,
            constellation: "Eridanus",
            zodiac_longitude: 45.0,
            zodiac_sign: "Taurus",
            influence: "moderate",
            element: "Earth",
            quality: "Fixed",
            description: "Young star. Brings new beginnings and potential."
        },
        {
            name: "Wolf 359",
            scientific_name: null,
            distance_ly: 7.86,
            magnitude: 13.44,
            constellation: "Leo",
            zodiac_longitude: 165.0,
            zodiac_sign: "Virgo",
            influence: "weak",
            element: "Fire",
            quality: "Mutable",
            description: "Small red dwarf. Subtle influence on health."
        },
        {
            name: "Luyten 726-8 A",
            scientific_name: null,
            distance_ly: 8.73,
            magnitude: 12.54,
            constellation: "Cetus",
            zodiac_longitude: 22.0,
            zodiac_sign: "Aries",
            influence: "weak",
            element: "Water",
            quality: "Cardinal",
            description: "Binary system. Brings emotional depth."
        },
        {
            name: "Ross 154",
            scientific_name: null,
            distance_ly: 9.69,
            magnitude: 10.44,
            constellation: "Sagittarius",
            zodiac_longitude: 270.0,
            zodiac_sign: "Sagittarius",
            influence: "weak",
            element: "Fire",
            quality: "Mutable",
            description: "Flare star. Brings sudden inspiration."
        }
    ];

    proximityStars.forEach(async (star) => {
        await insertStar(star);
    });
    
    console.log(`🌌 Seeded ${proximityStars.length} proximity stars into DB-1`);
}

// Close database connection
function closeProximityStarsDB() {
    db.close();
}

module.exports = {
    initProximityStarsDB,
    insertStar,
    getAllStars,
    getStarById,
    getStarsByConstellation,
    getStarsByZodiac,
    saveStarPosition,
    getStarPosition,
    seedProximityStars,
    closeProximityStarsDB,
    db
};

// Auto-initialize if run directly
if (require.main === module) {
    initProximityStarsDB();
    seedProximityStars();
    
    // Test query
    setTimeout(() => {
        getAllStars((err, stars) => {
            if (!err && stars) {
                console.log(`\n📊 DB-1 Summary:`);
                console.log(`   Total stars: ${stars.length}`);
                console.log(`   Closest: ${stars[0]?.name} (${stars[0]?.distance_ly} ly)`);
                console.log(`   Brightest: ${stars.find(s => s.name === "Sirius A")?.name}`);
            }
        });
    }, 1000);
}
