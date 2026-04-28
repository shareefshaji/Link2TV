const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;

  if (!code || !/^\d{6}$/.test(code)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'code must be 6 digits' }) };
  }

  const store = getStore('link2tv');
  const entry = await store.getJSON(code).catch(() => null);

  if (!entry) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: null })
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: entry.url })
  };
};
