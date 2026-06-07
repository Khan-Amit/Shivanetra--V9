const express = require('express');
const cors = require('cors');
const path = require('path');

const { mardukShield } = require('./backend/marduk/shield');
const { calculateLoShuGrid } = require('./backend/calculators/lo_shu_grid');
const { calculateKuaNumber } = require('./backend/calculators/kua_number');
const { calculateKabbalahNumber } = require('./backend/calculators/kabbalah');
const { calculateKundaliniNumbers } = require('./backend/calculators/kundalini_five');
const { saveQuery, updateAIPattern, getAIInsights } = require('./backend/database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(mardukShield);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Complete calculation endpoint
app.post('/api/calculate', (req, res) => {
  const { name, day, month, year, gender } = req.body;
  
  if (!name || !day || !month || !year || !gender) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const d = parseInt(day), m = parseInt(month), y = parseInt(year);
  
  const loShu = calculateLoShuGrid(d, m, y);
  const kua = calculateKuaNumber(y, gender);
  const kabbalah = calculateKabbalahNumber(name);
  const kundalini = calculateKundaliniNumbers(d, m, y);
  
  // Save to database
  saveQuery(name, d, m, y, gender, loShu, kua, kabbalah);
  
  // Update AI patterns
  updateAIPattern(`ruling_${loShu.rulingNumber}`, loShu.rulingNumber.toString());
  updateAIPattern(`kua_${kua.kua}`, kua.kua.toString());
  updateAIPattern(`kabbalah_${kabbalah.kabbalahNumber}`, kabbalah.kabbalahNumber.toString());
  loShu.missingNumbers.forEach(n => {
    updateAIPattern(`missing_${n}`, n.toString());
  });
  
  res.json({
    success: true,
    loShu,
    kua,
    kabbalah,
    kundalini
  });
});

// AI Insights endpoint
app.get('/api/insights', (req, res) => {
  getAIInsights((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ insights: rows });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'active', 
    version: '9.0.0',
    marduk: 'Tier-1 active',
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🔮 SHIVANETRA–V9 🔮                                    ║
║   https://github.com/Khan-Ar/shivanetra-v9              ║
║                                                          ║
║   ✅ Lo Shu Grid + Ruling Number                        ║
║   ✅ Kua Number + Directions                            ║
║   ✅ Kabbalah Name Number                               ║
║   ✅ Kundalini Five Numbers                             ║
║   🛡️ Marduk™ Tier-1 Shield                             ║
║   📀 SQLite Database (accumulating)                     ║
║   🧠 AI Pattern Learning                                ║
║                                                          ║
║   🌐 http://localhost:${PORT}                           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});
