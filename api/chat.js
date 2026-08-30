export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string'? JSON.parse(req.body) : req.body;
  const { message } = body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return res.status(200).json({ reply: "Vercel me GEMINI_API_KEY nahi mili!" });

  // 2025-2026 ke 100% working models
  const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-exp"];

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are NaukriGPT - friendly BCA career guide. Answer in Hinglish (Hindi+English mix), helpful, detailed like ChatGPT. Question: ${message}` }] }],
        }),
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return res.status(200).json({ reply: text });
      }
      // agar error aaya to next model try karega
      if(data.error) console.log(model + " failed: " + data.error.message);
    } catch (e) {
      console.log("Catch: " + e.message);
      continue;
    }
  }

  return res.status(200).json({ reply: "Bhai API thoda down hai, 10 sec baad fir se try kar. (Key check kar le Vercel me)" });
}