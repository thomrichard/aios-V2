(() => {
  'use strict';
  // One shared calendar axis for every lane. A date has exactly one x in every lane:
  // days are equal width, months are separate blocks, and crowded days stack upward
  // inside their own day column instead of pushing later days to the right.
  const DAY=864e5,TZ=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',MONTHS=3;
  const names={A:'Applications',R:'Routines',G:'AGENTS md',M:'Memory',S:'Skills'};
  const dayFmt=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
  const timeFmt=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const dayKey=t=>dayFmt.format(t),keyOf=d=>d.toISOString().slice(0,10);
  const dayFraction=t=>{const [h,m]=timeFmt.format(t).split(':').map(Number);return(h*60+m)/1440};
  const nice=t=>new Date(t).toLocaleString('en-AU',{timeZone:TZ,day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});

  function build({S,shown,layer,top}) {
    const visible=S.visible.filter(n=>shown(n)&&n.type!=='hub'),router=visible.find(n=>n.type==='router');
    const anchor=Math.max(...visible.filter(n=>n.mtime>0).map(n=>n.mtime)),[ay,am]=dayKey(anchor).split('-').map(Number);
    // Calendar window: the anchor's month and the two before it, in local days.
    const months=[];for(let i=MONTHS-1;i>=0;i--){const d=new Date(Date.UTC(ay,am-1-i,1)),days=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();months.push({year:d.getUTCFullYear(),month:d.getUTCMonth(),days,label:d.toLocaleDateString('en-AU',{month:'long',timeZone:'UTC'}),short:d.toLocaleDateString('en-AU',{month:'short',timeZone:'UTC'}).toUpperCase()})}
    const totalDays=months.reduce((n,m)=>n+m.days,0),firstKey=keyOf(new Date(Date.UTC(months[0].year,months[0].month,1)));
    // Horizontal geometry: label column, Older block, then equal-width days in month blocks.
    const left=28,labelW=118,olderX=left+labelW,olderW=Math.max(120,Math.min(200,S.W*.125)),gapOlder=22,monthGap=12,right=S.W-28;
    const daysX=olderX+olderW+gapOlder,dayW=Math.max(4,(right-daysX-monthGap*(MONTHS-1))/totalDays);
    const days=new Map();let x=daysX;
    for(const [mi,m] of months.entries()){m.x=x;for(let d=1;d<=m.days;d++){const key=keyOf(new Date(Date.UTC(m.year,m.month,d))),dow=new Date(Date.UTC(m.year,m.month,d)).getUTCDay();days.set(key,{key,x,day:d,dow,month:mi});x+=dayW}m.x1=x;x+=monthGap}
    const todayKey=dayKey(anchor),today=days.get(todayKey),todayX=today?today.x+dayW*dayFraction(anchor):null;
    const where=n=>{if(!(n.mtime>0))return null;const key=dayKey(n.mtime);return key<firstKey?null:days.get(key)||null};
    // Vertical geometry. Icon lanes stay short, AGENTS md is a thin line, Memory takes the rest.
    const headerTop=top+30,chartTop=top+74,bottom=S.H-58,avail=Math.max(360,bottom-chartTop),gap=12;
    const pick=key=>visible.filter(n=>key==='G'?n.type==='router':n.type!=='router'&&layer(n)===key);
    // Apps and routines are icons about twice their old size,
    // so a day's icon is wider than its column and its lanes get a bigger share of the height.
    const iconSize=Math.max(20,Math.min(26,dayW*1.7)),olderIcon=24,olderPitch=26,olderCols=Math.max(1,Math.floor((olderW-6)/olderPitch));
    const iconNeed=key=>{const ns=pick(key),older=ns.filter(n=>!where(n)).length;return Math.max(iconSize+14,Math.ceil(older/olderCols)*olderPitch+10)};
    const heights={A:Math.min(avail*.15,iconNeed('A')),R:Math.min(avail*.22,Math.max(iconNeed('R'),avail*.15)),G:18,S:Math.max(52,avail*.1)};
    heights.M=avail-heights.A-heights.R-heights.G-heights.S-gap*4;
    let y=chartTop;const lanes=['A','R','G','M','S'].map(key=>{const lane={key,label:names[key],left,right,top:y,bottom:y+heights[key],height:heights[key]};y+=heights[key]+gap;return lane});
    const laneOf=key=>lanes.find(l=>l.key===key),positions=new Map(),stacks=[];
    // Memory clusters by department, sized by how tall their busiest day is.
    const memory=laneOf('M'),memNodes=pick('M'),dotPitch=5,dotR=2,dayCols=dayW>=11?2:1,olderDotCols=Math.floor((olderW-6)/dotPitch);
    const clusters=S.departments.map(d=>({...d,nodes:memNodes.filter(n=>n.dept===d.key)})).filter(d=>d.nodes.length&&S.st.depts[d.key]!==false);
    const extra=memNodes.filter(n=>!S.departments.some(d=>d.key===n.dept));if(extra.length&&S.departments.every(d=>S.st.depts[d.key]!==false))clusters.push({key:'workspace',label:'Workspace',color:'#aaa',nodes:extra});
    const need=c=>{const per=new Map();let older=0;for(const n of c.nodes){const d=where(n);if(d)per.set(d.key,(per.get(d.key)||0)+1);else older++}return Math.max(4,Math.ceil(Math.max(0,...per.values())/dayCols),Math.ceil(older/olderDotCols))};
    const cgap=8,totalNeed=clusters.reduce((n,c)=>n+(c.need=need(c)),0),usable=memory.height-cgap*Math.max(0,clusters.length-1)-4;let cy=memory.top+2;
    for(const c of clusters){c.height=Math.max(24,usable*Math.sqrt(c.need)/clusters.reduce((n,d)=>n+Math.sqrt(d.need),0));c.top=cy;c.bottom=cy+c.height;cy=c.bottom+cgap}
    const fix=clusters.length?(memory.bottom-2)/(clusters.at(-1).bottom):1;if(fix<1)for(const c of clusters){c.top=memory.top+(c.top-memory.top)*fix;c.bottom=memory.top+(c.bottom-memory.top)*fix;c.height=c.bottom-c.top}
    // Packing. Each band fills its own rows, bottom-up, inside the right day column.
    function place(band,nodes,{icon,top:bt,bottom:bb,r}){
      const groups=new Map();for(const n of nodes){const d=where(n),k=d?d.key:'older';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(n)}
      for(const [k,list] of groups){list.sort((a,b)=>(a.mtime||0)-(b.mtime||0)||a.id.localeCompare(b.id));const older=k==='older',height=bb-bt-6;
        if(icon){
          const size=older?olderIcon:iconSize,full=older?olderPitch:iconSize+2,cols=older?olderCols:1,rows=Math.ceil(list.length/cols),pitch=rows>1?Math.min(full,(height-size)/(rows-1)):full;
          list.forEach((n,i)=>{const col=i%cols,row=Math.floor(i/cols),cx=older?olderX+4+olderPitch/2+col*olderPitch:days.get(k).x+dayW/2;positions.set(n.id,{x:cx,y:bb-4-size/2-row*pitch,z:row,scale:size/2/Math.max(1,S.radiusOf(n)),lane:band,icon:true,r:size/2,day:k,department:null,dateBasis:n.dateBasis})});
          if(!older&&list.length>3)stacks.push({x:days.get(k).x+dayW/2,y:bb-4-size-(list.length-1)*pitch-4,count:list.length,lane:band});
        }else{
          const cols=older?olderDotCols:dayCols,rows=Math.ceil(list.length/cols),pitch=Math.min(dotPitch,rows>1?(height-r*2)/(rows-1):dotPitch);
          list.forEach((n,i)=>{const col=i%cols,row=Math.floor(i/cols),cx=older?olderX+4+dotPitch/2+col*dotPitch:days.get(k).x+(cols===2?dayW*(col?.69:.31):dayW/2);positions.set(n.id,{x:cx,y:bb-3-r-row*pitch,z:0,scale:.35,lane:band,icon:false,r,day:k,department:band==='M'?'M:'+n.dept:null})});
        }
      }
    }
    for(const key of ['A','R'])if(S.st.layers[key]!==false){const l=laneOf(key);place(key,pick(key),{icon:true,top:l.top,bottom:l.bottom})}
    if(S.st.layers.S!==false){const l=laneOf('S');place('S',pick('S'),{icon:false,top:l.top,bottom:l.bottom,r:dotR})}
    if(S.st.layers.M!==false)for(const c of clusters)place('M',c.nodes,{icon:false,top:c.top,bottom:c.bottom,r:dotR});
    const g=laneOf('G');if(router){const d=where(router),gx=d?d.x+dayW*dayFraction(router.mtime):olderX+olderW/2;positions.set(router.id,{x:gx,y:(g.top+g.bottom)/2,z:0,scale:.35,lane:'G',icon:false,r:3.2,day:d?.key||'older'})}
    const aliases=(router?.editAliases||[]).map(a=>{const d=where(a);return{...a,x:d?d.x+dayW*dayFraction(a.mtime):null}});
    return {positions,lanes,clusters,stacks,aliases,router:router?{mtime:router.mtime,file:router.lastEditedFile}:null,months:months.map(m=>({label:m.label,short:m.short,x:m.x,width:m.x1-m.x,x1:m.x1,year:m.year})),
      days:[...days.values()],dayW,todayX,todayKey,anchor,headerTop,
      ticks:[...days.values()].map(d=>({x:d.x,date:d.key,month:d.day===1})),
      bounds:{left:olderX,right,top:chartTop,bottom:y-gap,columns:totalDays+1,olderX,olderW,daysX,start:firstKey,end:keyOf(new Date(Date.UTC(months.at(-1).year,months.at(-1).month,months.at(-1).days))),olderIncludesUndated:true,dayWidth:dayW,iconSize}};
  }

  // Grid behind the nodes, in world space (pans and zooms with the content).
  function draw(ctx,{layout,S,scale,pan,alpha}) {
    if(!layout)return;const b=layout.bounds,top=b.top-6,bot=b.bottom+4;ctx.save();ctx.globalAlpha=alpha;ctx.translate(S.W/2+pan.x,S.H/2+pan.y);ctx.scale(scale,scale);ctx.translate(-S.W/2,-S.H/2);
    const hair=1/scale;
    // month blocks: a faint panel per month so each reads as its own block
    for(const m of layout.months){ctx.fillStyle='#ffffff05';ctx.fillRect(m.x,top,m.width,bot-top)}
    ctx.fillStyle='#ffffff04';ctx.fillRect(b.olderX,top,b.olderW,bot-top);
    // day lines, very faint
    ctx.lineWidth=hair;ctx.strokeStyle='#ffffff0c';ctx.beginPath();for(const d of layout.days){if(d.day===1)continue;ctx.moveTo(d.x,top);ctx.lineTo(d.x,bot)}ctx.stroke();
    // month edges, clear
    ctx.strokeStyle='#ffffff38';ctx.lineWidth=hair*1.2;ctx.beginPath();for(const m of layout.months){ctx.moveTo(m.x,top);ctx.lineTo(m.x,bot);ctx.moveTo(m.x1,top);ctx.lineTo(m.x1,bot)}ctx.moveTo(b.olderX,top);ctx.lineTo(b.olderX,bot);ctx.moveTo(b.olderX+b.olderW,top);ctx.lineTo(b.olderX+b.olderW,bot);ctx.stroke();
    // future days of the current month sit dimmer
    if(layout.todayX){const m=layout.months.at(-1);ctx.fillStyle='#00000080';ctx.fillRect(layout.todayX,top,m.x1-layout.todayX,bot-top)}
    // lane floors
    ctx.strokeStyle='#ffffff16';ctx.lineWidth=hair;ctx.beginPath();for(const l of layout.lanes){if(l.key==='G')continue;ctx.moveTo(b.olderX,l.bottom);ctx.lineTo(b.right,l.bottom)}for(const c of layout.clusters.slice(0,-1)){ctx.moveTo(b.olderX,c.bottom+4);ctx.lineTo(b.right,c.bottom+4)}ctx.stroke();
    // AGENTS md: one thin line, with a tick for each context file's latest edit
    const g=layout.lanes.find(l=>l.key==='G'),gy=(g.top+g.bottom)/2;ctx.strokeStyle='#ff6b1a40';ctx.beginPath();ctx.moveTo(b.olderX,gy);ctx.lineTo(b.right,gy);ctx.stroke();
    ctx.strokeStyle='#ff8a3d';ctx.lineWidth=1.2*hair;for(const a of layout.aliases){if(a.x==null)continue;ctx.beginPath();ctx.moveTo(a.x,gy-5);ctx.lineTo(a.x,gy+5);ctx.stroke()}
    // now
    if(layout.todayX){ctx.strokeStyle='#ff6b1a';ctx.globalAlpha=alpha*.75;ctx.lineWidth=hair;ctx.beginPath();ctx.moveTo(layout.todayX,top);ctx.lineTo(layout.todayX,bot);ctx.stroke()}
    ctx.restore();
  }

  // Sticky header (months, day numbers) and the lane names, drawn above the nodes in screen space.
  function overlay(ctx,{layout,S,scale,pan,alpha}) {
    if(!layout)return;const sx=x=>S.W/2+(x-S.W/2)*scale+pan.x,sy=y=>S.H/2+(y-S.H/2)*scale+pan.y,b=layout.bounds,h0=layout.headerTop,h1=b.top-6;
    ctx.save();ctx.globalAlpha=alpha;ctx.textBaseline='alphabetic';
    // counts above crowded icon stacks
    ctx.font='600 9px Outfit';ctx.textAlign='center';for(const s of layout.stacks){ctx.fillStyle=s.lane==='A'?S.layerColor.A:S.layerColor.R;ctx.fillText(String(s.count),sx(s.x),sy(s.y))}
    // AGENTS md stamp beside the marker
    const g=layout.lanes.find(l=>l.key==='G'),gy=sy((g.top+g.bottom)/2);
    if(layout.router){const a=layout.aliases.find(a=>a.mtime===layout.router.mtime)||{};const label=(layout.router.file||'').replace('.md',' md')+' edited '+nice(layout.router.mtime);ctx.font='500 10.5px Outfit';ctx.textAlign='left';ctx.fillStyle='#d9d4c8';const rx=a.x!=null?sx(a.x):null;if(rx!=null)ctx.fillText(label,rx+10,gy+4)}
    // header band
    ctx.fillStyle='#000';ctx.fillRect(0,0,S.W,h1+2);
    const clampLabel=(x0,x1,w)=>Math.max(x0+4,Math.min((x0+x1)/2-w/2,x1-w-4));
    ctx.font='600 11px Outfit';ctx.letterSpacing='2.4px';ctx.textAlign='left';
    for(const m of layout.months){const x0=sx(m.x),x1=sx(m.x1);if(x1<0||x0>S.W)continue;const t=m.label.toUpperCase()+'  '+m.year,w=ctx.measureText(t).width;ctx.fillStyle='#ece9e1';ctx.fillText(t,clampLabel(Math.max(x0,b.olderX-4),x1,w),h0+12)}
    {const x0=sx(b.olderX),x1=sx(b.olderX+b.olderW),t='OLDER',w=ctx.measureText(t).width;if(x1>0)ctx.fillStyle='#8d8b84',ctx.fillText(t,clampLabel(x0,x1,w),h0+12)}
    ctx.letterSpacing='0px';
    // day numbers under each month
    const dw=layout.dayW*scale,step=dw>=13?1:dw>=7?2:dw>=3.5?5:10;ctx.font='500 '+Math.max(8,Math.min(11,dw*.68))+'px Outfit';ctx.textAlign='center';
    for(const d of layout.days){const x=sx(d.x+layout.dayW/2);if(x<0||x>S.W)continue;const isToday=d.key===layout.todayKey,future=layout.todayKey&&d.key>layout.todayKey;if(!isToday&&(d.day-1)%step&&d.day!==1)continue;ctx.fillStyle=isToday?'#ff8a3d':future?'#4a4945':d.dow===0||d.dow===6?'#7b7a74':'#b9b6ad';ctx.fillText(String(d.day),x,h0+30)}
    if(layout.todayX){const x=sx(layout.todayX);ctx.fillStyle='#ff6b1a';ctx.beginPath();ctx.arc(x,h1+1,2.5,0,Math.PI*2);ctx.fill()}
    {const x0=sx(b.olderX),x1=sx(b.olderX+b.olderW);ctx.fillStyle='#6f6d67';ctx.font='400 9.5px Outfit';if(x1>0)ctx.fillText('incl. undated',(x0+x1)/2,h0+30)}
    ctx.strokeStyle='#ffffff1f';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,h1+.5);ctx.lineTo(S.W,h1+.5);ctx.stroke();
    // sticky lane names on the left
    const colW=b.olderX-6;if(pan.x<0||scale>1){ctx.fillStyle='#000';ctx.fillRect(0,h1+1,colW,S.H-h1)}
    ctx.save();ctx.beginPath();ctx.rect(0,h1+1,colW,S.H-h1);ctx.clip();ctx.textAlign='left';
    for(const l of layout.lanes){if(l.key!=='G'&&S.st.layers[l.key]===false)continue;const color=l.key==='G'?'#ff8a3d':S.layerColor[l.key]||'#ddd';ctx.fillStyle=color;
      if(l.key==='G'){ctx.font='500 10.5px Outfit';ctx.letterSpacing='0px';ctx.fillText('AGENTS md',28,gy+4);continue}
      ctx.font='600 11px Outfit';ctx.letterSpacing='2px';const y=l.key==='M'?sy(l.top)+12:sy((l.top+l.bottom)/2)+4;ctx.fillText(l.label.toUpperCase(),28,y)}
    ctx.letterSpacing='0px';ctx.font='500 11px Outfit';for(const c of layout.clusters){const mid=sy((c.top+c.bottom)/2);ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(32,mid-3.5,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#cfccc3';ctx.fillText(c.label,42,mid)}
    ctx.restore();ctx.restore();
  }
  window.BrainTimeline={build,draw,overlay};
})();
