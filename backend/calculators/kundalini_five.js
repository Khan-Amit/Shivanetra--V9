/**
 * Kundalini Five Numbers Calculator
 * Tantric Numerology based on birth date
 * Calculates: Soul, Karma, Gift, Destiny, Path numbers
 */

const { KUNDALINI_BODIES } = require('../utils/constants');
const { parseBirthDate, reduceToSingleDigit, sumDigits } = require('../utils/reducers');

class KundaliniCalculator {
  
  /**
   * Calculate all five Kundalini numbers
   * @param {string} birthDate - YYYY-MM-DD format
   * @returns {object} All five numbers with interpretations
   */
  calculate(birthDate) {
    const { year, month, day } = parseBirthDate(birthDate);
    
    // Soul Number: sum of day digits
    const soulRaw = sumDigits(day);
    const soul = reduceToSingleDigit(soulRaw, true);
    
    // Karma Number: sum of month digits
    const karmaRaw = sumDigits(month);
    const karma = reduceToSingleDigit(karmaRaw, true);
    
    // Gift Number: sum of last two digits of year
    const lastTwoDigits = year % 100;
    const giftRaw = sumDigits(lastTwoDigits);
    const gift = reduceToSingleDigit(giftRaw, true);
    
    // Destiny Number: sum of all four year digits
    const destinyRaw = sumDigits(year);
    const destiny = reduceToSingleDigit(destinyRaw, true);
    
    // Path Number: sum of ALL digits in full birth date
    const fullDateDigits = `${month}${day}${year}`.split('').map(Number);
    const pathRaw = fullDateDigits.reduce((a, b) => a + b, 0);
    const path = reduceToSingleDigit(pathRaw, true);
    
    // Cross-verify: Path should equal sum of Soul + Karma + Destiny (reduced)
    const sumOfThree = soul + karma + destiny;
    const pathVerification = reduceToSingleDigit(sumOfThree, true);
    
    // Map to Ten Bodies (1-11 scale)
    const soulBody = this.mapToBody(soul);
    const karmaBody = this.mapToBody(karma);
    const giftBody = this.mapToBody(gift);
    const destinyBody = this.mapToBody(destiny);
    const pathBody = this.mapToBody(path);
    
    return {
      birthDate,
      soul: { value: soul, body: soulBody },
      karma: { value: karma, body: karmaBody },
      gift: { value: gift, body: giftBody },
      destiny: { value: destiny, body: destinyBody },
      path: { value: path, body: pathBody, verification: pathVerification },
      summary: this.getSummary({ soul, karma, gift, destiny, path }),
      meditations: this.getSuggestedMeditations({ soul, karma, gift, destiny, path })
    };
  }
  
  /**
   * Map number 1-11 to Ten Bodies system
   */
  mapToBody(number) {
    if (number >= 1 && number <= 11) {
      return KUNDALINI_BODIES[number] || KUNDALINI_BODIES[11];
    }
    // If number > 11, reduce
    const reduced = reduceToSingleDigit(number);
    return KUNDALINI_BODIES[reduced] || KUNDALINI_BODIES[11];
  }
  
  /**
   * Generate summary text
   */
  getSummary(numbers) {
    let summary = `Your Soul (${numbers.soul}) guides your essence. `;
    summary += `Your Karma (${numbers.karma}) shows lessons. `;
    summary += `Your Gift (${numbers.gift}) is your talent. `;
    summary += `Your Destiny (${numbers.destiny}) is your path. `;
    summary += `Your Path Number (${numbers.path}) unites all.`;
    return summary;
  }
  
  /**
   * Suggest meditations for each body
   */
  getSuggestedMeditations(numbers) {
    const meditations = {};
    
    if (numbers.soul === 1) meditations.soul = 'Meditate on humility: "I am the light of the soul."';
    if (numbers.soul === 2) meditations.soul = 'Practice protection: Surround yourself with white light.';
    if (numbers.soul === 3) meditations.soul = 'Chant "Sat Nam" for expansion.';
    if (numbers.soul === 4) meditations.soul = 'Serve others daily.';
    if (numbers.soul === 5) meditations.soul = 'Balance your diet and exercise.';
    if (numbers.soul === 6) meditations.soul = 'Focus your gaze at the third eye.';
    if (numbers.soul === 7) meditations.soul = 'Wear white and meditate in open air.';
    if (numbers.soul === 8) meditations.soul = 'Practice deep breathing (pranayama).';
    if (numbers.soul === 9) meditations.soul = 'Still your mind in silence.';
    if (numbers.soul === 10) meditations.soul = 'Develop courage through adversity.';
    if (numbers.soul === 11) meditations.soul = 'Integrate all aspects of self.';
    
    return meditations;
  }
}

module.exports = KundaliniCalculator;
