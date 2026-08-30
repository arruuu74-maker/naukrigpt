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
  if (!apiKey) return res.status(200).json({ reply: "API Key Vercel me set nahi hai!" });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are NaukriGPT - BCA career expert. Reply in Hinglish, friendly, helpful. Question: ${message}` }] }]
        })
      }
    );
    const data = await response.json();
    if (data.error) return res.status(200).json({ reply: `Gemini Error: ${data.error.message}` });
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Samjha nahi bhai, fir se puch!";
    return res.status(200).json({ reply, text: reply });
  } catch (err) {
    return res.status(200).json({ reply: "Network issue: " + err.message });
  }
}