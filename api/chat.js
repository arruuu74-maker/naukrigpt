export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(200).json({ reply: "Bolo bhai kya help chahiye?" });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(200).json({ reply: "ERROR: GROQ_API_KEY Vercel me add nahi hai." });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are NaukriGPT, expert career counsellor for BCA students in India. Reply in Hinglish (Hindi + English), detailed, point-wise, helpful like ChatGPT. Use emojis lightly."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await groqRes.json();

    if (!data.choices) {
      return res.status(200).json({ reply: "Groq Error: " + JSON.stringify(data).slice(0, 400) });
    }

    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });

  } catch (err) {
    return res.status(200).json({ reply: "Server Error: " + err.message });
  }
}