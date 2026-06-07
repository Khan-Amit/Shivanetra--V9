/**
 * Test all Shivanetra V6 calculators
 */

const LoShuGridCalculator = require('../backend/calculators/lo_shu_grid');
const KuaNumberCalculator = require('../backend/calculators/kua_number');
const KabbalahCalculator = require('../backend/calculators/kabbalah');
const KundaliniCalculator = require('../backend/calculators/kundalini_five');

console.log('\n🔮 SHIVANETRA V6 CALCULATOR TESTS 🔮\n');

// Test 1: Lo Shu Grid
const loShu = new LoShuGridCalculator();
const birthDate = '1990-04-06';
const loShuResult = loShu.calculate(birthDate);
console.log('📊 LO SHU GRID');
console.log(`Birth Date: ${birthDate}`);
console.log(`Ruling Number: ${loShuResult.rulingNumber}`);
console.log(`Grid:`, loShuResult.grid);
console.log(`Missing: ${loShuResult.missingNumbers}`);
console.log(`Visual Grid:`, loShuResult.strengths.slice(0, 3));
console.log('---\n');

// Test 2: Kua Number
const kua = new KuaNumberCalculator();
const kuaMale = kua.calculate(1990, 'male');
const kuaFemale = kua.calculate(1990, 'female');
console.log('🧭 KUA NUMBER');
console.log(`Male (1990): Kua ${kuaMale.kuaNumber} - ${kuaMale.group} Group`);
console.log(`  Success: ${kuaMale.directions.success}, Health: ${kuaMale.directions.health}`);
console.log(`Female (1990): Kua ${kuaFemale.kuaNumber} - ${kuaFemale.group} Group`);
console.log(`  Success: ${kuaFemale.directions.success}, Health: ${kuaFemale.directions.health}`);
console.log('---\n');

// Test 3: Kabbalah
const kabbalah = new KabbalahCalculator();
const nameResult = kabbalah.calculate('John Smith');
console.log('✡️ KABBALAH');
console.log(`Name: ${nameResult.originalName}`);
console.log(`Kabbalah Number: ${nameResult.kabbalahNumber}`);
console.log(`Interpretation: ${nameResult.interpretation}`);
console.log('---\n');

// Test 4: Kundalini Five Numbers
const kundalini = new KundaliniCalculator();
const kundaliniResult = kundalini.calculate('1990-04-06');
console.log('🕉️ KUNDALINI FIVE NUMBERS');
console.log(`Soul: ${kundaliniResult.soul.value} - ${kundaliniResult.soul.body.name}`);
console.log(`Karma: ${kundaliniResult.karma.value} - ${kundaliniResult.karma.body.name}`);
console.log(`Gift: ${kundaliniResult.gift.value} - ${kundaliniResult.gift.body.name}`);
console.log(`Destiny: ${kundaliniResult.destiny.value} - ${kundaliniResult.destiny.body.name}`);
console.log(`Path: ${kundaliniResult.path.value} - ${kundaliniResult.path.body.name}`);
console.log(`\nSummary: ${kundaliniResult.summary}`);
console.log('---\n');

console.log('✅ All calculators loaded and tested successfully!');
console.log('🙏 Shivanetra V6 core is ready.\n');
