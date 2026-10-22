(() => {
 'use strict';
 // Routine calendar: a sortable three-column routine list above a Monday-to-Sunday week.
 // Every scheduled routine owns one fixed track inside each day, ordered by its first run
 // of the day, so the same routine always sits at the same x. A run of frequent fires is
 // one icon plus a thin rail with a tick per fire, instead of a wall of repeated icons.
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const DAYS=['M','T','W','TH','F','SA','SU'],WEEK=['MON','TUE','WED','THU','FRI','SAT','SUN'],GOLD='#d99a1f';
 const hash=s=>[...s].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,7).toString(36),sid=r=>'routine-svg-'+hash(r.id);
 // One agent sprite (the Robo mascot) marks each routine's owner; the owner's name comes from its source.
 const ROBO=[[0,0,1,0],[1,1,1,1],[1,1,1,1],[1,0,1,1],[1,1,1,1],[1,1,1,1],[1,0,0,1],[0,0,0,0]];
 const pixel=rows=>rows.map(r=>[...r,...r.toReversed()]).map((row,y)=>row.map((on,x)=>on?'M'+x+' '+y+'h1v1h-1Z':'').join('')).join('');
 const ownerName=r=>(r&&(r.sourceLabel||r.platform))||'Agent';
 function owner(r){const name=esc(ownerName(r));return '<svg class="owner-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" fill="#ff6b1a" role="img" aria-label="'+name+'"><title>'+name+'</title><path d="'+pixel(ROBO)+'"/></svg>'}
 const compact=n=>Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(n||0);
 const dollars=n=>n>=.1?'$'+n.toFixed(2):n>=.01?'$'+n.toFixed(3):n>0?'<$0.01':'$0';
 const clock=m=>{const h=Math.floor(m/60)%24,mm=m%60;return (h%12||12)+(mm?':'+String(mm).padStart(2,'0'):'')+(h<12?' am':' pm')};
 const status=r=>r.paused?'paused':r.enabled===true?'active':'ondemand';
 const STATUS={active:'Active',ondemand:'On demand',paused:'Paused'};
 let filter='active',sort='time',direction=1,selected=null,rows=[],events=[],ui=null,firstFire=new Map(),occ=[],lastData=null;
 let firesWeek=new Map();
 function index(D){if(lastData===D)return;lastData=D;occ=D.calendar.occurrences.filter(o=>o.enabled!==false);firstFire=new Map();firesWeek=new Map();for(const o of occ){const t=o.startMinutes;if(!firstFire.has(o.routineId)||t<firstFire.get(o.routineId))firstFire.set(o.routineId,t);firesWeek.set(o.routineId,(firesWeek.get(o.routineId)||0)+1)}}
 // Tokens and API $ are what your usage log or your agent's session logs measured in the last 7 days
 // (refresh/usage.mjs, no model calls). A routine with no measured runs says "not measured": nothing is estimated.
 const USAGE=window.ARMS_USAGE?.routines||{},MEASURING=!!window.ARMS_USAGE?.measured?.routines;
 const measured=r=>{const m=USAGE[r.id];return m&&m.runs30>0?m:null};
 const week=r=>{const n=firesWeek.get(r.id)||0,m=measured(r);
  if(m)return{runs:m.runs7,scheduled:n,tokens:m.tok7,credits:m.cost7,perRun:m.perRunTok,perRunCost:m.perRunCost,measured:true};
  return{runs:0,scheduled:n,tokens:0,credits:0,perRun:0,perRunCost:0,measured:false}};
 const weekBasis=r=>{const w=week(r);
  if(w.measured)return (w.runs?w.runs+' runs in the last 7 days, measured.':'No runs in the last 7 days.')+' About '+compact(w.perRun)+' tokens ('+dollars(w.perRunCost)+') per run over 30 days.';
  return 'Not measured. USAGE.md shows how to log this routine\'s runs.'};
 const counts=D=>{const c={active:0,ondemand:0,paused:0,all:0};for(const r of D.calendar.routines){c[status(r)]++;c.all++}return c};
 function controls(container,D,render,helpers){
  ui=helpers;index(D);const c=counts(D);
  const seg=(key,label)=>'<button data-filter="'+key+'" aria-pressed="'+(filter===key)+'">'+label+' <b>'+c[key]+'</b></button>';
  const sorter=(key,label)=>'<button data-sort="'+key+'" aria-pressed="'+(sort===key)+'">'+label+(sort===key?'<i aria-hidden="true">'+(direction===1?'↑':'↓')+'</i>':'')+'</button>';
  let mt=0,mc=0;for(const r of D.calendar.routines){const w=week(r);if(w.measured){mt+=w.tokens;mc+=w.credits}}
  container.innerHTML='<div class="cal-seg" role="group" aria-label="Show">'+seg('active','Active')+seg('ondemand','On demand')+seg('paused','Paused')+seg('all','All')+'</div><span class="spacer"></span><span class="cal-week" title="Routine runs measured from your usage log or your agent\'s session logs in the last 7 days. Routines with no measured runs say not measured.">LAST 7 DAYS '+(MEASURING?'<b>'+compact(mt)+'</b> tokens <b>'+dollars(mc)+'</b> API':'<b>not measured</b>')+'</span><span class="spacer"></span><div class="cal-seg cal-sort" role="group" aria-label="Sort by"><span>Sort</span>'+sorter('time','Time')+sorter('name','Name')+sorter('owner','Owner')+sorter('days','Days')+sorter('tokens','Tokens')+sorter('credits','API $')+'</div>';
  container.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render()});
  container.querySelectorAll('[data-sort]').forEach(b=>b.onclick=()=>{if(sort===b.dataset.sort)direction*=-1;else{sort=b.dataset.sort;direction=['tokens','credits','days'].includes(sort)?-1:1}render()});
  if(!D.calendar.routines.length)container.insertAdjacentHTML('beforeend','<span class="cal-empty">No routines yet. ROUTINES.md shows how your agent lists them.</span>');
 }
 function score(r){return sort==='name'?r.title.toLowerCase():sort==='owner'?ownerName(r).toLowerCase()+r.title.toLowerCase():sort==='days'?(r.days?.length||0):sort==='tokens'?week(r).tokens:sort==='credits'?week(r).credits:(firstFire.get(r.id)??1e9)}
 function ordered(list){return list.toSorted((a,b)=>{const x=score(a),y=score(b),v=typeof x==='string'?x.localeCompare(y):x-y;return direction*v||a.title.localeCompare(b.title)})}
 function entry(r,i){
  const st=status(r),on=new Set(r.days||[]),w=week(r),none='<span class="cost-muted">–</span>';
  const tokens=w.measured?compact(w.tokens)+' tok/wk':'<span class="cost-muted">not measured</span>',credits=w.measured?dollars(w.credits)+'/wk':none;
  return '<button class="routine-entry is-'+st+(r.id===selected?' selected':'')+'" data-row="'+i+'" data-id="'+esc(r.id)+'"><span class="routine-glyph"><svg viewBox="0 0 48 48" aria-hidden="true"><use href="#'+sid(r)+'"/></svg></span><span class="routine-name">'+esc(r.title)+'</span>'+owner(r)+'<span class="routine-days" aria-label="Runs on '+(r.days?.length?r.days.map(d=>WEEK[d]).join(', '):'no fixed days')+'">'+DAYS.map((d,j)=>'<span class="routine-day'+(on.has(j)?' on':'')+'">'+d+'</span>').join('')+'</span><span class="routine-cost'+(w.measured?' is-measured':'')+'" title="'+esc(weekBasis(r))+'"><span>'+tokens+'</span><span>'+credits+'</span></span></button>';
 }
 function list(container,D){
  index(D);const all=D.calendar.routines;let html='';rows=[];
  const groups=filter==='all'?['active','ondemand','paused']:[filter];
  for(const g of groups){const items=ordered(all.filter(r=>status(r)===g));if(!items.length)continue;if(filter==='all')html+='<div class="routine-section">'+STATUS[g]+' <b>'+items.length+'</b></div>';for(const r of items){html+=entry(r,rows.length);rows.push(r)}}
  container.innerHTML=html;
  if(selected&&!rows.some(r=>r.id===selected))selected=null;
  // Show whole rows only: the list stops on a row edge and scrolls inside when it is long.
  container.style.height='auto';const cap=Math.max(150,innerHeight*.4),natural=container.scrollHeight;let fit=natural;
  if(natural>cap){fit=0;for(const el of container.children){const bottom=el.offsetTop-container.offsetTop+el.offsetHeight;if(bottom<=cap)fit=Math.max(fit,bottom)}}
  container.style.height=fit+'px';container.classList.toggle('scrolls',natural>fit);
  container.querySelectorAll('[data-row]').forEach(b=>{const r=rows[+b.dataset.row];b.onpointerenter=e=>{focus(r.id,true);ui.tip(e,summary(r))};b.onpointermove=e=>ui.tip(e,summary(r));b.onpointerleave=()=>{focus(null,true);ui.hide()};b.onclick=e=>{select(r.id);ui.open(e,r)}});
 }
 function focus(id,fromList){const v=document.getElementById('view');if(!v)return;const target=id||selected;v.classList.toggle('has-focus',!!target);v.querySelectorAll('.routine-run').forEach(el=>el.classList.toggle('hot',el.dataset.id===target));document.querySelectorAll('.routine-entry').forEach(el=>el.classList.toggle('hot',!fromList&&!!id&&el.dataset.id===id))}
 function select(id){selected=selected===id?null:id;document.querySelectorAll('.routine-entry').forEach(el=>el.classList.toggle('selected',el.dataset.id===selected));focus(null)}
 function when(r){
  const mine=occ.filter(o=>o.routineId===r.id);if(!mine.length)return r.paused?'Paused, no runs this week':r.enabled===true?'No runs this week':'On demand';
  const byDay=new Map();for(const o of mine){if(!byDay.has(o.day))byDay.set(o.day,[]);byDay.get(o.day).push(o.startMinutes)}
  const sample=[...byDay.values()][0].sort((a,b)=>a-b),runs=runsOf(sample),days=[...byDay.keys()].sort();
  const dayText=days.length===7?'Every day':days.map(d=>WEEK[d][0]+WEEK[d].slice(1).toLowerCase()).join(', ');
  const timeText=sample.length===24&&runs.length===1?'every hour':runs.map(run=>run.length===1?clock(run[0]):run.length+' runs '+clock(run[0])+' to '+clock(run.at(-1))).join(', ');
  return dayText+' · '+timeText;
 }
 function usageLine(r){const w=week(r);if(w.measured)return w.runs?compact(w.tokens)+' tokens · '+dollars(w.credits)+' API in the last 7 days ('+w.runs+' runs, measured)':'No runs in the last 7 days · '+compact(w.perRun)+' tokens per run (measured)';return 'Tokens and API $: not measured'}
 function summary(r){return '<b>'+esc(r.title)+'</b><small>'+esc(ownerName(r))+' · '+STATUS[status(r)]+'</small><p>'+esc(when(r))+'</p><small>'+usageLine(r)+'</small>'}
 function details(r){const on=new Set(r.days||[]),w=week(r),m=w.measured,nm='Not measured';
  return '<div class="pop-owner">'+owner(r)+'<span>'+esc(ownerName(r))+' · '+STATUS[status(r)]+'</span></div><dl><dt>When</dt><dd>'+esc(when(r))+'</dd><dt>Schedule</dt><dd>'+esc(r.scheduleText||'')+'</dd><dt>Days</dt><dd class="pop-days">'+DAYS.map((d,j)=>'<span class="'+(on.has(j)?'on':'')+'">'+d+'</span>').join('')+'</dd><dt>Runs, last 7 days</dt><dd>'+(m?w.runs+(w.scheduled!==w.runs?' of '+w.scheduled+' scheduled':''):nm)+'</dd><dt>Tokens, last 7 days</dt><dd>'+(m?compact(w.tokens)+' ('+compact(w.perRun)+' per run)':nm)+'</dd><dt>API $, last 7 days</dt><dd>'+(m?dollars(w.credits)+' ('+dollars(w.perRunCost)+' per run)':nm)+'</dd><dt>Source</dt><dd>'+esc(r.source||'')+(r.sourceAsOf?', saved '+new Date(r.sourceAsOf).toLocaleDateString(undefined,{day:'numeric',month:'short'}):'')+'</dd></dl>'+(r.summary?'<p class="pop-summary">'+esc(r.summary)+(r.summary.length>=295&&!/[.!?]$/.test(r.summary)?'…':'')+'</p>':'')+'<small>'+esc(weekBasis(r))+'</small>'}
 function runsOf(times){const runs=[];for(const t of times){const run=runs.at(-1);if(run&&t-run.at(-1)<=60)run.push(t);else runs.push([t])}return runs}
 function layout(D,W,H){
  index(D);const byId=new Map(D.calendar.routines.map(r=>[r.id,r])),parts=[],nodes=[];events=[];
  const scheduled=[...new Set(occ.map(o=>o.routineId))].map(id=>byId.get(id)).filter(r=>r&&r.enabled===true).sort((a,b)=>firstFire.get(a.id)-firstFire.get(b.id)||a.title.localeCompare(b.title));
  const top=12,left=50,right=W-12,dayW=(right-left)/7,hourH=Math.max(14,Math.min(46,((H||560)-top-8)/24)),height=top+24*hourH+4;
  const pad=8,tracks=Math.max(1,scheduled.length),trackW=Math.min(30,(dayW-pad*2)/tracks),icon=Math.max(10,Math.min(18,trackW-.5,hourH-2)),trackX=new Map(scheduled.map((r,i)=>[r.id,i]));
  const xOf=(day,id)=>left+day*dayW+pad+(trackX.get(id)+.5)*trackW,yOf=m=>top+m/60*hourH;
  // today and the now line follow the real clock in the routines' time zone
  const week=D.calendar.weekStart,now=Date.now(),nowParts=new Intl.DateTimeFormat('en-CA',{timeZone:D.calendar.timezone||undefined,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).reduce((o,p)=>(o[p.type]=p.value,o),{});
  const todayKey=nowParts.year+'-'+nowParts.month+'-'+nowParts.day,dates=Array.from({length:7},(_,i)=>new Date(Date.parse(week+'T12:00:00Z')+i*864e5).toISOString().slice(0,10)),today=dates.indexOf(todayKey);
  // one shared symbol sheet, so list rows and calendar fires draw the same routine SVG
  parts.push('<defs>'+D.calendar.routines.map(r=>'<symbol id="'+sid(r)+'" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">'+String(r.svg||'').replace(/^<svg[^>]*>|<\/svg>$/g,'').replace(/#888/g,'currentColor')+'</symbol>').join('')+'</defs>');
  if(today>=0)parts.push('<rect x="'+(left+today*dayW)+'" y="'+top+'" width="'+dayW+'" height="'+(24*hourH)+'" fill="#ff6b1a" fill-opacity=".045"/>');
  for(let i=5;i<7;i++)parts.push('<rect x="'+(left+i*dayW)+'" y="'+top+'" width="'+dayW+'" height="'+(24*hourH)+'" fill="#fff" fill-opacity=".018"/>');
  for(let h=0;h<=24;h++){const y=top+h*hourH;parts.push('<path d="M'+left+' '+y+'H'+right+'" stroke="#fff" stroke-opacity="'+(h%6===0?.13:.045)+'"/>');if(h<24&&h%3===0)parts.push('<text class="hour-label" x="'+(left-10)+'" y="'+(y+4)+'" text-anchor="end">'+(h%12||12)+(h<12?'a':'p')+'</text>')}
  for(let i=0;i<=7;i++)parts.push('<path d="M'+(left+i*dayW)+' '+top+'V'+(top+24*hourH)+'" stroke="#fff" stroke-opacity="'+(i===0||i===7?.16:.1)+'"/>');
  for(const r of scheduled){for(let day=0;day<7;day++){
   const times=occ.filter(o=>o.routineId===r.id&&o.day===day).map(o=>o.startMinutes).sort((a,b)=>a-b);if(!times.length)continue;
   const x=xOf(day,r.id),g=['<g class="routine-run" data-id="'+esc(r.id)+'">'];
   for(const run of runsOf(times)){
    if(run.length>1){const y0=yOf(run[0]),y1=yOf(run.at(-1));g.push('<path class="routine-rail" d="M'+x+' '+y0+'V'+y1+run.map(t=>'M'+(x-2)+' '+yOf(t)+'h4').join('')+'"/>')}
    // an icon at the start of each run, repeated every six hours along long rails
    let lastIcon=-1e9;for(const t of run){if(t-lastIcon<360)continue;lastIcon=t;const y=yOf(t),k=events.length;
     events.push({...r,routineId:r.id,day,startMinutes:t,date:dates[day]});nodes.push({id:r.id+'@'+day+':'+t,kind:'routine',x,y,r:icon/2,colour:GOLD,routineId:r.id});
     g.push('<g class="routine-fire clickable" tabindex="0" data-fire="'+k+'" data-id="'+esc(r.id)+'"><circle cx="'+x+'" cy="'+y+'" r="'+(icon/2+2.5)+'" fill="#000"/><use href="#'+sid(r)+'" x="'+(x-icon/2)+'" y="'+(y-icon/2)+'" width="'+icon+'" height="'+icon+'"/></g>')}
   }
   g.push('</g>');parts.push(g.join(''));
  }}
  if(today>=0){const y=yOf(+nowParts.hour*60+ +nowParts.minute),x0=left+today*dayW;parts.push('<path d="M'+x0+' '+y+'H'+(x0+dayW)+'" stroke="#ff6b1a" stroke-width="1.4"/><circle cx="'+x0+'" cy="'+y+'" r="3.5" fill="#ff6b1a"/>')}
  return {markup:parts.join(''),nodes,events,width:W,height,grid:{left,dayWidth:dayW,hourOffsets:Array.from({length:25},(_,i)=>top+i*hourH),hourH,dates,today,top},totals:{routines:D.calendar.routines.length,scheduled:scheduled.length,occurrences:occ.length,icons:events.length}};
 }
 function bind(world){
  world.querySelectorAll('.routine-run').forEach(g=>{g.onpointerenter=()=>focus(g.dataset.id,false);g.onpointerleave=()=>focus(null,false)});
  world.querySelectorAll('.routine-fire').forEach(el=>el.addEventListener('click',()=>{if(selected!==el.dataset.id)select(el.dataset.id)}));
  focus(null);
 }
 async function paintCapture(ctx){
  const root=document.getElementById('routine-list'),clip=root.getBoundingClientRect();if(!clip.height)return;ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.width,clip.height);ctx.clip();
  for(const el of root.querySelectorAll('.routine-name,.routine-day,.routine-cost span,.routine-section')){const r=el.getBoundingClientRect();if(r.bottom<clip.top||r.top>clip.bottom)continue;const s=getComputedStyle(el);ctx.font=s.font;ctx.fillStyle=s.color;ctx.textBaseline='middle';ctx.fillText(el.textContent,r.x,r.y+r.height/2)}
  await Promise.all([...root.querySelectorAll('.routine-glyph svg,.owner-icon')].map(async el=>{const r=el.getBoundingClientRect();if(r.bottom<clip.top||r.top>clip.bottom)return;let markup;if(el.classList.contains('owner-icon'))markup=new XMLSerializer().serializeToString(el);else{const id=el.querySelector('use').getAttribute('href').slice(1),sym=document.getElementById(id);markup='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" stroke="'+getComputedStyle(el).color+'" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+sym.innerHTML.replace(/currentColor/g,getComputedStyle(el).color)+'</svg>'}const img=new Image();await new Promise(res=>{img.onload=res;img.onerror=res;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(markup)});if(img.naturalWidth)ctx.drawImage(img,r.x,r.y,r.width,r.height)}));ctx.restore();
 }
 window.CalendarBoard={controls,list,layout,bind,summary,details,owner,paintCapture,state:()=>({filter,sort,direction,selected,rows:rows.map(r=>({id:r.id,title:r.title,status:status(r),days:r.days,owner:ownerName(r)})),icons:events.length,occurrences:occ.length})};
})();
