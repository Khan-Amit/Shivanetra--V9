/**
 * SHIVANETRA V9 - DB-3: PLANETS DATABASE
 * Navagraha (9 traditional planets) + Modern planets
 * Daily positions, transits, aspects, retrogrades
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure databases directory exists
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = path.join(dbDir, 'planets.db');
const db = new sqlite3.Database(dbPath);

// Initialize tables
function initPlanetsDB() {
    db.serialize(() => {
        // Planets master table (Navagraha + modern)
        db.run(`
            CREATE TABLE IF NOT EXISTS planets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                sanskrit_name TEXT,
                graha_name TEXT,
                is_navagraha BOOLEAN DEFAULT 1,
                color TEXT,
                gemstone TEXT,
                day TEXT,
                direction TEXT,
                element TEXT,
                guna TEXT,
                speed_mean REAL,
                speed_max REAL,
                speed_min REAL,
                exaltation_sign TEXT,
                exaltation_degree REAL,
                debilitation_sign TEXT,
                debilitation_degree REAL,
                mooltrikona_sign TEXT,
                own_signs TEXT,
                friendly_planets TEXT,
                neutral_planets TEXT,
                enemy_planets TEXT,
                description TEXT
            )
        `);

        // Daily planet positions
        db.run(`
            CREATE TABLE IF NOT EXISTS planet_positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                planet_id INTEGER,
                date TEXT NOT NULL,
                longitude REAL NOT NULL,
                latitude REAL,
                speed REAL,
                is_retrograde BOOLEAN DEFAULT 0,
                nakshatra TEXT,
                nakshatra_pada INTEGER,
                zodiac_sign TEXT,
                house INTEGER,
                rise_time TEXT,
                set_time TEXT,
                is_visible BOOLEAN DEFAULT 1,
                FOREIGN KEY (planet_id) REFERENCES planets(id)
            )
        `);

        // Planet aspects (Graha Drishti)
        db.run(`
            CREATE TABLE IF NOT EXISTS planet_aspects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                planet_id INTEGER,
                aspect_degree INTEGER,
                aspect_type TEXT,
                full_aspect BOOLEAN,
                description TEXT,
                FOREIGN KEY (planet_id) REFERENCES planets(id)
            )
        `);

        // Planet transits (Gochar)
        db.run(`
            CREATE TABLE IF NOT EXISTS planet_transits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                planet_id INTEGER,
                start_date TEXT,
                end_date TEXT,
                from_sign TEXT,
                to_sign TEXT,
                from_nakshatra TEXT,
                to_nakshatra TEXT,
                is_retrograde_transit BOOLEAN DEFAULT 0,
                effect TEXT,
                FOREIGN KEY (planet_id) REFERENCES planets(id)
            )
        `);

        // Planet strengths (Shadbala components)
        db.run(`
            CREATE TABLE IF NOT EXISTS planet_strengths (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                planet_id INTEGER,
                date TEXT,
                sthana_bala REAL,
                dig_bala REAL,
                kala_bala REAL,
                chesta_bala REAL,
                naisargika_bala REAL,
                total_bala REAL,
                FOREIGN KEY (planet_id) REFERENCES planets(id)
            )
        `);

        console.log('✅ DB-3: Planets database initialized');
    });
}

// Insert a planet
function insertPlanet(planetData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO planets 
            (name, sanskrit_name, graha_name, is_navagraha, color, gemstone, day, direction,
             element, guna, speed_mean, speed_max, speed_min, exaltation_sign, exaltation_degree,
             debilitation_sign, debilitation_degree, mooltrikona_sign, own_signs,
             friendly_planets, neutral_planets, enemy_planets, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            planetData.name,
            planetData.sanskrit_name || null,
            planetData.graha_name || null,
            planetData.is_navagraha !== undefined ? planetData.is_navagraha : 1,
            planetData.color || null,
            planetData.gemstone || null,
            planetData.day || null,
            planetData.direction || null,
            planetData.element || null,
            planetData.guna || null,
            planetData.speed_mean || null,
            planetData.speed_max || null,
            planetData.speed_min || null,
            planetData.exaltation_sign || null,
            planetData.exaltation_degree || null,
            planetData.debilitation_sign || null,
            planetData.debilitation_degree || null,
            planetData.mooltrikona_sign || null,
            planetData.own_signs || null,
            planetData.friendly_planets || null,
            planetData.neutral_planets || null,
            planetData.enemy_planets || null,
            planetData.description || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Insert planet position (daily)
function insertPlanetPosition(positionData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO planet_positions 
            (planet_id, date, longitude, latitude, speed, is_retrograde, 
             nakshatra, nakshatra_pada, zodiac_sign, house, rise_time, set_time, is_visible)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            positionData.planet_id,
            positionData.date,
            positionData.longitude,
            positionData.latitude || 0,
            positionData.speed || null,
            positionData.is_retrograde ? 1 : 0,
            positionData.nakshatra || null,
            positionData.nakshatra_pada || null,
            positionData.zodiac_sign || null,
            positionData.house || null,
            positionData.rise_time || null,
            positionData.set_time || null,
            positionData.is_visible !== undefined ? positionData.is_visible : 1,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Insert planet aspect
function insertPlanetAspect(aspectData) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO planet_aspects 
            (planet_id, aspect_degree, aspect_type, full_aspect, description)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            aspectData.planet_id,
            aspectData.aspect_degree,
            aspectData.aspect_type,
            aspectData.full_aspect ? 1 : 0,
            aspectData.description || null,
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
        stmt.finalize();
    });
}

// Get all planets
function getAllPlanets(callback) {
    db.all("SELECT * FROM planets ORDER BY id ASC", callback);
}

// Get planet by ID
function getPlanetById(id, callback) {
    db.get("SELECT * FROM planets WHERE id = ?", [id], callback);
}

// Get planet by name
function getPlanetByName(name, callback) {
    db.get("SELECT * FROM planets WHERE name = ? OR sanskrit_name = ?", [name, name], callback);
}

// Get Navagraha only
function getNavagraha(callback) {
    db.all("SELECT * FROM planets WHERE is_navagraha = 1 ORDER BY id ASC", callback);
}

// Get planet position for specific date
function getPlanetPosition(planetId, date, callback) {
    db.get(
        "SELECT * FROM planet_positions WHERE planet_id = ? AND date = ?",
        [planetId, date],
        callback
    );
}

// Get all planet positions for a date
function getAllPlanetPositions(date, callback) {
    db.all(
        "SELECT p.*, pp.* FROM planet_positions pp JOIN planets p ON pp.planet_id = p.id WHERE pp.date = ?",
        [date],
        callback
    );
}

// Get planet aspects
function getPlanetAspects(planetId, callback) {
    db.all("SELECT * FROM planet_aspects WHERE planet_id = ?", [planetId], callback);
}

// Seed planets data
function seedPlanets() {
    const planets = [
        {
            name: "Sun", sanskrit: "Surya", graha: "Surya", navagraha: true,
            color: "Gold/Red", gemstone: "Ruby", day: "Sunday", direction: "East",
            element: "Fire", guna: "Sattvic", speed_mean: 0.9856, speed_max: 1.05, speed_min: 0.95,
            exaltation: "Aries", exaltation_deg: 10, debilitation: "Libra", debilitation_deg: 10,
            mooltrikona: "Leo", own_signs: "Leo",
            friendly: "Moon, Mars, Jupiter", neutral: "Mercury", enemy: "Venus, Saturn",
            desc: "Soul, ego, father, authority, vitality, leadership, willpower"
        },
        {
            name: "Moon", sanskrit: "Chandra", graha: "Chandra", navagraha: true,
            color: "White/Silver", gemstone: "Pearl", day: "Monday", direction: "North-West",
            element: "Water", guna: "Sattvic", speed_mean: 13.17, speed_max: 15, speed_min: 11,
            exaltation: "Taurus", exaltation_deg: 3, debilitation: "Scorpio", debilitation_deg: 3,
            mooltrikona: null, own_signs: "Cancer",
            friendly: "Sun, Mercury", neutral: "Mars, Jupiter, Venus, Saturn", enemy: null,
            desc: "Mind, emotions, mother, intuition, nurturing, memory, mental peace"
        },
        {
            name: "Mars", sanskrit: "Mangala", graha: "Mangal", navagraha: true,
            color: "Red", gemstone: "Red Coral", day: "Tuesday", direction: "South",
            element: "Fire", guna: "Tamasic", speed_mean: 0.524, speed_max: 0.7, speed_min: 0.35,
            exaltation: "Capricorn", exaltation_deg: 28, debilitation: "Cancer", debilitation_deg: 28,
            mooltrikona: "Aries", own_signs: "Aries, Scorpio",
            friendly: "Sun, Moon, Jupiter", neutral: "Mercury, Venus, Saturn", enemy: null,
            desc: "Energy, courage, action, aggression, siblings, land, military, surgery"
        },
        {
            name: "Mercury", sanskrit: "Budha", graha: "Budh", navagraha: true,
            color: "Green", gemstone: "Emerald", day: "Wednesday", direction: "North",
            element: "Earth/Air", guna: "Rajasic", speed_mean: 1.38, speed_max: 2.2, speed_min: 0.6,
            exaltation: "Virgo", exaltation_deg: 15, debilitation: "Pisces", debilitation_deg: 15,
            mooltrikona: "Virgo", own_signs: "Gemini, Virgo",
            friendly: "Sun, Venus", neutral: "Mars, Jupiter, Saturn", enemy: "Moon",
            desc: "Intellect, communication, business, learning, humor, mathematics, astrology"
        },
        {
            name: "Jupiter", sanskrit: "Guru", graha: "Brihaspati", navagraha: true,
            color: "Yellow/Gold", gemstone: "Yellow Sapphire", day: "Thursday", direction: "North-East",
            element: "Ether", guna: "Sattvic", speed_mean: 0.083, speed_max: 0.25, speed_min: 0.05,
            exaltation: "Cancer", exaltation_deg: 5, debilitation: "Capricorn", debilitation_deg: 5,
            mooltrikona: "Sagittarius", own_signs: "Sagittarius, Pisces",
            friendly: "Sun, Moon, Mars", neutral: null, enemy: "Mercury, Venus",
            desc: "Wisdom, knowledge, spirituality, wealth, children, teachers, law, philosophy"
        },
        {
            name: "Venus", sanskrit: "Shukra", graha: "Shukra", navagraha: true,
            color: "White/Diamond", gemstone: "Diamond", day: "Friday", direction: "South-East",
            element: "Water", guna: "Rajasic", speed_mean: 0.1, speed_max: 1.25, speed_min: 0.08,
            exaltation: "Pisces", exaltation_deg: 27, debilitation: "Virgo", debilitation_deg: 27,
            mooltrikona: "Libra", own_signs: "Taurus, Libra",
            friendly: "Mercury, Saturn", neutral: "Mars, Jupiter", enemy: "Sun, Moon",
            desc: "Love, beauty, relationships, luxury, arts, marriage, vehicles, pleasure"
        },
        {
            name: "Saturn", sanskrit: "Shani", graha: "Shani", navagraha: true,
            color: "Blue/Black", gemstone: "Blue Sapphire", day: "Saturday", direction: "West",
            element: "Air", guna: "Tamasic", speed_mean: 0.033, speed_max: 0.11, speed_min: 0.02,
            exaltation: "Libra", exaltation_deg: 20, debilitation: "Aries", debilitation_deg: 20,
            mooltrikona: "Aquarius", own_signs: "Capricorn, Aquarius",
            friendly: "Mercury, Venus", neutral: "Jupiter", enemy: "Sun, Moon, Mars",
            desc: "Discipline, karma, justice, longevity, servants, delays, hard work, death"
        },
        {
            name: "Rahu", sanskrit: "Rahu", graha: "Rahu", navagraha: true,
            color: "Smoky/Black", gemstone: "Gomed", day: null, direction: "South-West",
            element: "Ether", guna: "Tamasic", speed_mean: 0.033, speed_max: null, speed_min: null,
            exaltation: "Taurus", exaltation_deg: 20, debilitation: "Scorpio", debilitation_deg: 20,
            mooltrikona: null, own_signs: null,
            friendly: "Mercury, Venus, Saturn", neutral: null, enemy: "Sun, Moon, Mars",
            desc: "North lunar node. Ambition, foreign lands, technology, illusion, materialism"
        },
        {
            name: "Ketu", sanskrit: "Ketu", graha: "Ketu", navagraha: true,
            color: "Brown/Smoky", gemstone: "Cat's Eye", day: null, direction: "South-East",
            element: "Ether", guna: "Tamasic", speed_mean: 0.033, speed_max: null, speed_min: null,
            exaltation: "Scorpio", exaltation_deg: 20, debilitation: "Taurus", debilitation_deg: 20,
            mooltrikona: null, own_signs: null,
            friendly: "Mercury, Venus, Saturn", neutral: null, enemy: "Sun, Moon, Mars",
            desc: "South lunar node. Spirituality, detachment, liberation, sudden events, past karma"
        }
    ];

    planets.forEach(async (p) => {
        await insertPlanet({
            name: p.name,
            sanskrit_name: p.sanskrit,
            graha_name: p.graha,
            is_navagraha: p.navagraha,
            color: p.color,
            gemstone: p.gemstone,
            day: p.day,
            direction: p.direction,
            element: p.element,
            guna: p.guna,
            speed_mean: p.speed_mean,
            speed_max: p.speed_max,
            speed_min: p.speed_min,
            exaltation_sign: p.exaltation,
            exaltation_degree: p.exaltation_deg,
            debilitation_sign: p.debilitation,
            debilitation_degree: p.debilitation_deg,
            mooltrikona_sign: p.mooltrikona,
            own_signs: p.own_signs,
            friendly_planets: p.friendly,
            neutral_planets: p.neutral,
            enemy_planets: p.enemy,
            description: p.desc
        });
    });
    
    console.log(`🪐 Seeded ${planets.length} planets into DB-3`);
}

// Seed planet aspects
function seedPlanetAspects() {
    const aspects = [
        { planet: "Sun", degrees: [7], type: "7th", full: true, desc: "7th house aspect - relationships" },
        { planet: "Moon", degrees: [7], type: "7th", full: true, desc: "7th house aspect - emotions in relationships" },
        { planet: "Mars", degrees: [4, 7, 8], type: "4th,7th,8th", full: true, desc: "Full aspect on 4th,7th,8th houses" },
        { planet: "Mercury", degrees: [7], type: "7th", full: true, desc: "7th house aspect - communication" },
        { planet: "Jupiter", degrees: [5, 7, 9], type: "5th,7th,9th", full: true, desc: "Full aspect on 5th,7th,9th houses" },
        { planet: "Venus", degrees: [7], type: "7th", full: true, desc: "7th house aspect - love" },
        { planet: "Saturn", degrees: [3, 7, 10], type: "3rd,7th,10th", full: true, desc: "Full aspect on 3rd,7th,10th houses" },
        { planet: "Rahu", degrees: [5, 7, 9], type: "5th,7th,9th", full: true, desc: "Similar to Jupiter's aspect" },
        { planet: "Ketu", degrees: [5, 7, 9], type: "5th,7th,9th", full: true, desc: "Similar to Jupiter's aspect" }
    ];

    aspects.forEach(async (a) => {
        const planet = await new Promise((resolve) => {
            db.get("SELECT id FROM planets WHERE name = ?", [a.planet], (err, row) => {
                resolve(row);
            });
        });
        
        if (planet) {
            a.degrees.forEach(deg => {
                insertPlanetAspect({
                    planet_id: planet.id,
                    aspect_degree: deg,
                    aspect_type: a.type,
                    full_aspect: a.full,
                    description: a.desc
                });
            });
        }
    });
    
    console.log(`👁️ Seeded planet aspects into DB-3`);
}

// Close database connection
function closePlanetsDB() {
    db.close();
}

module.exports = {
    initPlanetsDB,
    insertPlanet,
    insertPlanetPosition,
    insertPlanetAspect,
    getAllPlanets,
    getPlanetById,
    getPlanetByName,
    getNavagraha,
    getPlanetPosition,
    getAllPlanetPositions,
    getPlanetAspects,
    seedPlanets,
    seedPlanetAspects,
    closePlanetsDB,
    db
};

// Auto-initialize if run directly
if (require.main === module) {
    initPlanetsDB();
    
    setTimeout(() => {
        seedPlanets();
        setTimeout(() => {
            seedPlanetAspects();
            
            getNavagraha((err, planets) => {
                if (!err && planets) {
                    console.log(`\n📊 DB-3 Summary:`);
                    console.log(`   Total planets: ${planets.length}`);
                    console.log(`   Grahas: ${planets.map(p => p.name).join(', ')}`);
                }
            });
        }, 500);
    }, 100);
}
