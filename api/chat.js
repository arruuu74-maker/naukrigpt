export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const body = typeof req.body === 'string'? JSON.parse(req.body) : req.body;
    const { message } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];
    let replyText = null;
    let lastError = "";

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
        });
        const data = await r.json();
        if (data.error) { lastError = data.error.message; continue; }
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) break;
      } catch (e) { lastError = e.message; }
    }

    if (!replyText) throw new Error(lastError || "No model worked");
    return res.status(200).json({ reply: replyText, text: replyText });
  } catch (e) {
    return res.status(200).json({ reply: "Error: " + e.message, text: "Error: " + e.message });
  }
}