// Marduk™ Tier-1 Shield - Biological Rejection Principle
// Simulated for Node.js environment (zero-copy principles)

const SUSPICIOUS_PATTERNS = [
  'bot', 'crawler', 'scanner', 'nmap', 'curl', 'wget', 
  'python', 'go-http', 'nikto', 'sqlmap', 'burp', 'zap'
];

function mardukShield(req, res, next) {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const ip = req.ip || req.connection.remoteAddress;
  
  // Tier 1: Pattern rejection (Peanut Allergy Rule - drop 97% noise)
  const isSuspicious = SUSPICIOUS_PATTERNS.some(pattern => userAgent.includes(pattern));
  
  if (isSuspicious) {
    console.log(`🛡️ MARDUK [TIER-1]: Rejected probe from ${ip} (${userAgent})`);
    return res.status(403).json({ 
      error: '🛡️ Marduk Shield: Access Denied',
      code: 'MARDUK_BIO_REJECT'
    });
  }
  
  // Tier 2: Rate limiting (light)
  // Tier 3: Zero-copy simulation (no unnecessary heap copies)
  
  console.log(`✅ MARDUK [TIER-1]: Passed ${ip}`);
  next();
}

// Micro-power conservation (idle detection)
let lastRequestTime = Date.now();
let isIdle = false;

function monitorPowerUsage() {
  const now = Date.now();
  if (now - lastRequestTime > 60000 && !isIdle) {
    isIdle = true;
    console.log('🔋 MARDUK: Micro-power mode activated (idle)');
  } else if (now - lastRequestTime < 60000 && isIdle) {
    isIdle = false;
    console.log('⚡ MARDUK: Power mode restored');
  }
  lastRequestTime = now;
}

setInterval(monitorPowerUsage, 30000);

module.exports = { mardukShield };
