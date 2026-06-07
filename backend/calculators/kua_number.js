function calculateKuaNumber(year, gender) {
  const lastTwo = year % 100;
  const sumDigits = Math.floor(lastTwo / 10) + (lastTwo % 10);
  let reduced = sumDigits % 9;
  if (reduced === 0) reduced = 9;
  
  let kua;
  if (gender === 'male') {
    kua = 10 - reduced;
    if (kua === 10) kua = 1;
    if (kua === 5) kua = 2;
  } else {
    kua = 5 + reduced;
    if (kua > 9) kua = kua - 9;
    if (kua === 5) kua = 8;
  }
  
  const group = (kua === 1 || kua === 3 || kua === 4 || kua === 9) ? 'East' : 'West';
  
  const directionMap = {
    1: { success: 'SE', health: 'E', romance: 'S', personal: 'N' },
    2: { success: 'NE', health: 'W', romance: 'NW', personal: 'SW' },
    3: { success: 'S', health: 'N', romance: 'SE', personal: 'E' },
    4: { success: 'N', health: 'S', romance: 'E', personal: 'SE' },
    6: { success: 'W', health: 'NE', romance: 'SW', personal: 'NW' },
    7: { success: 'NW', health: 'SW', romance: 'NE', personal: 'W' },
    8: { success: 'SW', health: 'NW', romance: 'W', personal: 'NE' },
    9: { success: 'E', health: 'SE', romance: 'N', personal: 'S' }
  };
  
  const directions = directionMap[kua] || { success: 'N', health: 'N', romance: 'N', personal: 'N' };
  
  return { kua, group, directions };
}

module.exports = { calculateKuaNumber };
