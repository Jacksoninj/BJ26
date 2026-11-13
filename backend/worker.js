const OWNER_PATH='/admin';
const allowedOrigin='https://jacksoninj.github.io';
const areas=['王府井／燈市口','東四／南鑼鼓巷','前門／珠市口','東直門／三里屯','未決定'];
const hotels=['漢庭隆福寺東四店','北京麗亭酒店','北京飯店諾金','未決定'];
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
const page=(body,status=200)=>new Response(body,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"}});
const owner=(req,env)=>Boolean(env.OWNER_EMAIL)&&req.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.OWNER_EMAIL.toLowerCase();
export function validate(b){
 if(!b||typeof b!=='object'||!/^[-a-zA-Z0-9]{16,64}$/.test(b.id||''))return false;
 if(typeof b.nickname!=='string'||!b.nickname.trim()||b.nickname.length>60||!areas.includes(b.area)||!['輕鬆','適中','充實'].includes(b.pace)||!['國家博物館','軍事博物館','兩個都想去','未決定'].includes(b.museum)||typeof b.notes!=='string'||b.notes.length>1200)return false;
 if(!Number.isInteger(b.budget)||b.budget<300||b.budget>2500||b.budget%50!==0||typeof b.attachPlan!=='boolean')return false;
 return Array.isArray(b.plan)&&b.plan.length===(b.attachPlan?7:0)&&b.plan.every(d=>Array.isArray(d)&&d.length<=15&&d.every(x=>x&&typeof x.id==='string'&&x.id.length<40&&typeof x.name==='string'&&x.name.length<80&&['早上','下午','晚上'].includes(x.slot)&&Number.isInteger(x.duration)&&x.duration>=15&&x.duration<=480));
}
const head='<!doctype html><html lang="zh-HK"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BJ26 私人後台</title><style>:root{color-scheme:light dark}body{font:17px/1.65 system-ui;max-width:1100px;margin:auto;padding:24px;background:light-dark(#f5f6f8,#151719);color:light-dark(#17232d,#eff3f7)}button,a{display:inline-block;min-height:44px;padding:8px 16px;border-radius:12px}article{background:light-dark(white,#24292e);padding:24px;margin:20px 0;border-radius:20px;overflow-wrap:anywhere}h1{font-size:32px}small{display:block}pre{white-space:pre-wrap}a{color:light-dark(#175386,#9bceff)}:focus-visible{outline:3px solid #d37735;outline-offset:4px}</style>';
const dashboard=head+`<h1>旅伴的想法</h1><p>私人後台 · 只有擁有人可查看。問卷提交後會自動儲存於資料庫。</p><button id="reload">重新整理</button> <button id="export">匯出 CSV</button><p id="status" role="status">讀取中…</p><main id="answers"></main><button id="more" hidden>載入更多</button><script>
let rows=[],offset=0;const status=document.querySelector('#status');const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function load(reset=true){if(reset){rows=[];offset=0}try{const r=await fetch('/api/responses?offset='+offset);if(!r.ok)throw Error('未能讀取，請確認你已用擁有人帳戶登入。');const data=await r.json();rows.push(...data.rows);offset=rows.length;status.textContent='已載入 '+rows.length+' 份回答';document.querySelector('#more').hidden=!data.hasMore;document.querySelector('#answers').innerHTML=rows.length?rows.map(r=>'<article><h2>'+esc(r.nickname)+'</h2><small>'+esc(new Date(r.created_at).toLocaleString('zh-HK',{timeZone:'Asia/Hong_Kong'}))+'</small><p>'+esc(r.area)+'</p><p>節奏：'+esc(r.pace)+' · 博物館：'+esc(r.museum)+'</p><p>預算：HK$'+esc(r.budget)+'／房／晚 · 六晚約 HK$'+esc(r.budget*6)+'</p><p>'+esc(r.notes)+'</p><details><summary>自訂行程（'+(r.attached?'已附上':'未附上')+'）</summary>'+JSON.parse(r.plan).map((d,i)=>'<h3>12 月 '+(20+i)+' 日</h3><p>'+d.map(s=>esc(s.slot+' · '+s.name+'（'+s.duration+' 分鐘）')).join('<br>')+'</p>').join('')+'</details></article>').join(''):'<p>暫未收到回答。朋友完成問卷後會在這裏出現。</p>'}catch(e){status.textContent=e.message}}
document.querySelector('#reload').onclick=()=>load();document.querySelector('#more').onclick=()=>load(false);document.querySelector('#export').onclick=()=>{const fields=['created_at','nickname','area','pace','museum','notes','budget','attached','plan'];const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';const csv='\\ufeff'+[fields,...rows.map(r=>fields.map(f=>r[f]))].map(r=>r.map(cell).join(',')).join('\\r\\n');const u=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='BJ26-answers.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};load();
</script></html>`;
export default {async fetch(req,env){
 const url=new URL(req.url),path=url.pathname,origin=req.headers.get('Origin');
 const cors=origin===allowedOrigin?{'Access-Control-Allow-Origin':allowedOrigin,'Vary':'Origin'}:{};
 try{
 if(path==='/api/health')return json({ready:Boolean(env.DB&&env.OWNER_EMAIL)},200,cors);
 if(path==='/api/submit'){
 if(req.method==='OPTIONS')return new Response(null,{status:origin===allowedOrigin?204:403,headers:{...cors,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
 if(req.method!=='POST')return json({error:'Method not allowed'},405,cors);
 if(origin!==allowedOrigin&&origin!==url.origin)return json({error:'Origin not allowed'},403);
 if(!req.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required'},415,cors);
 if(Number(req.headers.get('Content-Length')||0)>40000)return json({error:'內容太長'},413,cors);
 const reader=req.body?.getReader();if(!reader)return json({error:'缺少內容'},400,cors);let size=0,parts=[];while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>40000){await reader.cancel();return json({error:'內容太長'},413,cors)}parts.push(value)}const bytes=new Uint8Array(size);let at=0;for(const p of parts){bytes.set(p,at);at+=p.length}let b;try{b=JSON.parse(new TextDecoder().decode(bytes))}catch{return json({error:'內容格式錯誤'},400,cors)}
 if(!validate(b)||b.website)return json({error:'請檢查姓名及問卷選項'},400,cors);
 const old=await env.DB.prepare('SELECT id FROM responses WHERE id = ?').bind(b.id).first();if(old)return json({saved:true,id:b.id},200,cors);
 const day=new Date().toISOString().slice(0,10);const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode((env.RATE_SALT||'')+day+(req.headers.get('CF-Connecting-IP')||'unknown')));const hash=Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,'0')).join('');
 const count=await env.DB.prepare('SELECT COUNT(*) AS n FROM responses WHERE ip_hash = ?').bind(hash).first();if(count.n>=30)return json({error:'今日提交較多，請稍後再試'},429,cors);
 await env.DB.prepare('INSERT INTO responses (id,created_at,nickname,area,hotel,pace,museum,notes,plan,ip_hash,budget,attached) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(b.id,new Date().toISOString(),b.nickname.trim(),b.area,'',b.pace,b.museum,b.notes,JSON.stringify(b.plan),hash,b.budget,b.attachPlan?1:0).run();
 return json({saved:true,id:b.id},201,cors);
 }
 if(path==='/api/responses'){
 if(!owner(req,env))return json({error:'Forbidden'},403);
 if(req.method!=='GET')return json({error:'Method not allowed'},405);
 const offset=Math.min(100000,Math.max(0,parseInt(url.searchParams.get('offset')||'0')||0));const result=await env.DB.prepare('SELECT id,created_at,nickname,area,hotel,pace,museum,notes,plan,budget,attached FROM responses ORDER BY created_at DESC LIMIT 101 OFFSET ?').bind(offset).all();return json({rows:result.results.slice(0,100),hasMore:result.results.length>100});
 }
 if(path===OWNER_PATH){if(!owner(req,env))return page(head+'<h1>私人回答後台</h1><p>只供網站擁有人查看。訪客填問卷毋須登入。</p><a target="_top" href="/signin-with-chatgpt?return_to=/admin">以擁有人帳戶開啟</a></html>',403);return page(dashboard)}
 return page(head+'<h1>BJ26 問卷服務</h1><p>回答只供行程負責人查看。</p><a href="https://jacksoninj.github.io/BJ26/">返回北京行程</a></html>');
 }catch{return json({error:'暫時未能儲存，請保留此頁稍後再試。'},503,cors)}
}};
