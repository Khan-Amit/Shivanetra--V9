/**
 * Shivanetra V6 - Reducer Utilities
 * Digit sum, modulo operations, number reduction
 */

/**
 * Sum all digits of a number until single digit (1-9)
 * Special case: if result is 11, keep as 11 (master number)
 */
function reduceToSingleDigit(num, keepMasterNumbers = true) {
  let sum = num;
  while (sum > 9 && !(keepMasterNumbers && (sum === 11 || sum === 22))) {
    sum = String(sum)
      .split('')
      .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return sum;
}

/**
 * Sum digits without reducing (just total sum)
 */
function sumDigits(num) {
  return String(num)
    .split('')
    .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
}

/**
 * Extract all digits from a date string (YYYY-MM-DD or DD/MM/YYYY)
 */
function extractDateDigits(dateStr) {
  return dateStr.replace(/\D/g, '').split('').map(Number);
}

/**
 * Get birth date components
 */
function parseBirthDate(dateStr) {
  let clean = dateStr.replace(/\D/g, '');
  let year, month, day;
  
  if (dateStr.includes('-')) {
    [year, month, day] = clean.match(/(\d{4})(\d{2})(\d{2})/).slice(1);
  } else {
    // Assume DDMMYYYY or MMDDYYYY? Default to DDMMYYYY
    if (clean.length === 8) {
      day = clean.slice(0, 2);
      month = clean.slice(2, 4);
      year = clean.slice(4, 8);
    } else {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
  }
  
  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
    fullDate: `${year}-${month}-${day}`
  };
}

module.exports = {
  reduceToSingleDigit,
  sumDigits,
  extractDateDigits,
  parseBirthDate
};
