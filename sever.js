/**
 * Link2TV — Node.js Backend Server
 * ─────────────────────────────────
 * Enables real cross-device URL sharing (phone ↔ TV).
 *
 * SETUP:
 *   npm install express cors
 *   node server.js
 *
 * Then open index.html on both devices pointing to the same LAN IP.
 * Update SERVER_URL in index.html to: http://<your-local-ip>:3000
 */

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = 3000;

// ── In-memory store: { code → { url, createdAt } }
const store = new Map();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve index.html directly

// ── Ping (used by client to detect server)
app.get('/ping', (req, res) => res.json({ ok: true }));

// ── Set a URL for a code (called by phone)
app.post('/api/set', (req, res) => {
  const { code, url } = req.body;
  if (!code || !url) return res.status(400).json({ error: 'code and url required' });
  if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: 'code must be 6 digits' });
  try { new URL(url); } catch (_) { return res.status(400).json({ error: 'invalid url' }); }

  store.set(code, { url, createdAt: Date.now() });
  console.log(`[SET] code=${code} url=${url}`);
  res.json({ ok: true });
});

// ── Get the URL for a code (polled by TV)
app.get('/api/get/:code', (req, res) => {
  const { code } = req.params;
  const entry = store.get(code);

  if (!entry) return res.json({ url: null });

  // Expire old entries
  if (Date.now() - entry.createdAt > TTL_MS) {
    store.delete(code);
    return res.json({ url: null });
  }

  res.json({ url: entry.url });
});

// ── Clear a code after the TV has consumed it
app.delete('/api/clear/:code', (req, res) => {
  store.delete(req.params.code);
  res.json({ ok: true });
});

// ── Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of store.entries()) {
    if (now - entry.createdAt > TTL_MS) store.delete(code);
  }
}, 60_000);

app.listen(PORT, '0.0.0.0', () => {
  const nets = require('os').networkInterfaces();
  const ips = Object.values(nets).flat()
    .filter(n => n.family === 'IPv4' && !n.internal)
    .map(n => n.address);

  console.log(`\n🚀 Link2TV server running!\n`);
  console.log(`   Local:   http://localhost:${PORT}`);
  ips.forEach(ip => console.log(`   Network: http://${ip}:${PORT}`));
  console.log(`\n📱 On your phone, open one of the Network URLs above.`);
  console.log(`📺 On your TV,    open the same URL.\n`);
  console.log(`   Also update SERVER_URL in index.html to your Network IP.\n`);
});
