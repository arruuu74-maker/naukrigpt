export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // Check key
  if (!apiKey) return res.json({ reply: "KEY HI NAHI HAI VERCEL ME" });

  // List models - asli sach batayega
  const listRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
  const listData = await listRes.json();

  if (listData.error) {
    return res.json({ reply: `KEY ERROR: ${listData.error.message}. Nayi key banao aistudio.google.com se` });
  }

  // Working model lelo
  const firstModel = listData.models?.find(m => m.supportedGenerationMethods?.includes("generateContent"))?.name || "models/gemini-1.5-flash";
  const modelName = firstModel.replace("models/","");

  const genRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: `BCA career expert, answer in hinglish: ${body.message}` }] }] })
  });
  const genData = await genRes.json();
  const text = genData.candidates?.[0]?.content?.parts?.[0]?.text;
  
  return res.json({ reply: text || `MODEL ERROR: ${JSON.stringify(genData).slice(0,300)}` });
}