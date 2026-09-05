// api/analyze.js — AI Resume Analyzer backend (Vercel Serverless Function)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resumeText, targetRole } = req.body || {};
  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({ error: 'Resume text bahut chhota hai. Kam se kam 50 characters paste kar.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY set nahi hai. Vercel me Environment Variables check kar.' });
  }

  const role = (targetRole || 'general').trim();

  const prompt = `Tu ek expert HR recruiter + ATS specialist hai. Neeche diye gaye resume ka deep analysis kar aur sirf valid JSON me jawab de. Koi extra text mat likh, sirf JSON.

Target job role: "${role}"

Resume:
"""
${resumeText.slice(0, 6000)}
"""

JSON format (exact keys use kar):
{
  "atsScore": number (0-100),
  "verdict": "1 line me overall verdict (Hindi/Hinglish me)",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "missingKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "improvements": [
    {"issue": "problem kya hai", "fix": "kaise fix kare"},
    {"issue": "problem kya hai", "fix": "kaise fix kare"},
    {"issue": "problem kya hai", "fix": "kaise fix kare"},
    {"issue": "problem kya hai", "fix": "kaise fix kare"}
  ],
  "suggestedSkills": ["skill 1", "skill 2", "skill 3"]
}

Rules:
- verdict, issue, fix — Hinglish me likh (jaise "Bhai tera summary section missing hai")
- atsScore realistic de: achhe resume ko 75-90, average ko 50-70, weak ko 30-50
- missingKeywords target role ke hisaab se de
- sirf JSON output, koi markdown ya extra text nahi`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: