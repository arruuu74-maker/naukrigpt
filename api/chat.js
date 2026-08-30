export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'POST only' });
  const { message } = req.body;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are NaukriGPT, expert AI Career Coach for BCA students in India. Answer in Hinglish, short, friendly. Question: ${message}` }] }]
      })
    });
    const data = await r.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Thoda wait kar, dubara puch!";
    res.status(200).json({ reply });
  } catch (e) {
    res.status(500).json({ reply: "Error: " + e.message });
  }
}
