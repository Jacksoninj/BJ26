const ORIGIN='https://jacksoninj.github.io';
const BACKEND='https://bj26-travel-responses.lghplot.chatgpt.site';
export default {async fetch(req,env){const url=new URL(req.url),origin=req.headers.get('Origin');const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(origin===ORIGIN?{'Access-Control-Allow-Origin':ORIGIN,Vary:'Origin'}:{})};const json=(body,status)=>new Response(JSON.stringify(body),{status,headers});
if(url.pathname==='/api/health')return json({ready:Boolean(env.PRIVATE_SERVICE_TOKEN)},200);
if(url.pathname!=='/api/submit')return json({error:'Not found'},404);
if(req.method==='OPTIONS')return new Response(null,{status:origin===ORIGIN?204:403,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
if(req.method!=='POST')return json({error:'Method not allowed'},405);
if(origin!==ORIGIN)return json({error:'Origin not allowed'},403);
if(!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required'},415);
if(!req.body)return json({error:'Missing body'},400);const reader=req.body.getReader();let size=0,parts=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>40000){await reader.cancel();return json({error:'內容太長'},413)}parts.push(value)}const bytes=new Uint8Array(size);let at=0;for(const p of parts){bytes.set(p,at);at+=p.length}
if(!env.PRIVATE_SERVICE_TOKEN)return json({error:'服務未設定'},503);
try{const upstream=await fetch(BACKEND+'/api/submit',{method:'POST',redirect:'manual',headers:{'Content-Type':'application/json','Origin':ORIGIN,'OAI-Sites-Authorization':'Bearer '+env.PRIVATE_SERVICE_TOKEN},body:bytes});if(upstream.status>=300&&upstream.status<400)return json({error:'服務連接未完成'},503);const data=await upstream.json();return json(data,upstream.status)}catch{return json({error:'暫未能儲存，請稍後重試'},503)}
}};
