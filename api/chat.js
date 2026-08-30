export default async function handler(req,res){
 res.setHeader('Access-Control-Allow-Origin','*');
 res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
 res.setHeader('Access-Control-Allow-Headers','Content-Type');
 if(req.method==='OPTIONS') return res.status(200).end();
 const {message}= (typeof req.body==='string'? JSON.parse(req.body):req.body) || {};
 const key=process.env.GEMINI_API_KEY?.trim();
 if(!key) return res.json({reply:"VERCEL ME KEY NAHI MILI!"});
 try{
   const url=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${key}`;
   const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:message}]}]})});
   const d=await r.json();
   if(d.error) return res.json({reply:"REAL ERROR: "+JSON.stringify(d.error)});
   const t=d.candidates?.[0]?.content?.parts?.[0]?.text;
   return res.json({reply:t||"No reply from Gemini: "+JSON.stringify(d)});
 }catch(e){ return res.json({reply:"CATCH ERROR: "+e.message}); }
}