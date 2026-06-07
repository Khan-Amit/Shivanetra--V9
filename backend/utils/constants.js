/**
 * Shivanetra V6 - Constants & Mappings
 */

// Lo Shu Grid positions (3x3 matrix)
const LO_SHU_POSITIONS = {
  '4': { row: 0, col: 0, plane: 'Mental', meaning: 'Wisdom, organization, wealth' },
  '9': { row: 0, col: 1, plane: 'Mental', meaning: 'Fame, ambition, completion' },
  '2': { row: 0, col: 2, plane: 'Mental', meaning: 'Relationships, marriage, sensitivity' },
  '3': { row: 1, col: 0, plane: 'Emotional', meaning: 'Health, creativity, family' },
  '5': { row: 1, col: 1, plane: 'Emotional', meaning: 'Balance, stability, freedom' },
  '7': { row: 1, col: 2, plane: 'Emotional', meaning: 'Children, spirituality, creativity' },
  '8': { row: 2, col: 0, plane: 'Practical', meaning: 'Knowledge, memory, wisdom' },
  '1': { row: 2, col: 1, plane: 'Practical', meaning: 'Career, communication, independence' },
  '6': { row: 2, col: 2, plane: 'Practical', meaning: 'Mentorship, financial luck, helpfulness' }
};

// Number meanings for Lo Shu Grid
const NUMBER_MEANINGS = {
  1: 'Career, communication, independence — Water element',
  2: 'Relationships, marriage, emotional sensitivity — Earth element',
  3: 'Health, creativity, family foundation — Wood element',
  4: 'Wealth, organization, prosperity — Wood element',
  5: 'Balance, stability, freedom — Earth element',
  6: 'Mentorship, helpfulness, financial luck — Metal element',
  7: 'Children, creativity, spiritual growth — Metal element',
  8: 'Knowledge, memory, wisdom — Earth element',
  9: 'Fame, ambition, completion — Fire element'
};

// Kabbalah letter mapping (A-Z to 1-9)
const KABBALAH_MAP = {
  'A': 1, 'J': 1, 'S': 1,
  'B': 2, 'K': 2, 'T': 2,
  'C': 3, 'L': 3, 'U': 3,
  'D': 4, 'M': 4, 'V': 4,
  'E': 5, 'N': 5, 'W': 5,
  'F': 6, 'O': 6, 'X': 6,
  'G': 7, 'P': 7, 'Y': 7,
  'H': 8, 'Q': 8, 'Z': 8,
  'I': 9, 'R': 9
};

// Kua directions by number
const KUA_DIRECTIONS = {
  success: { 1: 'Southeast', 2: 'Northeast', 3: 'South', 4: 'North', 5: 'Northeast/Southwest', 6: 'Southwest', 7: 'Northwest', 8: 'West', 9: 'East' },
  health: { 1: 'East', 2: 'West', 3: 'North', 4: 'South', 5: 'West/Northwest', 6: 'North', 7: 'West', 8: 'Southwest', 9: 'Southeast' },
  romance: { 1: 'South', 2: 'Northwest', 3: 'Southeast', 4: 'East', 5: 'Northeast/West', 6: 'Southwest', 7: 'Northeast', 8: 'Northwest', 9: 'South' },
  personal: { 1: 'North', 2: 'Southwest', 3: 'East', 4: 'Southeast', 5: 'North/South', 6: 'West', 7: 'Northwest', 8: 'Northeast', 9: 'West' }
};

// Kundalini Ten Bodies mapping
const KUNDALINI_BODIES = {
  1: { name: 'Soul Body', quality: 'Humility, creativity' },
  2: { name: 'Negative Mind', quality: 'Protection, discernment' },
  3: { name: 'Positive Mind', quality: 'Expansion, optimism' },
  4: { name: 'Neutral Mind', quality: 'Service, compassion' },
  5: { name: 'Physical Body', quality: 'Sacrifice, balance' },
  6: { name: 'Arcline', quality: 'Focus, projection' },
  7: { name: 'Aura', quality: 'Mercy, security' },
  8: { name: 'Pranic Body', quality: 'Purity, energy' },
  9: { name: 'Subtle Body', quality: 'Calmness, mastery' },
  10: { name: 'Radiant Body', quality: 'Courage, sovereignty' },
  11: { name: 'Embodiment', quality: 'All bodies unified' }
};

module.exports = {
  LO_SHU_POSITIONS,
  NUMBER_MEANINGS,
  KABBALAH_MAP,
  KUA_DIRECTIONS,
  KUNDALINI_BODIES
};
