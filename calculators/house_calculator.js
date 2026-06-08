/**
 * SHIVANETRA V9 - HOUSE CALCULATOR (Bhavat Bhavam)
 * Calculates hierarchical house relationships
 * 
 * Example: Your sister's dog = 5th from 11th = 3rd house
 *          Your dog's health = 6th from 5th = 10th house
 */

/**
 * Calculate house offset (Bhavat Bhavam)
 * @param {number} baseHouse - Starting house (1-12)
 * @param {number} offset - How many houses to move (1-12)
 * @returns {number} Resulting house (1-12)
 */
function getHouseFromHouse(baseHouse, offset) {
    // Convert to 0-11 for math
    let result = (baseHouse - 1 + offset - 1) % 12;
    // Convert back to 1-12
    return result + 1;
}

/**
 * Get all relationships mapped to houses
 * Based on standard Vedic astrology house meanings
 */
const HOUSE_RELATIONSHIPS = {
    1: { name: "Lagna/Ascendant", relations: "Self, body, personality, health" },
    2: { name: "Dhana", relations: "Wealth, family, speech, right eye" },
    3: { name: "Sahaja", relations: "Siblings, courage, communication, left ear" },
    4: { name: "Sukha", relations: "Mother, home, happiness, vehicles, land" },
    5: { name: "Putra", relations: "Children, creativity, intelligence, romance" },
    6: { name: "Roga", relations: "Health, enemies, debts, maternal uncle" },
    7: { name: "Yuvati", relations: "Spouse, partnerships, business, marriage" },
    8: { name: "Ayur", relations: "Longevity, inheritance, occult, transformation" },
    9: { name: "Dharma", relations: "Father, guru, luck, spirituality, travel" },
    10: { name: "Karma", relations: "Career, status, government, father's wealth" },
    11: { name: "Labha", relations: "Gains, income, elder siblings, desires" },
    12: { name: "Vyaya", relations: "Loss, expenses, sleep, liberation, foreign lands" }
};

/**
 * Map relationship to house
 * @param {string} relation - e.g., "sister", "dog", "health"
 * @param {number} fromHouse - Starting house (default 1 = self)
 * @returns {object} { house, calculation, meaning }
 */
function findHouseForRelation(relation, fromHouse = 1) {
    const relationMap = {
        // Self and body
        "self": 1, "body": 1, "health": 1, "personality": 1,
        // Family
        "mother": 4, "father": 9, "spouse": 7, "wife": 7, "husband": 7,
        "elder sibling": 11, "elder brother": 11, "elder sister": 11,
        "younger sibling": 3, "younger brother": 3, "younger sister": 3,
        "children": 5, "son": 5, "daughter": 5,
        // Relationships
        "partner": 7, "business partner": 7,
        "friend": 11, "enemy": 6,
        // Pets and possessions
        "dog": 5, "cat": 5, "pet": 5, "vehicle": 4, "house": 4,
        // Health
        "sickness": 6, "disease": 6, "injury": 6,
        // Career
        "career": 10, "job": 10, "work": 10,
        "wealth": 2, "money": 2, "income": 11,
        // Spiritual
        "guru": 9, "teacher": 9, "luck": 9
    };
    
    let baseHouse = relationMap[relation.toLowerCase()];
    if (!baseHouse) return { house: null, calculation: null, meaning: null };
    
    const resultHouse = getHouseFromHouse(fromHouse, baseHouse);
    
    return {
        house: resultHouse,
        calculation: `${baseHouse}th house from ${fromHouse} = ${resultHouse}th house`,
        meaning: HOUSE_RELATIONSHIPS[resultHouse]?.relations || "Unknown"
    };
}

/**
 * Calculate hierarchical chain
 * Example: "sister" then "dog" then "health"
 * @param {array} chain - e.g., ["self", "sister", "dog", "health"]
 * @returns {number} Final house
 */
function calculateChain(chain) {
    let currentHouse = 1; // Start from self
    
    for (let relation of chain) {
        const relationHouse = findHouseForRelation(relation, currentHouse);
        if (relationHouse.house) {
            currentHouse = relationHouse.house;
            console.log(`  ${relation} → ${currentHouse}th house`);
        } else {
            console.log(`  ⚠️ Unknown relation: ${relation}`);
        }
    }
    
    return currentHouse;
}

/**
 * Get lord of a house (based on ascending sign)
 * @param {number} house - 1-12
 * @param {string} ascendantSign - Aries, Taurus, etc.
 * @returns {string} Planet ruling that house
 */
function getHouseLord(house, ascendantSign) {
    const signRulers = {
        "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury",
        "Cancer": "Moon", "Leo": "Sun", "Virgo": "Mercury",
        "Libra": "Venus", "Scorpio": "Mars", "Sagittarius": "Jupiter",
        "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    };
    
    const zodiacOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
                         "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    
    const ascIndex = zodiacOrder.indexOf(ascendantSign);
    const houseIndex = (ascIndex + house - 1) % 12;
    const houseSign = zodiacOrder[houseIndex];
    
    return signRulers[houseSign];
}

/**
 * Get all 12 house lords for a given ascendant
 */
function getAllHouseLords(ascendantSign) {
    const lords = {};
    for (let house = 1; house <= 12; house++) {
        lords[house] = getHouseLord(house, ascendantSign);
    }
    return lords;
}

module.exports = {
    getHouseFromHouse,
    findHouseForRelation,
    calculateChain,
    getHouseLord,
    getAllHouseLords,
    HOUSE_RELATIONSHIPS
};

// Test if run directly
if (require.main === module) {
    console.log("🔮 SHIVANETRA - HOUSE CALCULATOR TEST\n");
    
    console.log("📌 Bhavat Bhavam Examples:");
    console.log(`  Your older sister: 11th from 1st = ${getHouseFromHouse(1, 11)}th house`);
    console.log(`  Sister's dog: 5th from 11th = ${getHouseFromHouse(11, 5)}th house`);
    console.log(`  Dog's health: 6th from 5th = ${getHouseFromHouse(5, 6)}th house`);
    
    console.log("\n📌 Chain Calculation:");
    console.log("  Self → Sister → Dog → Health");
    calculateChain(["self", "sister", "dog", "health"]);
    
    console.log("\n📌 House Lords (Ascendant = Gemini):");
    const lords = getAllHouseLords("Gemini");
    for (let h = 1; h <= 12; h++) {
        console.log(`  House ${h}: ${lords[h]}`);
    }
}
