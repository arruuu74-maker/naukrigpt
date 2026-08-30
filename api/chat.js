export default async function handler(req,res){
 res.setHeader('Access-Control-Allow-Origin','*');
 res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
 res.setHeader('Access-Control-Allow-Headers','Content-Type');
 if(req.method==='OPTIONS') return res.status(200).end();
 const {message}= (typeof req.body==='string'? JSON.parse(req.body):req.body) || {};
 const key=process.env.GEMINI_API_KEY?.trim();
 try{
  const models=["gemini-2.5-flash","gemini-1.5-flash","gemini-1.5-flash-latest","gemini-2.0-flash"];
  for(const m of models){
   const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:`You are NaukriGPT, BCA career expert. Reply in Hinglish, helpful, like ChatGPT. User: ${message}` }]}]})
   });
   const d=await r.json();
   const t=d.candidates?.[0]?.content?.parts?.[0]?.text;
   if(t) return res.json({reply:t});
  }
  return res.json({reply:"Bhai abhi thoda busy hai, 2 sec me fir puch!"});
 }catch(e){ return res.json({reply:"Network issue: "+e.message}); }
}