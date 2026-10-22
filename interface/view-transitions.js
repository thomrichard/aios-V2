(()=>{'use strict';
 const pending=new Map();let seq=0,version=0,overlay,ctx,running=false,currentFrames=[];
 const norm=p=>String(p||'').replace(/^file:/,'').replace(/\\/g,'/').replace(/^file:/,'').toLowerCase();
 const ease=t=>t*t*(3-2*t),mix=(a,b,t)=>a+(b-a)*t;
 function ensure(){if(overlay)return;overlay=document.createElement('canvas');overlay.id='view-morph';overlay.setAttribute('aria-hidden','true');Object.assign(overlay.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'12',pointerEvents:'none',display:'none'});document.body.append(overlay);ctx=overlay.getContext('2d');}
 addEventListener('message',e=>{const m=e.data,p=m&&pending.get(m.requestId);if(!p||e.source!==p.frame.contentWindow||!['brain-copy-capture','views-copy-capture'].includes(m.type))return;clearTimeout(p.timer);pending.delete(m.requestId);p.resolve(m)});
 // pointsOnly: the view being entered only needs its node positions, not a picture (speed pass)
 function capture(frame,pointsOnly=false){return new Promise(resolve=>{const requestId='morph-'+(++seq),timer=setTimeout(()=>{pending.delete(requestId);resolve({points:[]})},1500);pending.set(requestId,{frame,resolve,timer});frame.contentWindow.postMessage({type:frame.id==='brain'?'brain-copy':'views-copy',action:'capture',requestId,pointsOnly},'*')})}
 function decode(src){return new Promise(resolve=>{if(!src)return resolve(null);const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src})}
 const nextPaint=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 function clean(){if(overlay){overlay.style.display='none';ctx.clearRect(0,0,overlay.width,overlay.height)}currentFrames.forEach(f=>f.style.opacity='1');currentFrames=[];running=false}
 function cancel(){version++;clean()}
 async function run({from,to,change}){cancel();const id=version;ensure();running=true;currentFrames=[from,to];let a=await capture(from);if(id!==version)return;const oldRect=from.getBoundingClientRect(),oldImage=a.bitmap||await decode(a.image);if(id!==version)return;
  const dpr=Math.min(devicePixelRatio||1,1.5);overlay.width=innerWidth*dpr;overlay.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);overlay.style.display='block';ctx.fillStyle='#000';ctx.fillRect(0,0,innerWidth,innerHeight);if(oldImage)ctx.drawImage(oldImage,oldRect.x,oldRect.y,oldRect.width,oldRect.height);
  change();to.style.opacity='0';await nextPaint();const b=await capture(to,true);if(id!==version)return;const rect=to.getBoundingClientRect();
  const aa=(a.points||[]).map(p=>({...p,x:p.x+oldRect.x,y:p.y+oldRect.y,key:norm(p.path||p.id)})),bb=(b.points||[]).map(p=>({...p,x:p.x+rect.x,y:p.y+rect.y,key:norm(p.path||p.id)})),targets=new Map(bb.map(p=>[p.key,p]));
  const pairs=aa.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).slice(0,800).map((p,i)=>({a:p,b:targets.get(p.key)||bb[Math.floor(i*bb.length/Math.max(1,aa.length))],matched:targets.has(p.key)})).filter(p=>p.b&&Number.isFinite(p.b.x)&&Number.isFinite(p.b.y));
  const duration=matchMedia('(prefers-reduced-motion:reduce)').matches?150:820,start=performance.now();
  await new Promise(resolve=>{function paint(now){if(id!==version){resolve();return}const t=Math.min(1,(now-start)/duration),e=ease(t);ctx.clearRect(0,0,innerWidth,innerHeight);to.style.opacity=String(e);ctx.globalAlpha=1-e;if(oldImage)ctx.drawImage(oldImage,oldRect.x,oldRect.y,oldRect.width,oldRect.height);ctx.globalAlpha=1;
    for(const p of pairs){const arc=Math.sin(Math.PI*e)*Math.min(35,Math.hypot(p.b.x-p.a.x,p.b.y-p.a.y)*.06);ctx.globalAlpha=Math.sin(Math.PI*t)*(p.matched?.8:.3);ctx.fillStyle=p.b.color||p.a.color||'#d9d9d5';ctx.beginPath();ctx.arc(mix(p.a.x,p.b.x,e),mix(p.a.y,p.b.y,e)-arc,mix(Math.min(4,p.a.r||2),Math.min(4,p.b.r||2),e),0,Math.PI*2);ctx.fill()}
    ctx.globalAlpha=1;if(t<1)requestAnimationFrame(paint);else resolve()}requestAnimationFrame(paint)});
  if(id===version)clean();
 }
 window.ViewTransitions={run,cancel,state:()=>({running,requests:pending.size})};
})();
