/**
 * Lo Shu Grid Calculator
 * Maps birth date digits to 3x3 magic square
 */

const { LO_SHU_POSITIONS, NUMBER_MEANINGS } = require('../utils/constants');
const { extractDateDigits, reduceToSingleDigit } = require('../utils/reducers');

class LoShuGridCalculator {
  
  /**
   * Calculate full Lo Shu Grid from birth date
   * @param {string} birthDate - YYYY-MM-DD format
   * @returns {object} Grid data including ruling number, grid matrix, missing numbers
   */
  calculate(birthDate) {
    const digits = extractDateDigits(birthDate);
    const rulingNumber = this.getRulingNumber(digits);
    const grid = this.buildGrid(digits);
    const missingNumbers = this.findMissingNumbers(grid);
    const strengths = this.analyzeStrengths(grid);
    
    return {
      birthDate,
      digits,
      rulingNumber,
      grid,
      missingNumbers,
      strengths,
      interpretations: this.getInterpretations(grid, missingNumbers, rulingNumber)
    };
  }
  
  /**
   * Add all digits and reduce to single digit
   */
  getRulingNumber(digits) {
    const sum = digits.reduce((a, b) => a + b, 0);
    return reduceToSingleDigit(sum);
  }
  
  /**
   * Build 3x3 grid with counts of each number
   */
  buildGrid(digits) {
    const grid = {
      '1': 0, '2': 0, '3': 0,
      '4': 0, '5': 0, '6': 0,
      '7': 0, '8': 0, '9': 0
    };
    
    digits.forEach(digit => {
      if (digit >= 1 && digit <= 9) {
        grid[digit]++;
      } else if (digit === 0) {
        // Zero has no place in Lo Shu grid — it's neutral
        // But we track it separately
        grid['_zeroCount'] = (grid['_zeroCount'] || 0) + 1;
      }
    });
    
    return grid;
  }
  
  /**
   * Find numbers that don't appear in the grid
   */
  findMissingNumbers(grid) {
    const missing = [];
    for (let i = 1; i <= 9; i++) {
      if (grid[i] === 0) {
        missing.push(i);
      }
    }
    return missing;
  }
  
  /**
   * Analyze strengths based on number repetitions
   */
  analyzeStrengths(grid) {
    const strengths = [];
    for (let i = 1; i <= 9; i++) {
      const count = grid[i];
      if (count > 0) {
        let strength = '';
        if (count === 1) strength = 'Present';
        else if (count === 2) strength = 'Strong';
        else if (count >= 3) strength = 'Very Strong / Dominant';
        
        strengths.push({
          number: i,
          count,
          strength,
          meaning: NUMBER_MEANINGS[i]
        });
      }
    }
    return strengths;
  }
  
  /**
   * Get visual grid layout (for frontend display)
   */
  getVisualGrid(grid) {
    return {
      row0: [grid['4'] || 0, grid['9'] || 0, grid['2'] || 0],
      row1: [grid['3'] || 0, grid['5'] || 0, grid['7'] || 0],
      row2: [grid['8'] || 0, grid['1'] || 0, grid['6'] || 0]
    };
  }
  
  /**
   * Generate human-readable interpretations
   */
  getInterpretations(grid, missingNumbers, rulingNumber) {
    const presentStrengths = this.analyzeStrengths(grid);
    const strongTraits = presentStrengths.filter(s => s.strength !== 'Present');
    
    let interpretation = `Your ruling number is ${rulingNumber}. `;
    
    if (missingNumbers.length > 0) {
      interpretation += `Missing numbers ${missingNumbers.join(', ')} indicate areas for growth. `;
    }
    
    if (strongTraits.length > 0) {
      interpretation += `Strong traits: ${strongTraits.map(s => `#${s.number} (${s.count}x)`).join(', ')}. `;
    }
    
    return interpretation;
  }
}

module.exports = LoShuGridCalculator;
