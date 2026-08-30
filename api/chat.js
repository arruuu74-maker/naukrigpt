export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const body = typeof req.body === 'string'? JSON.parse(req.body) : req.body;
    const { message } = body;
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
    });
    const data = await r.json();
    if (data.error) throw new Error(data.error.message);
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sahi se bolo bhai!";
    return res.status(200).json({ reply: replyText, text: replyText });
  } catch (e) {
    return res.status(200).json({ reply: "Error: " + e.message, text: "Error: " + e.message });
  }
}