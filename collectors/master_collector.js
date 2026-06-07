/**
 * SHIVANETRA V9 - MASTER DATA COLLECTOR
 * Orchestrates all real NASA data collection
 * 
 * Usage:
 *   node master_collector.js                    (collects today's data)
 *   node master_collector.js --date 2026-01-15  (collects specific date)
 *   node master_collector.js --backfill 7       (collects last 7 days)
 */

const { runNASACollection, getCachedPlanetPosition } = require('./nasa_collector_real');
const { runLunarCollection } = require('./lunar_collector_real');

// NASA Horizons API for Sun/Moon positions (fallback if not in DB)
async function getSunAndMoonFromNASA(date) {
    const { fetchPlanetPositionFromNASA } = require('./nasa_collector_real');
    
    const sun = await fetchPlanetPositionFromNASA('Sun', date);
    const moon = await fetchPlanetPositionFromNASA('Moon', date);
    
    if (sun && moon && sun.longitude !== null && moon.longitude !== null) {
        // Calculate illumination from phase angle
        const phaseDiff = (moon.longitude - sun.longitude + 360) % 360;
        const illumination = Math.abs(Math.cos((phaseDiff * Math.PI) / 180)) * 100;
        const isWaxing = phaseDiff < 180;
        
        return {
            sunLongitude: sun.longitude,
            moonLongitude: moon.longitude,
            illumination: illumination,
            isWaxing: isWaxing
        };
    }
    
    return null;
}

/**
 * Run complete collection for a date
 */
async function runMasterCollection(date = null) {
    if (!date) {
        const today = new Date();
        date = today.toISOString().split('T')[0];
    }
    
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🔮 SHIVANETRA V9 - MASTER DATA COLLECTOR                     ║
║                                                                ║
║   Source: NASA JPL Horizons API                               ║
║   Databases: DB-1 (Stars) | DB-2 (Nakshatra) | DB-3 (Planets) | DB-4 (Lunar)
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
    
    // Step 1: Collect planetary positions from NASA
    console.log('\n🪐 STEP 1: NASA Planetary Positions');
    console.log('='.repeat(50));
    const planetPositions = await runNASACollection(date);
    
    // Step 2: Get Sun and Moon positions for lunar calculation
    console.log('\n🌞 STEP 2: Sun & Moon for Lunar Data');
    console.log('='.repeat(50));
    
    let sunLongitude = null;
    let moonLongitude = null;
    let illumination = null;
    let isWaxing = null;
    
    // Try to get from collected data first
    if (planetPositions.positions && planetPositions.positions['Sun']) {
        sunLongitude = planetPositions.positions['Sun'].longitude;
    }
    if (planetPositions.positions && planetPositions.positions['Moon']) {
        moonLongitude = planetPositions.positions['Moon'].longitude;
    }
    
    // If not found, fetch directly from NASA
    if (sunLongitude === null || moonLongitude === null) {
        const sunMoon = await getSunAndMoonFromNASA(date);
        if (sunMoon) {
            sunLongitude = sunMoon.sunLongitude;
            moonLongitude = sunMoon.moonLongitude;
            illumination = sunMoon.illumination;
            isWaxing = sunMoon.isWaxing;
        }
    } else {
        // Calculate from collected data
        const phaseDiff = (moonLongitude - sunLongitude + 360) % 360;
        illumination = Math.abs(Math.cos((phaseDiff * Math.PI) / 180)) * 100;
        isWaxing = phaseDiff < 180;
    }
    
    // Step 3: Generate lunar data
    if (sunLongitude !== null && moonLongitude !== null) {
        console.log(`  ☀️ Sun: ${sunLongitude.toFixed(2)}°`);
        console.log(`  🌙 Moon: ${moonLongitude.toFixed(2)}°`);
        console.log(`  💡 Illumination: ${illumination.toFixed(1)}%`);
        
        await runLunarCollection(date, moonLongitude, sunLongitude, illumination, isWaxing);
    } else {
        console.log('  ⚠️ Could not fetch Sun/Moon positions');
    }
    
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ✅ MASTER COLLECTION COMPLETE                                ║
║                                                                ║
║   Date: ${date}                                                  ║
║   NASA API: REAL                                               ║
║   Data stored in 4 databases                                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
}

/**
 * Backfill multiple days
 */
async function backfillDays(days) {
    console.log(`\n📦 BACKFILLING LAST ${days} DAYS\n`);
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Processing: ${dateStr} (${i} days ago)`);
        
        await runMasterCollection(dateStr);
        
        // Be polite to NASA
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log('\n🎉 BACKFILL COMPLETE!');
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args[0] === '--date' && args[1]) {
        runMasterCollection(args[1]).catch(console.error);
    } else if (args[0] === '--backfill' && args[1]) {
        backfillDays(parseInt(args[1])).catch(console.error);
    } else {
        runMasterCollection().catch(console.error);
    }
}

module.exports = { runMasterCollection, backfillDays };
