const { KABBALAH_MAP } = require('../utils/constants');
const { kabbalahReduce } = require('../utils/reducers');

function calculateKabbalahNumber(fullName) {
  const cleanName = fullName.toUpperCase().replace(/\s/g, '');
  
  let total = 0;
  for (let char of cleanName) {
    if (KABBALAH_MAP[char]) total += KABBALAH_MAP[char];
  }
  
  const kabbalahNumber = kabbalahReduce(total);
  
  const interpretations = {
    1: "Leadership, independence, creativity",
    2: "Diplomacy, cooperation, sensitivity",
    3: "Expression, joy, social connection",
    4: "Stability, order, hard work",
    5: "Freedom, adventure, change",
    6: "Responsibility, love, nurturing",
    7: "Wisdom, spirituality, introspection",
    8: "Power, abundance, ambition",
    9: "Compassion, completion, humanitarianism"
  };
  
  return {
    nameTotal: total,
    kabbalahNumber,
    interpretation: interpretations[kabbalahNumber] || "Balance and harmony"
  };
}

module.exports = { calculateKabbalahNumber };
