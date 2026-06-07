/**
 * SHIVANETRA–V9 | DATASET #2
 * Lo Shu Grid + Kua Number + Auspicious Directions
 * Marduk™ Light Shield | SQLite Accumulation | Downloadable HTML
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ MARDUK TIER-1 SHIELD ============
const mardukShield = (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const suspicious = ['bot', 'crawler', 'scanner', 'nmap', 'curl', 'wget', 'python', 'go-http'];
    const isSuspicious = suspicious.some(s => userAgent.toLowerCase().includes(s));
    
    if (isSuspicious) {
        console.log(`🛡️ MARDUK: Blocked ${req.ip} (${userAgent})`);
        return res.status(403).json({ error: '🛡️ Marduk Shield: Access Denied' });
    }
    console.log(`✅ MARDUK: Passed ${req.ip}`);
    next();
};
app.use(mardukShield);

// ============ DATABASE SETUP ============
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
const db = new sqlite3.Database(path.join(__dirname, 'data', 'shivanetra_v9.db'));

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, day INTEGER, month INTEGER, year INTEGER, gender TEXT,
    ruling_number INTEGER, kua_number INTEGER, kua_group TEXT,
    missing_numbers TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS ai_patterns (
    key TEXT PRIMARY KEY, value TEXT, frequency INTEGER DEFAULT 1
)`);

// ============ UTILITIES ============
function reduceToSingleDigit(num) {
    while (num > 9) {
        num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return num;
}

// ============ LO SHU GRID ============
function calculateLoShuGrid(day, month, year) {
    const dateStr = `${day}${month}${year}`;
    const digits = dateStr.split('').map(Number).filter(d => d !== 0);
    
    const positions = { 4:[0,0], 9:[0,1], 2:[0,2], 3:[1,0], 5:[1,1], 7:[1,2], 8:[2,0], 1:[2,1], 6:[2,2] };
    const counts = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
    digits.forEach(d => { if (counts[d] !== undefined) counts[d]++; });
    
    const grid = [['','',''], ['','',''], ['','','']];
    for (let num = 1; num <= 9; num++) {
        const pos = positions[num];
        if (pos) grid[pos[0]][pos[1]] = counts[num] > 0 ? counts[num].toString() : '·';
    }
    
    const total = digits.reduce((a,b) => a + b, 0);
    const rulingNumber = reduceToSingleDigit(total);
    
    const missingNumbers = [];
    for (let i = 1; i <= 9; i++) if (counts[i] === 0) missingNumbers.push(i);
    
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
        if (counts[i] > 0) strengths.push({ number: i, meaning: meanings[i], count: counts[i] });
    }
    
    return { grid, counts, rulingNumber, missingNumbers, strengths, totalSum: total };
}

// ============ KUA NUMBER (NEW) ============
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
    
    const directions = directionMap[kua] || { success: 'N/A', health: 'N/A', romance: 'N/A', personal: 'N/A' };
    
    return { kua, group, directions };
}

// ============ AI PATTERN UPDATE ============
function updateAIPattern(missingNumbers, rulingNumber, kuaNumber) {
    const missingKey = 'most_common_missing';
    db.get("SELECT value, frequency FROM ai_patterns WHERE key = ?", [missingKey], (err, row) => {
        if (row) {
            const existing = new Set(JSON.parse(row.value));
            missingNumbers.forEach(n => existing.add(n));
            db.run("UPDATE ai_patterns SET value = ?, frequency = ? WHERE key = ?", 
                [JSON.stringify([...existing]), row.frequency + 1, missingKey]);
        } else {
            db.run("INSERT INTO ai_patterns (key, value, frequency) VALUES (?, ?, ?)", 
                [missingKey, JSON.stringify(missingNumbers), 1]);
        }
    });
    
    db.run("INSERT INTO ai_patterns (key, value, frequency) VALUES (?, ?, COALESCE((SELECT frequency FROM ai_patterns WHERE key = ?), 0) + 1)",
        [`ruling_${rulingNumber}`, rulingNumber.toString(), `ruling_${rulingNumber}`]);
    
    db.run("INSERT INTO ai_patterns (key, value, frequency) VALUES (?, ?, COALESCE((SELECT frequency FROM ai_patterns WHERE key = ?), 0) + 1)",
        [`kua_${kuaNumber}`, kuaNumber.toString(), `kua_${kuaNumber}`]);
}

// ============ GENERATE HTML REPORT ============
function generateHTMLReport(loShu, kua, name, dob, gender) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shivanetra Report - ${name}</title>
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
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 30px;
            padding: 40px;
        }
        h1 { text-align: center; color: #ffd700; margin-bottom: 10px; }
        .subtitle { text-align: center; color: #ccc; margin-bottom: 30px; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 20px; }
        .grid-3x3 { display: grid; grid-template-columns: repeat(3, 100px); gap: 15px; justify-content: center; margin: 30px 0; }
        .cell {
            width: 100px; height: 100px;
            background: rgba(255,215,0,0.15);
            border: 2px solid #ffd700;
            border-radius: 15px;
            display: flex; align-items: center; justify-content: center;
            font-size: 32px; font-weight: bold;
        }
        .info-card { background: rgba(0,0,0,0.5); border-radius: 20px; padding: 20px; margin: 20px 0; }
        .ruling { font-size: 48px; text-align: center; color: #ffd700; font-weight: bold; }
        .kua-badge { font-size: 36px; text-align: center; color: #ff6b6b; font-weight: bold; }
        .directions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 15px; }
        .dir-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; text-align: center; }
        .dir-card h4 { color: #ffd700; margin-bottom: 8px; }
        .dir-card p { font-size: 24px; font-weight: bold; }
        .strength-item { background: rgba(255,215,0,0.2); padding: 10px; margin: 8px 0; border-radius: 10px; border-left: 4px solid #ffd700; }
        button { background: #ffd700; color: #1a1a2e; border: none; padding: 12px 24px; border-radius: 30px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 20px; }
        button:hover { background: #ffed4a; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px; }
        @media (max-width: 700px) {
            .grid-3x3 { grid-template-columns: repeat(3, 70px); gap: 10px; }
            .cell { width: 70px; height: 70px; font-size: 24px; }
            .directions { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔮 Shivanetra–V9 Report 🔮</h1>
        <div class="subtitle">
            <strong>${name}</strong> | DOB: ${dob.day}/${dob.month}/${dob.year} | ${gender === 'male' ? '♂ Male' : '♀ Female'}
        </div>
        
        <h2 style="text-align:center;">📊 Lo Shu Grid</h2>
        <div class="grid-3x3">
            ${loShu.grid.map(row => row.map(cell => `<div class="cell">${cell}</div>`).join('')).join('')}
        </div>
        
        <div class="info-card">
            <div style="text-align: center;">🌟 Ruling Number 🌟</div>
            <div class="ruling">${loShu.rulingNumber}</div>
        </div>
        
        <div class="info-card">
            <h3>✨ Your Strengths ✨</h3>
            ${loShu.strengths.map(s => `<div class="strength-item"><strong>Number ${s.number}</strong> (appears ${s.count}x): ${s.meaning}</div>`).join('')}
            ${loShu.missingNumbers.length > 0 ? `<p style="margin-top:15px;"><strong>⚠️ Missing Numbers:</strong> ${loShu.missingNumbers.join(', ')} (areas to develop)</p>` : ''}
        </div>
        
        <h2 style="text-align:center; margin-top:30px;">🏮 Kua Number (Feng Shui)</h2>
        <div class="info-card">
            <div class="kua-badge">Kua ${kua.kua}</div>
            <p style="text-align:center; margin:10px 0;"><strong>${kua.group} Group</strong></p>
            <div class="directions">
                <div class="dir-card"><h4>💰 Success</h4><p>${kua.directions.success}</p></div>
                <div class="dir-card"><h4>💪 Health</h4><p>${kua.directions.health}</p></div>
                <div class="dir-card"><h4>💖 Romance</h4><p>${kua.directions.romance}</p></div>
                <div class="dir-card"><h4>🧘 Personal</h4><p>${kua.directions.personal}</p></div>
            </div>
        </div>
        
        <button onclick="window.print()">🖨️ Save as PDF / Print</button>
        <div class="footer">Generated by Shivanetra–V9 | Marduk™ Shield Active | AI-Enhanced Numerology | Dataset #2</div>
    </div>
</body>
</html>`;
}

// ============ API ENDPOINT ============
app.post('/api/calculate', (req, res) => {
    const { name, day, month, year, gender } = req.body;
    
    if (!name || !day || !month || !year || !gender) {
        return res.status(400).json({ error: 'Name, day, month, year, gender required' });
    }
    
    const d = parseInt(day), m = parseInt(month), y = parseInt(year);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return res.status(400).json({ error: 'Invalid date' });
    
    const loShu = calculateLoShuGrid(d, m, y);
    const kua = calculateKuaNumber(y, gender);
    
    // Store in DB
    db.run(`INSERT INTO users (name, day, month, year, gender, ruling_number, kua_number, kua_group, missing_numbers) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, d, m, y, gender, loShu.rulingNumber, kua.kua, kua.group, JSON.stringify(loShu.missingNumbers)]);
    
    updateAIPattern(loShu.missingNumbers, loShu.rulingNumber, kua.kua);
    
    const html = generateHTMLReport(loShu, kua, name, { day: d, month: m, year: y }, gender);
    
    res.json({ success: true, loShu, kua, downloadableHTML: html });
});

// ============ AI INSIGHTS ============
app.get('/api/insights', (req, res) => {
    db.all("SELECT key, value, frequency FROM ai_patterns ORDER BY frequency DESC LIMIT 20", (err, rows) => {
        res.json({ insights: rows || [] });
    });
});

// ============ FRONTEND ============
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shivanetra–V9 | Complete Numerology</title>
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
        input, select, button {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border-radius: 8px;
            border: none;
            font-size: 16px;
        }
        input, select { background: #2c2c4e; color: white; }
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
        .download-btn { background: #4caf50; color: white; margin-top: 10px; }
        .badge { text-align: center; font-size: 12px; color: #ffd700; margin-top: 20px; }
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(3, 60px);
            gap: 8px;
            justify-content: center;
            margin: 15px 0;
        }
        .preview-cell {
            width: 60px; height: 60px;
            background: rgba(255,215,0,0.2);
            border: 1px solid #ffd700;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔮 Shivanetra–V9 🔮</h1>
        <div class="card">
            <h3>Lo Shu Grid + Kua Number</h3>
            <input type="text" id="name" placeholder="Full Name">
            <div class="row">
                <input type="number" id="day" placeholder="Day">
                <input type="number" id="month" placeholder="Month">
                <input type="number" id="year" placeholder="Year">
            </div>
            <select id="gender">
                <option value="male">♂ Male</option>
                <option value="female">♀ Female</option>
            </select>
            <button onclick="calculate()">✨ Calculate Complete Report ✨</button>
            <div id="result" class="result"></div>
            <div class="badge">🛡️ Marduk™ Shield Active | Dataset #2 (Lo Shu + Kua)</div>
        </div>
    </div>

    <script>
        let currentHTML = '';
        
        async function calculate() {
            const name = document.getElementById('name').value;
            const day = document.getElementById('day').value;
            const month = document.getElementById('month').value;
            const year = document.getElementById('year').value;
            const gender = document.getElementById('gender').value;
            
            if (!name || !day || !month || !year) {
                alert('Please fill all fields');
                return;
            }
            
            const response = await fetch('/api/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, day: parseInt(day), month: parseInt(month), year: parseInt(year), gender })
            });
            
            const result = await response.json();
            
            if (result.success) {
                currentHTML = result.downloadableHTML;
                const grid = result.loShu.grid;
                
                const gridHtml = \`
                    <div style="background: rgba(0,0,0,0.5); border-radius: 15px; padding: 20px; margin-top: 20px;">
                        <h4>📊 Preview</h4>
                        <div class="preview-grid">
                            \${grid.map(row => row.map(cell => \`<div class="preview-cell">\${cell}</div>\`).join('')).join('')}
                        </div>
                        <p><strong>Ruling Number:</strong> \${result.loShu.rulingNumber}</p>
                        <p><strong>Kua Number:</strong> \${result.kua.kua} (\${result.kua.group} Group)</p>
                        <button class="download-btn" onclick="downloadHTML()">📥 Download Full HTML Report</button>
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
            link.download = \`shivanetra_report_\${name}.html\`;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    </script>
</body>
</html>
    `);
});

// ============ START ============
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║   SHIVANETRA–V9 | DATASET #2                        ║
║   ✅ Lo Shu Grid + Ruling Number                    ║
║   ✅ Kua Number + Auspicious Directions             ║
║   🛡️ Marduk Tier-1 Shield Active                   ║
║   📀 SQLite DB (accumulating user data)             ║
║   🧠 AI Pattern Learning (tracking frequencies)     ║
║   📥 Downloadable HTML Reports                      ║
║                                                    ║
║   🌐 http://localhost:${PORT}                       ║
╚══════════════════════════════════════════════════════╝
    `);
});
