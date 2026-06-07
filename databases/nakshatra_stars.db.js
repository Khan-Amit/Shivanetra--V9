/**
 * SHIVANETRA V9 - DB-2: NAKSHATRA STARS
 * 27 Lunar Mansions + Distant Fixed Stars
 * Karmic, spiritual, subtle influence
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure databases directory exists
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'nakshatra_stars.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
function initNakshatraStarsDB() {
    db.serialize(() => {
        // Nakshatra table (27 lunar mansions)
        db.run(`
            CREATE TABLE IF NOT EXISTS nakshatra (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                name_sanskrit TEXT,
                start_longitude REAL NOT NULL,
                end_longitude REAL NOT NULL,
                ruling_planet TEXT,
                deity TEXT,
                symbol TEXT,
                gana TEXT,
                yoni TEXT,
                nadi TEXT,
                temperament TEXT,
                influence TEXT,
                description TEXT
            )
        `);

        // Fixed stars associated with nakshatras
        db.run(`
            CREATE TABLE IF NOT EXISTS fixed_stars (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                scientific_name TEXT,
                nakshatra_id INTEGER,
                magnitude REAL,
                distance_ly REAL,
                constellation TEXT,
                zodiac_longitude REAL,
                zodiac_sign TEXT,
                influence TEXT,
                description TEXT,
                FOREIGN KEY (nakshatra_id) REFERENCES nakshatra(id)
            )
        `);

        // Daily nakshatra positions (Moon in nakshatra)
        db.run(`
            CREATE TABLE IF NOT EXISTS daily_nakshatra (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                nakshatra_id INTEGER,
                start_time TEXT,
                end_time TEXT,
                pada INTEGER,
                moon_longitude REAL,
                FOREIGN KEY (nakshatra_id) REFERENCES nakshatra(id)
            )
        `);

        // Nakshatra influences on birth chart
        db.run(`
            CREATE TABLE IF NOT EXISTS nakshatra_influences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nakshatra_id INTEGER,
                planet_name TEXT,
                effect TEXT,
                remedial TEXT,
                FOREIGN KEY (nakshatra_id) REFERENCES nakshatra(id)
            )
        `);

        console.log('✅ DB-2: Nakshatra Stars database initialized');
    });
}

// Insert a nakshatra
function insertNakshatra(nakshatraData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO nakshatra 
            (name, name_sanskrit, start_longitude, end_longitude, ruling_planet, 
             deity, symbol, gana, yoni, nadi, temperament, influence, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            nakshatraData.name,
            nakshatraData.name_sanskrit || null,
            nakshatraData.start_longitude,
            nakshatraData.end_longitude,
            nakshatraData.ruling_planet,
            nakshatraData.deity || null,
            nakshatraData.symbol || null,
            nakshatraData.gana || null,
            nakshatraData.yoni || null,
            nakshatraData.nadi || null,
            nakshatraData.temperament || null,
            nakshatraData.influence || 'moderate',
            nakshatraData.description || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Insert a fixed star
function insertFixedStar(starData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO fixed_stars 
            (name, scientific_name, nakshatra_id, magnitude, distance_ly, 
             constellation, zodiac_longitude, zodiac_sign, influence, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            starData.name,
            starData.scientific_name || null,
            starData.nakshatra_id || null,
            starData.magnitude || null,
            starData.distance_ly || null,
            starData.constellation || null,
            starData.zodiac_longitude || null,
            starData.zodiac_sign || null,
            starData.influence || 'moderate',
            starData.description || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Get nakshatra by longitude (for Moon position)
function getNakshatraByLongitude(longitude, callback) {
    db.get(
        "SELECT * FROM nakshatra WHERE start_longitude <= ? AND end_longitude > ?",
        [longitude, longitude],
        callback
    );
}

// Get all nakshatras
function getAllNakshatras(callback) {
    db.all("SELECT * FROM nakshatra ORDER BY start_longitude ASC", callback);
}

// Get nakshatra by ID
function getNakshatraById(id, callback) {
    db.get("SELECT * FROM nakshatra WHERE id = ?", [id], callback);
}

// Get fixed stars by nakshatra
function getFixedStarsByNakshatra(nakshatraId, callback) {
    db.all("SELECT * FROM fixed_stars WHERE nakshatra_id = ?", [nakshatraId], callback);
}

// Get all fixed stars
function getAllFixedStars(callback) {
    db.all("SELECT * FROM fixed_stars ORDER BY magnitude ASC", callback);
}

// Save daily nakshatra (Moon position)
function saveDailyNakshatra(data) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO daily_nakshatra 
            (date, nakshatra_id, start_time, end_time, pada, moon_longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            data.date,
            data.nakshatra_id,
            data.start_time || null,
            data.end_time || null,
            data.pada || null,
            data.moon_longitude || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Get nakshatra for specific date
function getDailyNakshatra(date, callback) {
    db.get(
        "SELECT d.*, n.* FROM daily_nakshatra d JOIN nakshatra n ON d.nakshatra_id = n.id WHERE d.date = ?",
        [date],
        callback
    );
}

// Seed all 27 Nakshatras
function seedNakshatras() {
    const nakshatras = [
        { name: "Ashwini", sanskrit: "अश्विनी", start: 0, end: 13.2, planet: "Ketu", deity: "Ashwini Kumaras", symbol: "Horse Head", gana: "Deva", temperament: "Light", influence: "strong", desc: "Healing, speed, new beginnings" },
        { name: "Bharani", sanskrit: "भरणी", start: 13.2, end: 26.4, planet: "Venus", deity: "Yama", symbol: "Yoni", gana: "Manushya", temperament: "Medium", influence: "strong", desc: "Birth, death, transformation" },
        { name: "Krittika", sanskrit: "कृत्तिका", start: 26.4, end: 39.6, planet: "Sun", deity: "Agni", symbol: "Knife/Spear", gana: "Rakshasa", temperament: "Sharp", influence: "strong", desc: "Purification, courage, fire" },
        { name: "Rohini", sanskrit: "रोहिणी", start: 39.6, end: 52.8, planet: "Moon", deity: "Brahma/Prajaapati", symbol: "Chariot", gana: "Manushya", temperament: "Heavy", influence: "very strong", desc: "Growth, fertility, beauty" },
        { name: "Mrigashira", sanskrit: "मृगशिरा", start: 52.8, end: 66, planet: "Mars", deity: "Soma/Chandra", symbol: "Deer Head", gana: "Deva", temperament: "Mixed", influence: "moderate", desc: "Searching, curiosity, softness" },
        { name: "Ardra", sanskrit: "आर्द्रा", start: 66, end: 79.2, planet: "Rahu", deity: "Rudra/Shiva", symbol: "Teardrop", gana: "Manushya", temperament: "Sharp", influence: "strong", desc: "Tears, destruction, renewal" },
        { name: "Punarvasu", sanskrit: "पुनर्वसु", start: 79.2, end: 92.4, planet: "Jupiter", deity: "Aditi", symbol: "Quiver of Arrows", gana: "Deva", temperament: "Light", influence: "strong", desc: "Return, renewal, abundance" },
        { name: "Pushya", sanskrit: "पुष्य", start: 92.4, end: 105.6, planet: "Saturn", deity: "Brihaspati", symbol: "Cow Udder", gana: "Deva", temperament: "Heavy", influence: "very strong", desc: "Nourishment, prosperity, sacred" },
        { name: "Ashlesha", sanskrit: "आश्लेषा", start: 105.6, end: 118.8, planet: "Mercury", deity: "Sarpas", symbol: "Serpent", gana: "Rakshasa", temperament: "Sharp", influence: "moderate", desc: "Wisdom, cunning, transformation" },
        { name: "Magha", sanskrit: "मघा", start: 118.8, end: 132, planet: "Ketu", deity: "Pitrs", symbol: "Throne", gana: "Rakshasa", temperament: "Heavy", influence: "strong", desc: "Ancestors, power, legacy" },
        { name: "Purva Phalguni", sanskrit: "पूर्व फाल्गुनी", start: 132, end: 145.2, planet: "Venus", deity: "Bhaga", symbol: "Swing", gana: "Manushya", temperament: "Medium", influence: "strong", desc: "Love, pleasure, creativity" },
        { name: "Uttara Phalguni", sanskrit: "उत्तर फाल्गुनी", start: 145.2, end: 158.4, planet: "Sun", deity: "Aryaman", symbol: "Cot", gana: "Manushya", temperament: "Heavy", influence: "very strong", desc: "Marriage, partnership, dharma" },
        { name: "Hasta", sanskrit: "हस्त", start: 158.4, end: 171.6, planet: "Moon", deity: "Savitri", symbol: "Hand", gana: "Deva", temperament: "Light", influence: "strong", desc: "Skill, dexterity, manifestation" },
        { name: "Chitra", sanskrit: "चित्रा", start: 171.6, end: 184.8, planet: "Mars", deity: "Vishwakarma", symbol: "Jewel", gana: "Rakshasa", temperament: "Mixed", influence: "strong", desc: "Creativity, art, illusion" },
        { name: "Swati", sanskrit: "स्वाति", start: 184.8, end: 198, planet: "Rahu", deity: "Vayu", symbol: "Coral", gana: "Deva", temperament: "Light", influence: "moderate", desc: "Freedom, wind, independence" },
        { name: "Vishakha", sanskrit: "विशाखा", start: 198, end: 211.2, planet: "Jupiter", deity: "Indra/Agni", symbol: "Archway", gana: "Rakshasa", temperament: "Sharp", influence: "strong", desc: "Purpose, determination, goal" },
        { name: "Anuradha", sanskrit: "अनुराधा", start: 211.2, end: 224.4, planet: "Saturn", deity: "Mitra", symbol: "Lotus", gana: "Deva", temperament: "Heavy", influence: "strong", desc: "Friendship, devotion, balance" },
        { name: "Jyeshtha", sanskrit: "ज्येष्ठा", start: 224.4, end: 237.6, planet: "Mercury", deity: "Indra", symbol: "Umbrella", gana: "Rakshasa", temperament: "Sharp", influence: "moderate", desc: "Seniority, power, protection" },
        { name: "Mula", sanskrit: "मूल", start: 237.6, end: 250.8, planet: "Ketu", deity: "Nirriti", symbol: "Roots", gana: "Rakshasa", temperament: "Heavy", influence: "strong", desc: "Roots, destruction, foundation" },
        { name: "Purva Ashadha", sanskrit: "पूर्व आषाढ़ा", start: 250.8, end: 264, planet: "Venus", deity: "Apah", symbol: "Elephant Tusk", gana: "Manushya", temperament: "Medium", influence: "strong", desc: "Invigoration, purity, strength" },
        { name: "Uttara Ashadha", sanskrit: "उत्तर आषाढ़ा", start: 264, end: 277.2, planet: "Sun", deity: "Vishwadevas", symbol: "Elephant Tusk", gana: "Manushya", temperament: "Heavy", influence: "very strong", desc: "Victory, fame, global reach" },
        { name: "Shravana", sanskrit: "श्रवण", start: 277.2, end: 290.4, planet: "Moon", deity: "Vishnu", symbol: "Ear", gana: "Deva", temperament: "Heavy", influence: "strong", desc: "Listening, learning, wisdom" },
        { name: "Dhanishtha", sanskrit: "धनिष्ठा", start: 290.4, end: 303.6, planet: "Mars", deity: "Vasus", symbol: "Drum", gana: "Rakshasa", temperament: "Mixed", influence: "strong", desc: "Wealth, music, fame" },
        { name: "Shatabhisha", sanskrit: "शतभिषा", start: 303.6, end: 316.8, planet: "Rahu", deity: "Varuna", symbol: "Circle", gana: "Rakshasa", temperament: "Light", influence: "moderate", desc: "Healing, mystery, medicine" },
        { name: "Purva Bhadrapada", sanskrit: "पूर्व भाद्रपदा", start: 316.8, end: 330, planet: "Jupiter", deity: "Aja Ekapada", symbol: "Sword", gana: "Manushya", temperament: "Medium", influence: "strong", desc: "Spiritual fire, sacrifice" },
        { name: "Uttara Bhadrapada", sanskrit: "उत्तर भाद्रपदा", start: 330, end: 343.2, planet: "Saturn", deity: "Ahir Budhnya", symbol: "Serpent", gana: "Manushya", temperament: "Heavy", influence: "strong", desc: "Depth, wisdom, renunciation" },
        { name: "Revati", sanskrit: "रेवती", start: 343.2, end: 360, planet: "Mercury", deity: "Pushan", symbol: "Fish", gana: "Deva", temperament: "Light", influence: "moderate", desc: "Journey, protection, completion" }
    ];

    nakshatras.forEach(async (n, idx) => {
        await insertNakshatra({
            name: n.name,
            name_sanskrit: n.sanskrit,
            start_longitude: n.start,
            end_longitude: n.end,
            ruling_planet: n.planet,
            deity: n.deity,
            symbol: n.symbol,
            gana: n.gana,
            yoni: null,
            nadi: null,
            temperament: n.temperament,
            influence: n.influence,
            description: n.desc
        });
    });
    
    console.log(`🌙 Seeded ${nakshatras.length} Nakshatras into DB-2`);
}

// Seed fixed stars
function seedFixedStars() {
    const fixedStars = [
        { name: "Spica", scientific: "Alpha Virginis", nakshatra: "Chitra", mag: 0.98, dist: 250, constellation: "Virgo", lon: 204.0, sign: "Libra", infl: "strong", desc: "Success, wealth, artistic talent" },
        { name: "Aldebaran", scientific: "Alpha Tauri", nakshatra: "Rohini", mag: 0.85, dist: 65, constellation: "Taurus", lon: 69.5, sign: "Gemini", infl: "very strong", desc: "Warrior energy, courage, integrity" },
        { name: "Regulus", scientific: "Alpha Leonis", nakshatra: "Magha", mag: 1.35, dist: 79, constellation: "Leo", lon: 150.0, sign: "Leo", infl: "very strong", desc: "Royal power, leadership, nobility" },
        { name: "Antares", scientific: "Alpha Scorpii", nakshatra: "Jyeshtha", mag: 0.96, dist: 550, constellation: "Scorpio", lon: 250.0, sign: "Sagittarius", infl: "strong", desc: "Protection, intensity, transformation" },
        { name: "Polaris", scientific: "Alpha Ursae Minoris", nakshatra: "Uttara Bhadrapada", mag: 1.98, dist: 433, constellation: "Ursa Minor", lon: 86.0, sign: "Gemini", infl: "moderate", desc: "Guidance, steadiness, direction" },
        { name: "Vega", scientific: "Alpha Lyrae", nakshatra: "Uttara Ashadha", mag: 0.03, dist: 25, constellation: "Lyra", lon: 284.0, sign: "Capricorn", infl: "strong", desc: "Art, music, inspiration" },
        { name: "Capella", scientific: "Alpha Aurigae", nakshatra: "Brahma", mag: 0.08, dist: 42, constellation: "Auriga", lon: 81.0, sign: "Gemini", infl: "moderate", desc: "Protection, nurturing, wealth" },
        { name: "Rigel", scientific: "Beta Orionis", nakshatra: "Mrigashira", mag: 0.12, dist: 860, constellation: "Orion", lon: 78.0, sign: "Gemini", infl: "strong", desc: "Teaching, knowledge, architecture" },
        { name: "Betelgeuse", scientific: "Alpha Orionis", nakshatra: "Ardra", mag: 0.42, dist: 640, constellation: "Orion", lon: 89.0, sign: "Gemini", infl: "moderate", desc: "Luck, protection, sudden events" },
        { name: "Fomalhaut", scientific: "Alpha Piscis Austrini", nakshatra: "Purva Bhadrapada", mag: 1.16, dist: 25, constellation: "Piscis Austrinus", lon: 343.0, sign: "Pisces", infl: "strong", desc: "Spiritual gifts, solitude, genius" }
    ];

    fixedStars.forEach(async (star) => {
        // Find nakshatra ID
        const nakshatra = await new Promise((resolve) => {
            db.get("SELECT id FROM nakshatra WHERE name = ?", [star.nakshatra], (err, row) => {
                resolve(row);
            });
        });
        
        await insertFixedStar({
            name: star.name,
            scientific_name: star.scientific,
            nakshatra_id: nakshatra?.id || null,
            magnitude: star.mag,
            distance_ly: star.dist,
            constellation: star.constellation,
            zodiac_longitude: star.lon,
            zodiac_sign: star.sign,
            influence: star.infl,
            description: star.desc
        });
    });
    
    console.log(`⭐ Seeded ${fixedStars.length} fixed stars into DB-2`);
}

// Close database connection
function closeNakshatraStarsDB() {
    db.close();
}

module.exports = {
    initNakshatraStarsDB,
    insertNakshatra,
    insertFixedStar,
    getNakshatraByLongitude,
    getAllNakshatras,
    getNakshatraById,
    getFixedStarsByNakshatra,
    getAllFixedStars,
    saveDailyNakshatra,
    getDailyNakshatra,
    seedNakshatras,
    seedFixedStars,
    closeNakshatraStarsDB,
    db
};

// Auto-initialize if run directly
if (require.main === module) {
    initNakshatraStarsDB();
    
    setTimeout(() => {
        seedNakshatras();
        setTimeout(() => {
            seedFixedStars();
            
            getAllNakshatras((err, naks) => {
                if (!err && naks) {
                    console.log(`\n📊 DB-2 Summary:`);
                    console.log(`   Total Nakshatras: ${naks.length}`);
                    console.log(`   First: ${naks[0]?.name} (0°-13.2°)`);
                    console.log(`   Last: ${naks[26]?.name} (343.2°-360°)`);
                }
            });
        }, 500);
    }, 100);
}
