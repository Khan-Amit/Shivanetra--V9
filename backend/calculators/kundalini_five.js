const { reduceToSingleDigit, digitSum } = require('../utils/reducers');

function calculateKundaliniNumbers(day, month, year) {
  const soul = reduceToSingleDigit(digitSum(day), false);
  const karma = reduceToSingleDigit(digitSum(month), false);
  const lastTwo = year % 100;
  const gift = reduceToSingleDigit(digitSum(lastTwo), false);
  const yearSum = digitSum(year);
  const destiny = reduceToSingleDigit(yearSum, false);
  const total = digitSum(day) + digitSum(month) + digitSum(year);
  const path = reduceToSingleDigit(total, false);
  
  const tenBodies = {
    1: "Soul Body", 2: "Negative Mind", 3: "Positive Mind", 4: "Neutral Mind",
    5: "Physical Body", 6: "Arc Line", 7: "Aura", 8: "Pranic Body",
    9: "Subtle Body", 10: "Radiant Body", 11: "Embodiment of All"
  };
  
  return {
    soul: { number: soul, body: tenBodies[soul] || tenBodies[1] },
    karma: { number: karma, body: tenBodies[karma] || tenBodies[2] },
    gift: { number: gift, body: tenBodies[gift] || tenBodies[3] },
    destiny: { number: destiny, body: tenBodies[destiny] || tenBodies[4] },
    path: { number: path, body: tenBodies[path] || tenBodies[5] }
  };
}

module.exports = { calculateKundaliniNumbers };
