export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'POST only' });
  const { message } = req.body;
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing on Vercel");

    const r = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are NaukriGPT, expert AI Career Coach for BCA students in India. Answer in Hinglish, short, friendly, helpful. Question: ${message}` }] }]
      })
    });
    const data = await r.json();
    console.log(JSON.stringify(data));
    if (data.error) throw new Error(data.error.message);
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini ne jawab nahi diya: " + JSON.stringify(data);
    res.status(200).json({ reply });
  } catch (e) {
    res.status(200).json({ reply: "DEBUG ERROR: " + e.message });
  }
}