const { LO_SHU_POSITIONS, NUMBER_MEANINGS } = require('../utils/constants');
const { reduceToSingleDigit } = require('../utils/reducers');

function calculateLoShuGrid(day, month, year) {
  const dateStr = `${day}${month}${year}`;
  const digits = dateStr.split('').map(Number).filter(d => d !== 0);
  
  const counts = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  digits.forEach(d => { if (counts[d] !== undefined) counts[d]++; });
  
  const grid = [['','',''], ['','',''], ['','','']];
  for (let num = 1; num <= 9; num++) {
    const pos = LO_SHU_POSITIONS[num];
    if (pos) grid[pos.row][pos.col] = counts[num] > 0 ? counts[num].toString() : '·';
  }
  
  const total = digits.reduce((a,b) => a + b, 0);
  const rulingNumber = reduceToSingleDigit(total, false);
  
  const missingNumbers = [];
  const strengths = [];
  for (let i = 1; i <= 9; i++) {
    if (counts[i] === 0) missingNumbers.push(i);
    else strengths.push({ number: i, meaning: NUMBER_MEANINGS[i], count: counts[i] });
  }
  
  return { grid, counts, rulingNumber, missingNumbers, strengths, totalSum: total };
}

module.exports = { calculateLoShuGrid };
