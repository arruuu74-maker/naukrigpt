export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { message } = req.body;
    const key = process.env.GEMINI_API_KEY;

    // 1. Pehle available models ki list le le
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const list = await listRes.json();
    const model = list.models?.find(m => m.supportedGenerationMethods?.includes("generateContent"))?.name || "models/gemini-2.5-flash";
    const modelId = model.replace("models/","");

    // 2. Ab us model se answer le
    const genRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are NaukriGPT, helpful BCA career guide. Answer in Hinglish detailed: ${message}` }] }]
      })
    });
    const data = await genRes.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || `Error: ${JSON.stringify(data).slice(0,300)}`;

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(200).json({ reply: "Server Error: " + e.message });
  }
}