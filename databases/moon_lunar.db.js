/**
 * SHIVANETRA V9 - DB-4: MOON & LUNAR DATABASE
 * Lunar phases, Tithi (lunar day), Karana, Nakshatra, Yoga
 * Changes daily - most dynamic celestial body
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure databases directory exists
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'moon_lunar.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
function initMoonLunarDB() {
    db.serialize(() => {
        // Lunar phases master table
        db.run(`
            CREATE TABLE IF NOT EXISTS lunar_phases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                name_sanskrit TEXT,
                phase_type TEXT,
                duration_hours REAL,
                significance TEXT,
                deity TEXT,
                color TEXT,
                description TEXT
            )
        `);

        // Tithi (lunar day) master table (1-30)
        db.run(`
            CREATE TABLE IF NOT EXISTS tithi_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number INTEGER NOT NULL,
                name TEXT NOT NULL,
                name_sanskrit TEXT,
                paksha TEXT,
                deity TEXT,
                gana TEXT,
                auspicious_for TEXT,
                inauspicious_for TEXT,
                description TEXT
            )
        `);

        // Karana master table (half-tithi, 11 total)
        db.run(`
            CREATE TABLE IF NOT EXISTS karana_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                name_sanskrit TEXT,
                type TEXT,
                quality TEXT,
                description TEXT
            )
        `);

        // Lunar Yoga master table (27 yogas)
        db.run(`
            CREATE TABLE IF NOT EXISTS yoga_master (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                name_sanskrit TEXT,
                calculation TEXT,
                effect TEXT,
                auspicious BOOLEAN
            )
        `);

        // Daily lunar data (changes every day)
        db.run(`
            CREATE TABLE IF NOT EXISTS daily_lunar (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                moon_longitude REAL,
                moon_sign TEXT,
                nakshatra TEXT,
                nakshatra_pada INTEGER,
                tithi_number INTEGER,
                tithi_name TEXT,
                tithi_paksha TEXT,
                tithi_end_time TEXT,
                karana_name TEXT,
                karana_type TEXT,
                yoga_name TEXT,
                lunar_phase TEXT,
                moon_rise TEXT,
                moon_set TEXT,
                illumination REAL,
                is_eclipse BOOLEAN DEFAULT 0,
                special_event TEXT
            )
        `);

        // Lunar transits (Moon moving through nakshatras)
        db.run(`
            CREATE TABLE IF NOT EXISTS lunar_transits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                nakshatra TEXT,
                start_time TEXT,
                end_time TEXT,
                duration_hours REAL,
                pada INTEGER
            )
        `);

        // Moon's special positions (Amavasya, Purnima, Ekadashi, etc.)
        db.run(`
            CREATE TABLE IF NOT EXISTS special_lunar_days (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                event_name TEXT,
                event_type TEXT,
                significance TEXT,
                fasting_recommended BOOLEAN,
                ritual TEXT
            )
        `);

        console.log('✅ DB-4: Moon & Lunar database initialized');
    });
}

// Insert lunar phase
function insertLunarPhase(phaseData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO lunar_phases 
            (name, name_sanskrit, phase_type, duration_hours, significance, deity, color, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            phaseData.name,
            phaseData.name_sanskrit || null,
            phaseData.phase_type,
            phaseData.duration_hours || null,
            phaseData.significance || null,
            phaseData.deity || null,
            phaseData.color || null,
            phaseData.description || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Insert Tithi
function insertTithi(tithiData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO tithi_master 
            (number, name, name_sanskrit, paksha, deity, gana, auspicious_for, inauspicious_for, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            tithiData.number,
            tithiData.name,
            tithiData.name_sanskrit || null,
            tithiData.paksha,
            tithiData.deity || null,
            tithiData.gana || null,
            tithiData.auspicious_for || null,
            tithiData.inauspicious_for || null,
            tithiData.description || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Insert Karana
function insertKarana(karanaData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO karana_master 
            (name, name_sanskrit, type, quality, description)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            karanaData.name,
            karanaData.name_sanskrit || null,
            karanaData.type,
            karanaData.quality || null,
            karanaData.description || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Insert daily lunar data
function insertDailyLunar(data) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO daily_lunar 
            (date, moon_longitude, moon_sign, nakshatra, nakshatra_pada, 
             tithi_number, tithi_name, tithi_paksha, tithi_end_time,
             karana_name, karana_type, yoga_name, lunar_phase, 
             moon_rise, moon_set, illumination, is_eclipse, special_event)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            data.date,
            data.moon_longitude || null,
            data.moon_sign || null,
            data.nakshatra || null,
            data.nakshatra_pada || null,
            data.tithi_number || null,
            data.tithi_name || null,
            data.tithi_paksha || null,
            data.tithi_end_time || null,
            data.karana_name || null,
            data.karana_type || null,
            data.yoga_name || null,
            data.lunar_phase || null,
            data.moon_rise || null,
            data.moon_set || null,
            data.illumination || null,
            data.is_eclipse ? 1 : 0,
            data.special_event || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Get daily lunar data for a date
function getDailyLunar(date, callback) {
    db.get("SELECT * FROM daily_lunar WHERE date = ?", [date], callback);
}

// Get lunar data for date range
function getLunarRange(startDate, endDate, callback) {
    db.all(
        "SELECT * FROM daily_lunar WHERE date BETWEEN ? AND ? ORDER BY date ASC",
        [startDate, endDate],
        callback
    );
}

// Get Tithi by number
function getTithiByNumber(number, paksha, callback) {
    db.get(
        "SELECT * FROM tithi_master WHERE number = ? AND paksha = ?",
        [number, paksha],
        callback
    );
}

// Get all Tithis
function getAllTithis(callback) {
    db.all("SELECT * FROM tithi_master ORDER BY number ASC", callback);
}

// Get all Karanas
function getAllKaranas(callback) {
    db.all("SELECT * FROM karana_master", callback);
}

// Get all Lunar Phases
function getAllLunarPhases(callback) {
    db.all("SELECT * FROM lunar_phases", callback);
}

// Get special lunar days (Amavasya, Purnima, Ekadashi)
function getSpecialLunarDays(year, callback) {
    db.all(
        "SELECT * FROM special_lunar_days WHERE date LIKE ? ORDER BY date ASC",
        [`${year}%`],
        callback
    );
}

// Seed all lunar data
function seedLunarData() {
    // Seed Lunar Phases
    const phases = [
        { name: "New Moon", sanskrit: "Amavasya", type: "dark", hours: 0, sig: "New beginnings, rest, introspection", deity: "Pitrs", color: "Black", desc: "Moon not visible. End of lunar cycle." },
        { name: "Waxing Crescent", sanskrit: "Shukla Paksha Pratipada", type: "waxing", hours: 0, sig: "Growth, action, new projects", deity: "Agni", color: "Gold", desc: "First visible crescent." },
        { name: "First Quarter", sanskrit: "Shukla Paksha Saptami", type: "waxing", hours: 0, sig: "Decision, challenge, action", deity: "Indra", color: "Orange", desc: "Half illuminated." },
        { name: "Waxing Gibbous", sanskrit: "Shukla Paksha Ekadashi", type: "waxing", hours: 0, sig: "Refinement, patience", deity: "Vishnu", color: "Yellow", desc: "Almost full." },
        { name: "Full Moon", sanskrit: "Purnima", type: "full", hours: 0, sig: "Completion, celebration, manifestation", deity: "Brahma", color: "White", desc: "Fully illuminated." },
        { name: "Waning Gibbous", sanskrit: "Krishna Paksha Ekadashi", type: "waning", hours: 0, sig: "Sharing, gratitude", deity: "Shiva", color: "Silver", desc: "After full moon." },
        { name: "Last Quarter", sanskrit: "Krishna Paksha Saptami", type: "waning", hours: 0, sig: "Release, let go, forgiveness", deity: "Yama", color: "Grey", desc: "Half illuminated." },
        { name: "Waning Crescent", sanskrit: "Krishna Paksha Pratipada", type: "waning", hours: 0, sig: "Rest, dream, surrender", deity: "Varuna", color: "Blue", desc: "Before new moon." }
    ];

    phases.forEach(async (p) => {
        await insertLunarPhase({
            name: p.name,
            name_sanskrit: p.sanskrit,
            phase_type: p.type,
            duration_hours: p.hours,
            significance: p.sig,
            deity: p.deity,
            color: p.color,
            description: p.desc
        });
    });

    // Seed Tithis (30 tithis - 15 each paksha)
    const tithis_shukla = [
        { num: 1, name: "Pratipada", sanskrit: "प्रतिपदा", deity: "Agni", gana: "Deva", auspicious: "Beginnings, ventures", inauspicious: "Travel", desc: "First lunar day" },
        { num: 2, name: "Dwitiya", sanskrit: "द्वितीया", deity: "Brahma", gana: "Manushya", auspicious: "Construction, marriage", inauspicious: null, desc: "Second lunar day" },
        { num: 3, name: "Tritiya", sanskrit: "तृतीया", deity: "Gauri", gana: "Rakshasa", auspicious: "Hair cutting, buying", inauspicious: "Oil massage", desc: "Third lunar day" },
        { num: 4, name: "Chaturthi", sanskrit: "चतुर्थी", deity: "Ganesha", gana: "Rakshasa", auspicious: "Overcoming obstacles", inauspicious: "New beginnings", desc: "Fourth lunar day" },
        { num: 5, name: "Panchami", sanskrit: "पञ्चमी", deity: "Nagas", gana: "Deva", auspicious: "Medicine, education", inauspicious: null, desc: "Fifth lunar day" },
        { num: 6, name: "Shashthi", sanskrit: "षष्ठी", deity: "Kartikeya", gana: "Deva", auspicious: "Festivals, celebrations", inauspicious: "Travel", desc: "Sixth lunar day" },
        { num: 7, name: "Saptami", sanskrit: "सप्तमी", deity: "Surya", gana: "Manushya", auspicious: "New purchases, travel", inauspicious: null, desc: "Seventh lunar day" },
        { num: 8, name: "Ashtami", sanskrit: "अष्टमी", deity: "Durga", gana: "Rakshasa", auspicious: "Weapons, protection", inauspicious: "Eating out", desc: "Eighth lunar day" },
        { num: 9, name: "Navami", sanskrit: "नवमी", deity: "Durga", gana: "Deva", auspicious: "Worship, ceremonies", inauspicious: "Travel", desc: "Ninth lunar day" },
        { num: 10, name: "Dashami", sanskrit: "दशमी", deity: "Yama", gana: "Manushya", auspicious: "Victory, success", inauspicious: "Oil massage", desc: "Tenth lunar day" },
        { num: 11, name: "Ekadashi", sanskrit: "एकादशी", deity: "Vishnu", gana: "Deva", auspicious: "Fasting, spirituality", inauspicious: "Eating grains", desc: "Eleventh lunar day - most sacred" },
        { num: 12, name: "Dwadashi", sanskrit: "द्वादशी", deity: "Vishnu", gana: "Manushya", auspicious: "Charity, donations", inauspicious: null, desc: "Twelfth lunar day" },
        { num: 13, name: "Trayodashi", sanskrit: "त्रयोदशी", deity: "Kama", gana: "Rakshasa", auspicious: "Love, relationships", inauspicious: "Travel", desc: "Thirteenth lunar day" },
        { num: 14, name: "Chaturdashi", sanskrit: "चतुर्दशी", deity: "Shiva", gana: "Rakshasa", auspicious: "Tantra, occult", inauspicious: "New beginnings", desc: "Fourteenth lunar day" },
        { num: 15, name: "Purnima/Amavasya", sanskrit: "पूर्णिमा/अमावस्या", deity: "Chandra", gana: "Deva", auspicious: "Full moon: celebrations; New moon: ancestors", inauspicious: null, desc: "Full or new moon" }
    ];

    tithis_shukla.forEach(async (t) => {
        await insertTithi({
            number: t.num,
            name: t.name,
            name_sanskrit: t.sanskrit,
            paksha: "Shukla",
            deity: t.deity,
            gana: t.gana,
            auspicious_for: t.auspicious,
            inauspicious_for: t.inauspicious,
            description: t.desc
        });
        
        if (t.num !== 15) {
            await insertTithi({
                number: t.num,
                name: t.name,
                name_sanskrit: t.sanskrit,
                paksha: "Krishna",
                deity: t.deity,
                gana: t.gana,
                auspicious_for: t.auspicious,
                inauspicious_for: t.inauspicious,
                description: t.desc + " (waning)"
            });
        }
    });

    // Seed Karanas (11 half-tithis)
    const karanas = [
        { name: "Bava", sanskrit: "बव", type: "fixed", quality: "Good", desc: "First half of Pratipada" },
        { name: "Balava", sanskrit: "बालव", type: "fixed", quality: "Moderate", desc: "Second half of Pratipada" },
        { name: "Kaulava", sanskrit: "कौलव", type: "fixed", quality: "Good", desc: "First half of Dwitiya" },
        { name: "Taitila", sanskrit: "तैतिल", type: "fixed", quality: "Moderate", desc: "Second half of Dwitiya" },
        { name: "Gara", sanskrit: "गर", type: "fixed", quality: "Mixed", desc: "First half of Tritiya" },
        { name: "Vanija", sanskrit: "वणिज", type: "fixed", quality: "Good", desc: "Second half of Tritiya" },
        { name: "Vishti", sanskrit: "विष्टि", type: "fixed", quality: "Inauspicious", desc: "First half of Chaturthi - Bhadra" },
        { name: "Shakuni", sanskrit: "शकुनि", type: "movable", quality: "Mixed", desc: "Second half of Chaturthi" },
        { name: "Chatushpada", sanskrit: "चतुष्पाद", type: "movable", quality: "Good", desc: "First half of Panchami" },
        { name: "Nagava", sanskrit: "नागव", type: "movable", quality: "Moderate", desc: "Second half of Panchami" },
        { name: "Kimstughna", sanskrit: "किंस्तुघ्न", type: "movable", quality: "Mixed", desc: "First half of Shashthi" }
    ];

    karanas.forEach(async (k) => {
        await insertKarana({
            name: k.name,
            name_sanskrit: k.sanskrit,
            type: k.type,
            quality: k.quality,
            description: k.desc
        });
    });

    console.log(`🌙 Seeded lunar data into DB-4`);
    console.log(`   - ${phases.length} Lunar Phases`);
    console.log(`   - 30 Tithis (15 Shukla + 15 Krishna)`);
    console.log(`   - ${karanas.length} Karanas`);
}

// Generate daily lunar data for a given date (simplified calculation)
function generateDailyLunar(date, moonLongitude) {
    // This is a simplified calculation
    // In production, this would come from NASA API or ephemeris
    
    const moonSigns = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                       "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const nakshatras = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
                        "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
                        "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
                        "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha",
                        "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
    
    const moonSign = moonSigns[Math.floor(moonLongitude / 30)];
    const nakshatraIndex = Math.floor(moonLongitude / 13.333);
    const nakshatra = nakshatras[nakshatraIndex] || "Ashwini";
    const pada = Math.floor((moonLongitude % 13.333) / 3.333) + 1;
    
    // Tithi calculation (simplified: (moon_longitude - sun_longitude) / 12)
    const tithiNumber = Math.floor((moonLongitude % 360) / 12) + 1;
    const tithiPaksha = tithiNumber <= 15 ? "Shukla" : "Krishna";
    const tithiActual = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
    
    return {
        moon_longitude: moonLongitude,
        moon_sign: moonSign,
        nakshatra: nakshatra,
        nakshatra_pada: pada,
        tithi_number: tithiActual,
        tithi_paksha: tithiPaksha,
        illumination: Math.abs(Math.cos((moonLongitude * Math.PI) / 180)) * 100
    };
}

// Close database connection
function closeMoonLunarDB() {
    db.close();
}

module.exports = {
    initMoonLunarDB,
    insertLunarPhase,
    insertTithi,
    insertKarana,
    insertDailyLunar,
    getDailyLunar,
    getLunarRange,
    getTithiByNumber,
    getAllTithis,
    getAllKaranas,
    getAllLunarPhases,
    getSpecialLunarDays,
    seedLunarData,
    generateDailyLunar,
    closeMoonLunarDB,
    db
};

// Auto-initialize if run directly
if (require.main === module) {
    initMoonLunarDB();
    
    setTimeout(() => {
        seedLunarData();
        
        getAllTithis((err, tithis) => {
            if (!err && tithis) {
                console.log(`\n📊 DB-4 Summary:`);
                console.log(`   Total Tithis: ${tithis.length}`);
                console.log(`   Example: ${tithis[0]?.name} (${tithis[0]?.paksha})`);
            }
        });
        
        getAllKaranas((err, karanas) => {
            if (!err && karanas) {
                console.log(`   Total Karanas: ${karanas.length}`);
            }
        });
        
        getAllLunarPhases((err, phases) => {
            if (!err && phases) {
                console.log(`   Total Lunar Phases: ${phases.length}`);
            }
        });
    }, 100);
}
