const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (to be added)
app.get('/', (req, res) => {
  res.json({ message: 'Shivanetra V6 API is running', status: 'active' });
});

// Complete calculation endpoint
app.post('/api/calculate', (req, res) => {
  const { name, day, month, year, gender } = req.body;
  
  if (!name || !day || !month || !year || !gender) {
    return res.status(400).json({ error: 'Missing required fields: name, day, month, year, gender' });
  }
  
  try {
    const { calculateLoShuGrid } = require('../calculators/lo_shu_grid');
    const { calculateKuaNumber } = require('../calculators/kua_number');
    const { calculateKabbalahNumber } = require('../calculators/kabbalah');
    const { calculateKundaliniNumbers } = require('../calculators/kundalini_five');
    
    const loShu = calculateLoShuGrid(parseInt(day), parseInt(month), parseInt(year));
    const kua = calculateKuaNumber(parseInt(year), gender);
    const kabbalah = calculateKabbalahNumber(name);
    const kundalini = calculateKundaliniNumbers(parseInt(day), parseInt(month), parseInt(year));
    
    res.json({
      success: true,
      data: {
        loShu,
        kua,
        kabbalah,
        kundalini,
        input: { name, day, month, year, gender }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Shivanetra V6 running on http://localhost:${PORT}`);
});
