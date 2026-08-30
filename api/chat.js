export default async function handler(req, res) {
  // CORS Fix
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = typeof req.body === 'string'? JSON.parse(req.body) : req.body;
  const { message } = body || {};
  if (!message) return res.status(400).json({ error: 'Message required' });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return res.status(200).json({ reply: "API Key Vercel me set nahi hai!" });

  try {
    // LATEST MODEL - 2026 working
    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `You are NaukriGPT - Expert for BCA students in India. Answer in Hinglish, friendly, concise, helpful with roadmap, skills, jobs. Question: ${message}` }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: `Error: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ reply: reply || "Bhai samjha nahi, fir se pucho!", text: reply });

  } catch (err) {
    return res.status(200).json({ reply: "Thoda network issue hai, 2 sec baad try kar bhai! " + err.message });
  }
}