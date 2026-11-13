import {byId,dates} from './data.js';
export const reservationRules={
 palace:{lead:7,times:['20:00'],window:'參觀前 7 日',source:'https://www.dpm.org.cn/subject_booking/index.html',detail:'不售當日票；使用官方小程序或網站實名購票。'},
 national:{lead:7,times:['17:00'],window:'可提前 7 日預約',source:'https://en.chnmuseum.cn/visit_692/',detail:'冬季入館時段：09:00–11:00、11:00–13:30、13:30–16:00；周一休館。'},
 military:{lead:7,times:['08:00','17:00','20:00'],window:'可約 8 日內（含當日）',source:'https://wap.bjd.com.cn/news/2025/07/22/11242709.shtml',detail:'館方公告分三批放票，另有不定時回流票；周一休館，使用官方小程序預約。'},
 tiananmen:{lead:7,times:['17:00'],window:'參觀前 7 日',source:'https://xinwen.bjd.com.cn/content/s6abcd5bde4b0e42f8f0107f5.html',detail:'城樓與廣場分開預約。放票時間資料：北京日報 2026 年整理。'}
};
const checkIds=['badaling','mutianyu','summer','yuanming','tiantan','gongwang','lama','beihai'];
const subtract=(date,days)=>{const t=new Date(date+'T12:00:00+08:00');t.setUTCDate(t.getUTCDate()-days);return t.toISOString().slice(0,10)};
export const tenBefore=time=>{const [h,m]=time.split(':').map(Number),n=(h*60+m-10+1440)%1440;return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`};
export function reservationItems(plan){const out=[];plan.forEach((day,i)=>day.forEach(s=>{const a=byId[s.id],r=reservationRules[s.id];if(!a)return;
 if(r)out.push({id:s.id+'-'+i,title:a.name,date:subtract(dates[i].date,r.lead),visit:dates[i].short,times:r.times,time:r.times[0],kind:'放票時間',prepare:r.times.map(tenBefore),window:r.window,note:r.detail,url:a.official,source:r.source});
 else if(checkIds.includes(s.id))out.push({id:s.id+'-'+i,title:a.name,date:subtract(dates[i].date,7),visit:dates[i].short,times:['09:00'],time:'09:00',kind:'檢查提醒',prepare:['08:50'],window:s.id==='tiantan'?'可提前 1–7 日分時購票':'自行安排於參觀前一週檢查',note:'09:00 開啟購票平台，選擇參觀日期、票種及入場時段。',url:a.official||'https://www.bjgyol.com.cn/',source:s.id==='tiantan'?'https://www.bjgyol.com.cn/warn.html?itemId=10123&lang=ch':a.official});
 if(s.id==='badaling')out.push({id:'train-'+i,title:'清河 ↔ 八達嶺長城高鐵',date:subtract(dates[i].date,14),visit:dates[i].short,times:['09:00'],time:'09:00',kind:'查詢提醒',prepare:['08:50'],window:'一般預售 15 日（含購票當日）',note:'09:00 在 12306 選擇往返車次，查詢出發站起售時間，並訂閱起售提醒。',url:'https://www.12306.cn/index/',source:'https://www.highspeed.mtr.com.hk/sc/latest-news/ticketing-via-12306-purchase-ticket.html'});
 }));return out.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))}
