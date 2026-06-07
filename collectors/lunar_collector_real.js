/**
 * SHIVANETRA V9 - REAL LUNAR COLLECTOR
 * Calculates Tithi, Nakshatra, Moon phase from NASA Moon position
 */

const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'moon_lunar.db');
const db = new sqlite3.Database(dbPath);

// Nakshatra mapping (27 lunar mansions)
const NAKSHATRAS = [
    { name: "Ashwini", start: 0, end: 13.2, ruler: "Ketu" },
    { name: "Bharani", start: 13.2, end: 26.4, ruler: "Venus" },
    { name: "Krittika", start: 26.4, end: 39.6, ruler: "Sun" },
    { name: "Rohini", start: 39.6, end: 52.8, ruler: "Moon" },
    { name: "Mrigashira", start: 52.8, end: 66, ruler: "Mars" },
    { name: "Ardra", start: 66, end: 79.2, ruler: "Rahu" },
    { name: "Punarvasu", start: 79.2, end: 92.4, ruler: "Jupiter" },
    { name: "Pushya", start: 92.4, end: 105.6, ruler: "Saturn" },
    { name: "Ashlesha", start: 105.6, end: 118.8, ruler: "Mercury" },
    { name: "Magha", start: 118.8, end: 132, ruler: "Ketu" },
    { name: "Purva Phalguni", start: 132, end: 145.2, ruler: "Venus" },
    { name: "Uttara Phalguni", start: 145.2, end: 158.4, ruler: "Sun" },
    { name: "Hasta", start: 158.4, end: 171.6, ruler: "Moon" },
    { name: "Chitra", start: 171.6, end: 184.8, ruler: "Mars" },
    { name: "Swati", start: 184.8, end: 198, ruler: "Rahu" },
    { name: "Vishakha", start: 198, end: 211.2, ruler: "Jupiter" },
    { name: "Anuradha", start: 211.2, end: 224.4, ruler: "Saturn" },
    { name: "Jyeshtha", start: 224.4, end: 237.6, ruler: "Mercury" },
    { name: "Mula", start: 237.6, end: 250.8, ruler: "Ketu" },
    { name: "Purva Ashadha", start: 250.8, end: 264, ruler: "Venus" },
    { name: "Uttara Ashadha", start: 264, end: 277.2, ruler: "Sun" },
    { name: "Shravana", start: 277.2, end: 290.4, ruler: "Moon" },
    { name: "Dhanishtha", start: 290.4, end: 303.6, ruler: "Mars" },
    { name: "Shatabhisha", start: 303.6, end: 316.8, ruler: "Rahu" },
    { name: "Purva Bhadrapada", start: 316.8, end: 330, ruler: "Jupiter" },
    { name: "Uttara Bhadrapada", start: 330, end: 343.2, ruler: "Saturn" },
    { name: "Revati", start: 343.2, end: 360, ruler: "Mercury" }
];

// Tithi names (30 lunar days)
const TITHI_NAMES = [
    'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
    'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
    'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya'
];

/**
 * Get Nakshatra from Moon longitude
 */
function getNakshatra(moonLongitude) {
    for (const n of NAKSHATRAS) {
        if (moonLongitude >= n.start && moonLongitude < n.end) {
            const pada = Math.floor((moonLongitude - n.start) / 3.333) + 1;
            return { ...n, pada, pada_start: n.start + (pada - 1) * 3.333 };
        }
    }
    return NAKSHATRAS[0];
}

/**
 * Calculate Tithi (lunar day) from Moon and Sun longitude
 */
function calculateTithi(moonLongitude, sunLongitude) {
    let diff = moonLongitude - sunLongitude;
    if (diff < 0) diff += 360;
    
    const tithiNumber = Math.floor(diff / 12) + 1;
    const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
    const tithiIndex = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
    
    return {
        number: tithiNumber,
        index: tithiIndex,
        name: TITHI_NAMES[tithiIndex - 1],
        paksha: paksha,
        diff_degrees: diff
    };
}

/**
 * Calculate Moon phase from illumination
 */
function getMoonPhase(illumination, isWaxing) {
    if (illumination < 2) return 'New Moon (Amavasya)';
    if (illumination < 48) return isWaxing ? 'Waxing Crescent' : 'Waning Crescent';
    if (illumination < 52) return isWaxing ? 'First Quarter' : 'Last Quarter';
    if (illumination < 98) return isWaxing ? 'Waxing Gibbous' : 'Waning Gibbous';
    return 'Full Moon (Purnima)';
}

/**
 * Generate complete lunar data from NASA positions
 */
function generateLunarData(date, moonLongitude, sunLongitude, illumination, isWaxing) {
    const nakshatra = getNakshatra(moonLongitude);
    const tithi = calculateTithi(moonLongitude, sunLongitude);
    const moonPhase = getMoonPhase(illumination, isWaxing);
    
    const moonSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const moonSign = moonSigns[Math.floor(moonLongitude / 30)];
    
    return {
        date: date,
        moon_longitude: moonLongitude,
        moon_sign: moonSign,
        nakshatra: nakshatra.name,
        nakshatra_ruler: nakshatra.ruler,
        nakshatra_pada: nakshatra.pada,
        tithi_number: tithi.index,
        tithi_name: tithi.name,
        tithi_paksha: tithi.paksha,
        lunar_phase: moonPhase,
        illumination: illumination
    };
}

/**
 * Save lunar data to DB-4
 */
function saveLunarDataToDB(data) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO daily_lunar 
            (date, moon_longitude, moon_sign, nakshatra, nakshatra_pada,
             tithi_number, tithi_name, tithi_paksha, lunar_phase, illumination)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            data.date,
            data.moon_longitude,
            data.moon_sign,
            data.nakshatra,
            data.nakshatra_pada,
            data.tithi_number,
            data.tithi_name,
            data.tithi_paksha,
            data.lunar_phase,
            data.illumination,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

/**
 * Run lunar collection from NASA Moon position
 */
async function runLunarCollection(date, moonLongitude, sunLongitude, illumination, isWaxing) {
    console.log(`\n🌙 GENERATING LUNAR DATA`);
    console.log(`   Date: ${date}`);
    console.log(`   Moon Longitude: ${moonLongitude.toFixed(2)}°`);
    console.log(`   Sun Longitude: ${sunLongitude.toFixed(2)}°`);
    console.log('─'.repeat(40));
    
    const lunarData = generateLunarData(date, moonLongitude, sunLongitude, illumination, isWaxing);
    
    await saveLunarDataToDB(lunarData);
    
    console.log(`  ✅ Moon in: ${lunarData.moon_sign}`);
    console.log(`  ✅ Nakshatra: ${lunarData.nakshatra} (Pada ${lunarData.nakshatra_pada})`);
    console.log(`  ✅ Ruler: ${lunarData.nakshatra_ruler}`);
    console.log(`  ✅ Tithi: ${lunarData.tithi_name} (${lunarData.tithi_paksha})`);
    console.log(`  ✅ Phase: ${lunarData.lunar_phase} (${lunarData.illumination.toFixed(1)}%)`);
    
    return lunarData;
}

module.exports = {
    getNakshatra,
    calculateTithi,
    getMoonPhase,
    generateLunarData,
    saveLunarDataToDB,
    runLunarCollection,
    NAKSHATRAS
};
