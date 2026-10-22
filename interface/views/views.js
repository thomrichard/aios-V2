(() => {
  'use strict';
  // The Second Brain's Routines, Skills and Applications tabs. Routines is an SVG week board
  // (calendar-board.js); Skills and Applications are HTML boards of their own (usage-board.js).
  const D = window.COPY_DATA;
  if (!D) { document.getElementById('app').innerHTML = '<p id="missing">No routine data yet. Press the refresh icon at the top right.</p>'; return; }
  const $ = id => document.getElementById(id), svg = d3.select('#view'), world = d3.select('#world');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const weekdays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const VIEWS = ['calendar','skills','apps'];
  let view = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'calendar';
  let W = 1300, H = 700, layoutWidth = W, layoutHeight = H, zoomTransform = d3.zoomIdentity, initialTransform = d3.zoomIdentity;
  let currentNodes = [], currentTotals = {}, calendarRender = [], calendarGrid = null;
  const calendarHeader = svg.append('g').attr('id','calendar-header').attr('pointer-events','none');

  const zoom = d3.zoom().scaleExtent([.28,12]).filter(e=>!(view==='calendar'&&e.type==='wheel'&&!e.ctrlKey)&&(!e.button||e.type==='wheel')).on('zoom',e=>{zoomTransform=e.transform;world.attr('transform',e.transform);hideHover();paintCalendarHeader();});
  svg.call(zoom).on('dblclick.zoom',null);
  $('view').addEventListener('wheel',e=>{if(view==='calendar'&&!e.ctrlKey){e.preventDefault();svg.call(zoom.transform,d3.zoomIdentity.translate(zoomTransform.x-e.deltaX,zoomTransform.y-e.deltaY).scale(zoomTransform.k));}},{passive:false});
  function resetZoom(){svg.call(zoom.transform,initialTransform);}
  function changeZoom(direction){if(!direction)return resetZoom();svg.transition().duration(180).call(zoom.scaleBy,direction>0?1.3:1/1.3);}
  $('zoom-in').onclick=()=>changeZoom(1);$('zoom-out').onclick=()=>changeZoom(-1);$('zoom-reset').onclick=resetZoom;

  function tip(e,html){$('hover').innerHTML=html;$('hover').hidden=false;moveOverlay($('hover'),e);}
  function moveOverlay(el,e){const x=e.clientX??innerWidth/2,y=e.clientY??innerHeight/2;el.style.left=Math.max(8,Math.min(x+15,innerWidth-el.offsetWidth-12))+'px';el.style.top=Math.max(8,Math.min(y+14,innerHeight-el.offsetHeight-12))+'px';}
  function hideHover(){$('hover').hidden=true;}
  function pop(e,title,body){hideHover();$('popover').innerHTML=`<header><h3>${esc(title)}</h3><button aria-label="Close details">×</button></header>${body}`;$('popover').hidden=false;moveOverlay($('popover'),e);$('popover').querySelector('header button').onclick=()=>{$('popover').hidden=true;};}
  function hidePop(){$('popover').hidden=true;}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('popover').hidden){hidePop();hideHover();}else parent.postMessage({type:'views-copy-back'},'*');}});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#popover,.clickable,#unplaced'))hidePop();});
  function attach(selector,hover,click){world.selectAll(selector).on('pointerenter',function(e){tip(e,hover(this));}).on('pointermove',e=>moveOverlay($('hover'),e)).on('pointerleave',hideHover).on('click',function(e){e.stopPropagation();click?.(e,this);}).on('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();click?.({clientX:innerWidth/2,clientY:innerHeight/2},this);}});}

  // Sticky day header: weekday and date over each column, today in orange. Stays put while the grid pans.
  const CAL_HEADER=38;
  function paintCalendarHeader(){
    if(view!=='calendar'||!calendarGrid){calendarHeader.html('');return;}
    const {left,dayWidth,dates,today}=calendarGrid,k=zoomTransform.k,w=$('stage').clientWidth;
    calendarHeader.html(`<rect x="0" y="0" width="${w}" height="${CAL_HEADER}" fill="#000"/><path d="M0 ${CAL_HEADER-.5}H${w}" stroke="#fff" stroke-opacity=".16"/>`+weekdays.map((day,i)=>{const x=zoomTransform.x+(left+i*dayWidth+10)*k,hot=i===today,d=Number((dates?.[i]||'').slice(8));return `<text x="${x}" y="24" class="cal-head${hot?' today':''}"><tspan class="cal-dow">${day.toUpperCase()}</tspan><tspan dx="7" class="cal-date">${d||''}</tspan></text>`;}).join(''));
  }
  function routinePop(e,r){pop(e,r.title,CalendarBoard.details(r));$('popover').dataset.routine=r.routineId||r.id;}
  function calendarLayout(){
    $('metrics').innerHTML='';CalendarBoard.list($('routine-list'),D);const stage=$('stage').getBoundingClientRect();W=Math.max(1000,stage.width);const result=CalendarBoard.layout(D,W,stage.height-CAL_HEADER);world.html(result.markup);CalendarBoard.bind(world.node());currentNodes=result.nodes;calendarRender=result.events;calendarGrid=result.grid;currentTotals=result.totals;
    attach('.routine-fire',el=>CalendarBoard.summary(calendarRender[+el.dataset.fire]),(e,el)=>routinePop(e,calendarRender[+el.dataset.fire]));return result;
  }

  function render(){
    hideHover();hidePop();document.body.dataset.view=view;document.body.classList.toggle('embedded',window!==parent);$('unplaced').hidden=true;$('unplaced').innerHTML='';$('metrics').innerHTML='';
    if(view==='skills'||view==='apps'){$('controls').innerHTML='';window.UsageBoard?.render(view,$('app'));parent.postMessage({type:'views-copy-state',view},'*');return;}
    CalendarBoard.controls($('controls'),D,render,{tip,hide:hideHover,open:routinePop});
    const rect=$('stage').getBoundingClientRect();W=Math.max(1180,rect.width);H=Math.max(530,rect.height);svg.attr('viewBox',`0 0 ${rect.width} ${rect.height}`);
    const layout=calendarLayout();layoutWidth=layout.width;layoutHeight=layout.height;
    const size=$('stage').getBoundingClientRect(),scale=size.width/layoutWidth;svg.attr('viewBox',`0 0 ${size.width} ${size.height}`);initialTransform=d3.zoomIdentity.translate((size.width-layoutWidth*scale)/2,CAL_HEADER).scale(scale);resetZoom();
    $('view').setAttribute('aria-label','Weekly routine calendar');
    parent.postMessage({type:'views-copy-state',view},'*');
  }
  function capturePoints(){
    if(view==='skills'||view==='apps')return [...document.querySelectorAll('.ub-node')].slice(0,1000).map(el=>{const r=el.getBoundingClientRect();return{id:el.dataset.id,path:'',x:r.x+r.width/2,y:r.y+r.height/2,r:Math.max(1,r.width/2),color:view==='skills'?'#ff6b1a':'#3f8fd4'}});
    const matrix=world.node().getScreenCTM(),bounds=$('stage').getBoundingClientRect();
    if(!matrix)return [];
    const scale=Math.hypot(matrix.a,matrix.b),out=[];
    for(let i=0;i<currentNodes.length;i++){
      const n=currentNodes[i],routine=n.kind==='routine'?calendarRender[i]:null,id=routine?.routineId||routine?.id||String(n.id||i);
      const at=new DOMPoint(n.x,n.y).matrixTransform(matrix),r=Math.max(.5,Number(n.r||2)*scale);
      if(!Number.isFinite(at.x)||!Number.isFinite(at.y)||at.x<bounds.left||at.x>bounds.right||at.y<bounds.top+37||at.y>bounds.bottom)continue;
      out.push({id,path:'',x:at.x,y:at.y,r,color:n.colour||'#f5c74e'});
    }
    out.sort((a,b)=>a.id.localeCompare(b.id)||a.y-b.y||a.x-b.x);
    return out.length<=1000?out:Array.from({length:1000},(_,i)=>out[Math.floor(i*out.length/1000)]);
  }
  function paintCaptureControls(ctx){
    const text=(el,value,align='left',x=null)=>{const rect=el.getBoundingClientRect(),style=getComputedStyle(el);if(!rect.width||!rect.height)return;ctx.save();ctx.beginPath();ctx.rect(rect.x,rect.y,rect.width+1,rect.height);ctx.clip();ctx.font=style.font||`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;ctx.letterSpacing=style.letterSpacing==='normal'?'0px':style.letterSpacing;ctx.fillStyle=style.color;ctx.textBaseline='middle';ctx.textAlign=align;ctx.fillText(value,x??rect.x,rect.y+rect.height/2);ctx.restore();};
    const box=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);if(!r.width||!r.height)return;ctx.beginPath();ctx.roundRect(r.x,r.y,r.width,r.height,parseFloat(s.borderRadius)||0);ctx.fillStyle=s.backgroundColor;ctx.fill();if(parseFloat(s.borderWidth)){ctx.lineWidth=parseFloat(s.borderWidth);ctx.strokeStyle=s.borderColor;ctx.stroke();}};
    document.querySelectorAll('#controls .seg,#controls .cal-seg').forEach(box);
    document.querySelectorAll('#controls button').forEach(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);if(!r.width||!r.height)return;box(el);text(el,el.textContent.trim(),'left',r.x+parseFloat(s.paddingLeft));});
  }
  async function capture(requestId,pointsOnly=false){
    const board=view==='skills'||view==='apps',svgSource=(board&&$('ub-svg'))||$('view');
    const capturedView=view,width=innerWidth,height=innerHeight,bounds=svgSource.getBoundingClientRect(),points=capturePoints();
    if(pointsOnly)return {type:'views-copy-capture',requestId,view:capturedView,width,height,offset:{x:bounds.x,y:bounds.y},points};
    const clone=svgSource.cloneNode(true),sources=[svgSource,...svgSource.querySelectorAll('*')],targets=[clone,...clone.querySelectorAll('*')];
    const properties=['fill','stroke','stroke-width','stroke-opacity','fill-opacity','opacity','stroke-dasharray','stroke-linecap','stroke-linejoin','font-family','font-size','font-weight','font-style','letter-spacing','text-anchor','dominant-baseline','color','visibility','display','filter','shape-rendering'];
    for(let i=0;i<sources.length;i++){const style=getComputedStyle(sources[i]);for(const p of properties){const value=style.getPropertyValue(p);if(value)targets[i].style.setProperty(p,value);}}
    clone.setAttribute('xmlns','http://www.w3.org/2000/svg');clone.setAttribute('width',bounds.width);clone.setAttribute('height',bounds.height);clone.style.width=bounds.width+'px';clone.style.height=bounds.height+'px';
    if(window.VIEWS_CAPTURE_FONT){const style=document.createElementNS('http://www.w3.org/2000/svg','style');style.textContent=`@font-face{font-family:Outfit;src:url("${window.VIEWS_CAPTURE_FONT}") format("woff2");font-weight:100 900}`;clone.insertBefore(style,clone.firstChild);}
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);paintCaptureControls(ctx);if(capturedView==='calendar')await CalendarBoard.paintCapture(ctx);
    const source='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(clone)),img=new Image();
    await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Unable to rasterize view'));img.src=source;});
    ctx.drawImage(img,bounds.x,bounds.y,bounds.width,bounds.height);
    const bitmap=typeof createImageBitmap==='function'?await createImageBitmap(canvas).catch(()=>null):null;
    return {type:'views-copy-capture',requestId,view:capturedView,width,height,...(bitmap?{bitmap}:{image:canvas.toDataURL('image/png')}),offset:{x:bounds.x,y:bounds.y},points};
  }
  function setView(value){if(!VIEWS.includes(value))return;view=value;location.hash=value;render();parent.postMessage({type:'views-copy-view-ready',view},'*');}
  addEventListener('message',e=>{if(e.source!==parent||e.data?.type!=='views-copy')return;const d=e.data;if(d.action==='view')setView(d.view);if(d.action==='zoom')changeZoom(d.direction);if(d.action==='capture')capture(d.requestId,d.pointsOnly).then(result=>parent.postMessage(result,'*',result.bitmap?[result.bitmap]:[])).catch(error=>parent.postMessage({type:'views-copy-capture',requestId:d.requestId,view,error:error.message,width:innerWidth,height:innerHeight,points:[]},'*'));});
  addEventListener('hashchange',()=>{const hash=location.hash.slice(1);if(hash!==view&&VIEWS.includes(hash))setView(hash);});
  let resizeTimer;new ResizeObserver(()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,100);}).observe(document.body);
  window.ViewsCopy={state:()=>({view,zoom:zoomTransform.k,totals:currentTotals,nodeCount:currentNodes.length,calendarBoard:view==='calendar'?CalendarBoard.state():null}),setView,zoom:changeZoom,capture,capturePoints};
  render();document.fonts.ready.then(render);parent.postMessage({type:'views-copy-ready'},'*');
})();
