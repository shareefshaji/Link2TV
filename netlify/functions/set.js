const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch (_) { return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const { code, url } = body;

  if (!code || !/^\d{6}$/.test(code)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'code must be 6 digits' }) };
  }
  try { new URL(url); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid url' }) };
  }

  const store = getStore('link2tv');
  // Store with 5-minute TTL
  await store.setJSON(code, { url, createdAt: Date.now() }, { ttl: 300 });

  console.log(`[SET] code=${code} url=${url}`);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true })
  };
};
