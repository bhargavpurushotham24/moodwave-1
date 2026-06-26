// Vercel serverless function — keeps the Gemini API key server-side.
// The frontend (index.html) calls this route instead of calling Google directly.
// Set GEMINI_API_KEY as an environment variable in your Vercel project settings —
// never put it in index.html or commit it to GitHub.
//
// Get a free key (no credit card needed) at https://aistudio.google.com/apikey

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Server is missing GEMINI_API_KEY. Add it in your Vercel project settings under Environment Variables.'
    });
    return;
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1500, temperature: 0.85 }
        })
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      res.status(geminiRes.status).json({ error: errBody });
      return;
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n') || '';
    if (!text) {
      res.status(502).json({ error: 'Gemini returned no usable text — it may have blocked the response.' });
      return;
    }
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
