const LO_SHU_POSITIONS = {
  4: { row: 0, col: 0 }, 9: { row: 0, col: 1 }, 2: { row: 0, col: 2 },
  3: { row: 1, col: 0 }, 5: { row: 1, col: 1 }, 7: { row: 1, col: 2 },
  8: { row: 2, col: 0 }, 1: { row: 2, col: 1 }, 6: { row: 2, col: 2 }
};

const NUMBER_MEANINGS = {
  1: "Career, communication, independence",
  2: "Relationships, marriage, emotional sensitivity",
  3: "Health, creativity, family foundation",
  4: "Wealth, organization, prosperity",
  5: "Balance, stability, freedom",
  6: "Mentorship, helpfulness, financial luck",
  7: "Children, creativity, spiritual growth",
  8: "Knowledge, memory, wisdom",
  9: "Fame, ambition, completion"
};

const KABBALAH_MAP = {
  'A':1,'J':1,'S':1, 'B':2,'K':2,'T':2, 'C':3,'L':3,'U':3,
  'D':4,'M':4,'V':4, 'E':5,'N':5,'W':5, 'F':6,'O':6,'X':6,
  'G':7,'P':7,'Y':7, 'H':8,'Q':8,'Z':8, 'I':9,'R':9
};

module.exports = { LO_SHU_POSITIONS, NUMBER_MEANINGS, KABBALAH_MAP };
