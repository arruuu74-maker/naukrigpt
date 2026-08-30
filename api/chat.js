export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const body = typeof req.body === 'string'? JSON.parse(req.body) : req.body;
    const { message } = body;
    const apiKey = process.env.GEMINI_API_KEY;
    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-001"];
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
        });
        const data = await r.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return res.status(200).json({ reply: text, text: text });
      } catch (e) {}
    }
    const msg = (message || "").toLowerCase();
    let fallback = "";
    if (msg.includes("bca") || msg.includes("course") || msg.includes("mca")) {
      fallback = "BCA ke baad best: \n1. MCA (most popular)\n2. Full Stack MERN (6 month me job)\n3. Data Science / AI\n4. Cloud (AWS)\n\nTujhe coding pasand hai ya management?";
    } else if (msg.includes("resume")) {
      fallback = "Resume me ye daal: 2 Projects, Skills (Java/React/Python), Internship, GitHub link. 1 page ka rakhna, simple design.";
    } else if (msg.includes("interview")) {
      fallback = "Interview me OOPS, DBMS, 1 Project aur 2 DSA questions pakke puchte hain. Daily 2 LeetCode easy kar.";
    } else {
      fallback = `Tune pucha: "${message}"\n\nMain NaukriGPT hu! BCA, Resume, Interview, Roadmap - kuch bhi puch le bhai, main yahin hu!`;
    }
    return res.status(200).json({ reply: fallback, text: fallback });
  } catch (e) {
    return res.status(200).json({ reply: "Hi Chiraag! Main NaukriGPT hu, bolo kya help chahiye?", text: "Hi Chiraag! Main NaukriGPT hu, bolo kya help chahiye?" });
  }
}