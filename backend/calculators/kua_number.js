/**
 * Kua Number Calculator (Ba Zhai Feng Shui)
 * Determines auspicious directions for health, wealth, relationships
 */

const { KUA_DIRECTIONS } = require('../utils/constants');
const { reduceToSingleDigit, sumDigits } = require('../utils/reducers');

class KuaNumberCalculator {
  
  /**
   * Calculate Kua number based on birth year and gender
   * @param {number} birthYear - 4-digit year (e.g., 1990)
   * @param {string} gender - 'male' or 'female'
   * @returns {object} Kua number and auspicious directions
   */
  calculate(birthYear, gender) {
    // Get last two digits of birth year
    const lastTwoDigits = birthYear % 100;
    
    // Reduce to single digit
    let reduced = reduceToSingleDigit(sumDigits(lastTwoDigits));
    
    let kua;
    
    if (gender === 'male') {
      kua = 10 - reduced;
    } else if (gender === 'female') {
      kua = 5 + reduced;
    } else {
      throw new Error('Gender must be "male" or "female"');
    }
    
    // Special case: if Kua = 5, use 8 for male, 2 for female (some schools)
    // Standard: Kua 5 belongs to both groups but directions vary
    if (kua === 5) {
      if (gender === 'male') {
        kua = 8;  // Some traditions use 8 for male Kua 5
      } else {
        kua = 2;  // Some traditions use 2 for female Kua 5
      }
    }
    
    // Normalize to 1-9 range
    while (kua > 9) kua -= 9;
    while (kua < 1) kua += 9;
    
    // Determine group (East or West)
    const eastGroup = [1, 3, 4, 9];
    const westGroup = [2, 6, 7, 8];
    
    let group = '';
    if (eastGroup.includes(kua)) group = 'East';
    else if (westGroup.includes(kua)) group = 'West';
    else group = 'Special (Kua 5)';
    
    // Get directions
    const directions = {
      success: KUA_DIRECTIONS.success[kua],
      health: KUA_DIRECTIONS.health[kua],
      romance: KUA_DIRECTIONS.romance[kua],
      personalGrowth: KUA_DIRECTIONS.personal[kua]
    };
    
    return {
      kuaNumber: kua,
      group,
      birthYear,
      gender,
      directions,
      favorableColors: this.getFavorableColors(kua),
      unfavorableDirections: this.getUnfavorableDirections(kua)
    };
  }
  
  /**
   * Get favorable colors based on Kua number
   */
  getFavorableColors(kua) {
    const colorMap = {
      1: ['Blue', 'Black', 'Green'],
      2: ['Yellow', 'Brown', 'Orange'],
      3: ['Green', 'Blue', 'Black'],
      4: ['Green', 'Blue', 'Black'],
      6: ['White', 'Gold', 'Silver'],
      7: ['White', 'Gold', 'Silver'],
      8: ['Yellow', 'Brown', 'Orange'],
      9: ['Red', 'Purple', 'Pink']
    };
    return colorMap[kua] || ['White', 'Black'];
  }
  
  /**
   * Get unfavorable directions (for awareness, not to avoid completely)
   */
  getUnfavorableDirections(kua) {
    const allDirections = ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
    const favorable = Object.values(KUA_DIRECTIONS).map(d => d[kua]);
    return allDirections.filter(d => !favorable.includes(d));
  }
}

module.exports = KuaNumberCalculator;
