export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(200).json({ reply: "Bolo bhai?" });

    const groqKey = process.env.GROQ_API_KEY;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        temperature: 0.7,
        messages: [
          { role: "system", content: "You are NaukriGPT, expert BCA career counsellor. Reply in Hinglish detailed." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content || "Groq Error: " + JSON.stringify(data).slice(0,500);
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(200).json({ reply: "Error: " + err.message });
  }
}