const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Import database
const { initDB, saveCalculation, getHistory } = require('./database');

// Import calculators
const { calculateLoShuGrid } = require('./calculators/loshu');
const { calculateKuaNumber } = require('./calculators/kua');
const { calculateKabbalah } = require('./calculators/kabbalah');
const { calculateKundalini } = require('./calculators/kundalini');
const { calculateNakshatra } = require('./calculators/nakshatra');

// Initialize database
initDB();

// API Endpoint: Calculate everything
app.post('/api/calculate', async (req, res) => {
    const { name, day, month, year, gender, location } = req.body;
    
    if (!name || !day || !month || !year || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    
    // Run all calculations
    const loShu = calculateLoShuGrid(d, m, y);
    const kua = calculateKuaNumber(y, gender);
    const kabbalah = calculateKabbalah(name);
    const kundalini = calculateKundalini(d, m, y);
    const nakshatra = calculateNakshatra(d, m, y);
    
    // Save to database
    saveCalculation({
        name, day: d, month: m, year: y, gender, location,
        rulingNumber: loShu.rulingNumber,
        kuaNumber: kua.kua,
        kabbalahNumber: kabbalah.number,
        nakshatra: nakshatra.name,
        missingNumbers: JSON.stringify(loShu.missingNumbers)
    });
    
    res.json({
        success: true,
        data: {
            loShu,
            kua,
            kabbalah,
            kundalini,
            nakshatra,
            user: { name, day: d, month: m, year: y, gender, location }
        }
    });
});

// API Endpoint: Get history
app.get('/api/history', (req, res) => {
    getHistory((err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ history: rows });
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║   SHIVANETRA V9 - REAL BACKEND            ║
║   ✅ Server running on port ${PORT}         ║
║   ✅ Database ready                        ║
║   ✅ Calculators loaded                    ║
║                                            ║
║   🌐 http://localhost:${PORT}               ║
╚════════════════════════════════════════════╝
    `);
});
