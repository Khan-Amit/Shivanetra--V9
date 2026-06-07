/**
 * SHIVANETRA–V9 | DATASET #1
 * Lo Shu Grid Calculator + Ruling Number
 * Marduk™ Light Shield (Tier 1 simulated)
 * Local SQLite accumulation
 * Downloadable HTML report
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ============ MARDUK TIER-1 SHIELD (Light) ============
const mardukShield = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousPatterns = ['bot', 'crawler', 'scanner', 'nmap', 'curl', 'wget'];
    const isSuspicious = suspiciousPatterns.some(p => userAgent.toLowerCase().includes(p));
    
    if (isSuspicious) {
        console.log(`🛡️ MARDUK: Rejected probe from ${req.ip}`);
        return res.status(403).json({ error: 'Access denied by Marduk Shield' });
    }
    
    console.log(`✅ MARDUK: Passed ${req.ip}`);
    next();
};

app.use(mardukShield);

// ============ LOCAL DATABASE (Accumulates data) ============
const dbPath = path.join(__dirname, 'data', 'shivanetra_v9.db');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

const db = new sqlite3.Database(dbPath);

db.run(`
    CREATE TABLE IF NOT EXISTS lo_shu_queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        day INTEGER,
        month INTEGER,
        year INTEGER,
        ruling_number INTEGER,
        missing_numbers TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS ai_patterns (
        key TEXT PRIMARY KEY,
        value TEXT,
        frequency INTEGER DEFAULT 1
    )
`);

// ============ REDUCER FUNCTION ============
function reduceToSingleDigit(num) {
    while (num > 9) {
        num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return num;
}

// ============ LO SHU GRID CALCULATOR ============
function calculateLoShuGrid(day, month, year) {
    const dateStr = `${day}${month}${year}`;
    const digits = dateStr.split('').map(Number).filter(d => d !== 0);
    
    // Grid positions (magic square)
    const positions = {
        4: [0,0], 9: [0,1], 2: [0,2],
        3: [1,0], 5: [1,1], 7: [1,2],
        8: [2,0], 1: [2,1], 6: [2,2]
    };
    
    // Count occurrences
    const counts = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    digits.forEach(d => { if (counts[d] !== undefined) counts[d]++; });
    
    // Build grid
    const grid = [['','',''], ['','',''], ['','','']];
    for (let num = 1; num <= 9; num++) {
        const pos = positions[num];
        if (pos) {
            grid[pos[0]][pos[1]] = counts[num] > 0 ? counts[num].toString() : '·';
        }
    }
    
    // Ruling number
    const total = digits.reduce((a,b) => a + b, 0);
    const rulingNumber = reduceToSingleDigit(total);
    
    // Missing numbers
    const missingNumbers = [];
    for (let i = 1; i <= 9; i++) {
        if (counts[i] === 0) missingNumbers.push(i);
    }
    
    // Meanings
    const meanings = {
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
    
    const strengths = [];
    for (let i = 1; i <= 9; i++) {
        if (counts[i] > 0) {
            strengths.push({ number: i, meaning: meanings[i], count: counts[i] });
        }
    }
    
    return { grid, counts, rulingNumber, missingNumbers, strengths, totalSum: total };
}

// ============ AI: Update patterns ============
function updateAIPattern(missingNumbers, rulingNumber) {
    const missingKey = `most_common_missing`;
    const rulingKey = `ruling_freq_${rulingNumber}`;
    
    db.get("SELECT value, frequency FROM ai_patterns WHERE key = ?", [missingKey], (err, row) => {
        if (row) {
            const missingSet = new Set(JSON.parse(row.value));
            missingNumbers.forEach(n => missingSet.add(n));
            db.run("UPDATE ai_patterns SET value = ?, frequency = ? WHERE key = ?", 
                [JSON.stringify([...missingSet]), row.frequency + 1, missingKey]);
        } else {
            db.run("INSERT INTO ai_patterns (key, value, frequency) VALUES (?, ?, ?)", 
                [missingKey, JSON.stringify(missingNumbers), 1]);
        }
    });
    
    db.run("INSERT OR REPLACE INTO ai_patterns (key, value, frequency) VALUES (?, COALESCE((SELECT value FROM ai_patterns WHERE key = ?), ?), COALESCE((SELECT frequency FROM ai_patterns WHERE key = ?), 0) + 1)", 
        [rulingKey, rulingKey, rulingNumber.toString(), rulingKey]);
}

// ============ GENERATE DOWNLOADABLE HTML ============
function generateHTMLReport(data, name, dob) {
    const { grid, rulingNumber, missingNumbers, strengths } = data;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lo Shu Grid Report - ${name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            min-height: 100vh;
            padding: 40px 20px;
            color: #fff;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        h1 {
            text-align: center;
            font-size: 2.5em;
            color: #ffd700;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #ccc;
            margin-bottom: 30px;
            border-bottom: 1px solid rgba(255,215,0,0.3);
            padding-bottom: 20px;
        }
        .grid-3x3 {
            display: grid;
            grid-template-columns: repeat(3, 100px);
            gap: 15px;
            justify-content: center;
            margin: 30px 0;
        }
        .cell {
            width: 100px;
            height: 100px;
            background: rgba(255,215,0,0.15);
            border: 2px solid #ffd700;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            font-family: monospace;
            transition: transform 0.2s;
        }
        .cell:hover { transform: scale(1.05); background: rgba(255,215,0,0.3); }
        .info-card {
            background: rgba(0,0,0,0.5);
            border-radius: 20px;
            padding: 20px;
            margin: 20px 0;
        }
        .ruling {
            font-size: 48px;
            text-align: center;
            color: #ffd700;
            font-weight: bold;
        }
        .strength-item {
            background: rgba(255,215,0,0.2);
            padding: 10px;
            margin: 8px 0;
            border-radius: 10px;
            border-left: 4px solid #ffd700;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #888;
            border-top: 1px solid rgba(255,255,255,0.2);
            padding-top: 20px;
        }
        button {
            background: #ffd700;
            color: #1a1a2e;
            border: none;
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 20px;
            width: 100%;
        }
        button:hover { background: #ffed4a; }
        @media (max-width: 600px) {
            .grid-3x3 { grid-template-columns: repeat(3, 80px); gap: 10px; }
            .cell { width: 80px; height: 80px; font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔮 Lo Shu Grid Report 🔮</h1>
        <div class="subtitle">
            <strong>${name}</strong> | DOB: ${dob.day}/${dob.month}/${dob.year}
        </div>
        
        <div class="grid-3x3">
            ${grid.map(row => row.map(cell => `<div class="cell">${cell}</div>`).join('')).join('')}
        </div>
        
        <div class="info-card">
            <div style="text-align: center; font-size: 18px;">🌟 Ruling Number 🌟</div>
            <div class="ruling">${rulingNumber}</div>
        </div>
        
        <div class="info-card">
            <h3>✨ Your Strengths ✨</h3>
            ${strengths.map(s => `<div class="strength-item"><strong>Number ${s.number}</strong> (appears ${s.count}x): ${s.meaning}</div>`).join('')}
        </div>
        
        ${missingNumbers.length > 0 ? `
        <div class="info-card">
            <h3>⚠️ Areas for Growth ⚠️</h3>
            <p>Missing numbers: <strong>${missingNumbers.join(', ')}</strong></p>
            <p style="font-size: 14px; margin-top: 10px;">These represent qualities you may need to consciously develop.</p>
        </div>
        ` : ''}
        
        <button onclick="window.print()">🖨️ Save as PDF / Print</button>
        
        <div class="footer">
            Generated by Shivanetra–V9 | Marduk™ Shield Active | AI-Enhanced Numerology
        </div>
    </div>
</body>
</html>`;
}

// ============ API ENDPOINT ============
app.post('/api/lo-shu', (req, res) => {
    const { name, day, month, year } = req.body;
    
    if (!name || !day || !month || !year) {
        return res.status(400).json({ error: 'Name, day, month, year required' });
    }
    
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    
    if (isNaN(d) || isNaN(m) || isNaN(y)) {
        return res.status(400).json({ error: 'Invalid date values' });
    }
    
    const result = calculateLoShuGrid(d, m, y);
    
    // Store in database
    db.run(
        "INSERT INTO lo_shu_queries (name, day, month, year, ruling_number, missing_numbers) VALUES (?, ?, ?, ?, ?, ?)",
        [name, d, m, y, result.rulingNumber, JSON.stringify(result.missingNumbers)]
    );
    
    // Update AI patterns
    updateAIPattern(result.missingNumbers, result.rulingNumber);
    
    // Generate downloadable HTML
    const html = generateHTMLReport(result, name, { day: d, month: m, year: y });
    
    res.json({
        success: true,
        data: result,
        downloadableHTML: html,
        message: "Report ready. Use the HTML to save as file."
    });
});

// ============ AI INSIGHT ENDPOINT ============
app.get('/api/ai-insights', (req, res) => {
    db.all("SELECT key, value, frequency FROM ai_patterns ORDER BY frequency DESC", (err, rows) => {
        res.json({ insights: rows });
    });
});

// ============ SERVE FRONTEND ============
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shivanetra–V9 | Lo Shu Grid</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            color: white;
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { text-align: center; color: #ffd700; }
        .card {
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }
        input, button {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border-radius: 8px;
            border: none;
            font-size: 16px;
        }
        input { background: #2c2c4e; color: white; }
        button {
            background: #ffd700;
            color: #1a1a2e;
            font-weight: bold;
            cursor: pointer;
        }
        button:hover { background: #ffed4a; }
        .row { display: flex; gap: 10px; }
        .row input { flex: 1; }
        .result { margin-top: 20px; display: none; }
        .download-btn {
            background: #4caf50;
            color: white;
            margin-top: 10px;
        }
        .marduk-badge {
            text-align: center;
            font-size: 12px;
            color: #ffd700;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔮 Shivanetra–V9 🔮</h1>
        <div class="card">
            <h3>Lo Shu Grid Calculator</h3>
            <input type="text" id="name" placeholder="Full Name">
            <div class="row">
                <input type="number" id="day" placeholder="Day (1-31)">
                <input type="number" id="month" placeholder="Month (1-12)">
                <input type="number" id="year" placeholder="Year">
            </div>
            <button onclick="calculate()">✨ Generate Lo Shu Grid ✨</button>
            <div id="result" class="result"></div>
            <div class="marduk-badge">🛡️ Marduk™ Shield Active | Tier-1 Filter Running</div>
        </div>
    </div>

    <script>
        let currentHTML = '';
        
        async function calculate() {
            const name = document.getElementById('name').value;
            const day = document.getElementById('day').value;
            const month = document.getElementById('month').value;
            const year = document.getElementById('year').value;
            
            if (!name || !day || !month || !year) {
                alert('Please fill all fields');
                return;
            }
            
            const response = await fetch('/api/lo-shu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, day: parseInt(day), month: parseInt(month), year: parseInt(year) })
            });
            
            const result = await response.json();
            
            if (result.success) {
                currentHTML = result.downloadableHTML;
                
                // Display grid preview
                const grid = result.data.grid;
                const gridHtml = \`
                    <div style="background: rgba(0,0,0,0.5); border-radius: 15px; padding: 20px; margin-top: 20px;">
                        <h4>📊 Your Lo Shu Grid</h4>
                        <div style="display: grid; grid-template-columns: repeat(3, 70px; gap: 8px; justify-content: center;">
                            \${grid.map(row => row.map(cell => \`<div style="width:70px;height:70px;background:rgba(255,215,0,0.2);border:1px solid #ffd700;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;">\${cell}</div>\`).join('')).join('')}
                        </div>
                        <p style="margin-top: 15px;"><strong>Ruling Number:</strong> \${result.data.rulingNumber}</p>
                        <button class="download-btn" onclick="downloadHTML()">📥 Download Full Report (HTML)</button>
                    </div>
                \`;
                document.getElementById('result').innerHTML = gridHtml;
                document.getElementById('result').style.display = 'block';
            } else {
                alert('Error: ' + result.error);
            }
        }
        
        function downloadHTML() {
            const blob = new Blob([currentHTML], { type: 'text/html' });
            const link = document.createElement('a');
            const name = document.getElementById('name').value || 'report';
            link.href = URL.createObjectURL(blob);
            link.download = \`lo_shugrid_\${name}.html\`;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    </script>
</body>
</html>
    `);
});

// ============ START SERVER ============
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   SHIVANETRA–V9 | DATASET #1           ║
║   Lo Shu Grid + Marduk Light           ║
║   🛡️ Tier-1 Shield Active              ║
║   📀 Local DB Accumulating             ║
║   🧠 AI Patterns Learning              ║
║                                        ║
║   → http://localhost:${PORT}            ║
╚════════════════════════════════════════╝
    `);
});
