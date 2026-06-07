/**
 * Kabbalah Numerology Calculator
 * Based on name (not birth date)
 * Converts name to mystical number using Hebrew mapping
 */

const { KABBALAH_MAP } = require('../utils/constants');
const { reduceToSingleDigit, sumDigits } = require('../utils/reducers');

class KabbalahCalculator {
  
  /**
   * Calculate Kabbalah number from full name
   * @param {string} fullName - Full birth name (first, middle, last)
   * @returns {object} Kabbalah number and interpretation
   */
  calculate(fullName) {
    // Clean name: uppercase, remove special characters
    const cleanName = fullName.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (cleanName.length === 0) {
      throw new Error('Name must contain at least one letter');
    }
    
    // Map each letter to its Kabbalah number
    const letterValues = [];
    let unknownLetters = [];
    
    for (let char of cleanName) {
      if (KABBALAH_MAP[char]) {
        letterValues.push(KABBALAH_MAP[char]);
      } else {
        unknownLetters.push(char);
      }
    }
    
    // Calculate total sum
    let totalSum = letterValues.reduce((a, b) => a + b, 0);
    
    // Traditional Kabbalah method: divide by 9, remainder + 1
    // Wait — you said: sum, divide by 9, remainder, then add 1? Let me check.
    // Actually classical Kabbalah: sum → reduce to 1-9 via digit sum
    // But your description says: divide by 9, remainder, then +1.
    // Let me implement BOTH and document.
    
    const remainderMethod = (totalSum % 9) + 1;
    const reducedMethod = reduceToSingleDigit(totalSum);
    
    // The authentic Kabbalah method is remainder method
    const kabbalahNumber = remainderMethod;
    
    // Get interpretation
    const interpretation = this.getInterpretation(kabbalahNumber);
    
    return {
      originalName: fullName,
      cleanName,
      letterCount: cleanName.length,
      letterValues,
      totalSum,
      kabbalahNumber,
      reducedDigit: reducedMethod, // for comparison
      interpretation,
      unknownLetters: unknownLetters.length > 0 ? unknownLetters : null
    };
  }
  
  /**
   * Kabbalah number meanings (1-9)
   */
  getInterpretation(number) {
    const meanings = {
      1: 'Leadership, independence, creation. You are a pioneer.',
      2: 'Diplomacy, cooperation, sensitivity. You are a peacemaker.',
      3: 'Creativity, expression, joy. You are an artist.',
      4: 'Stability, order, hard work. You are a builder.',
      5: 'Freedom, adventure, change. You are a seeker.',
      6: 'Responsibility, love, service. You are a caretaker.',
      7: 'Analysis, wisdom, spirituality. You are a thinker.',
      8: 'Power, ambition, material success. You are a leader.',
      9: 'Compassion, generosity, completion. You are a healer.'
    };
    return meanings[number] || 'A unique vibration of cosmic energy.';
  }
  
  /**
   * Calculate from name only (no birth date needed for Kabbalah)
   * This method confirms Kabbalah uses ONLY name, per tradition
   */
  static isKabbalahNameBased() {
    return true;
  }
}

module.exports = KabbalahCalculator;
