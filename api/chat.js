export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const body = typeof req.body === 'string'? JSON.parse(req.body) : req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return res.json({ reply: "Vercel me KEY nahi hai" });

  // Ab ke new users ke liye jo chalta hai
  const MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b"
  ];

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are NaukriGPT, BCA career expert. Answer in Hinglish, detailed: ${body.message}` }] }]
        })
      });
      const data = await r.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.json({ reply: text });
    } catch (e) { continue; }
  }
  return res.json({ reply: "Sab models fail. Nayi key banao aistudio.google.com se." });
}