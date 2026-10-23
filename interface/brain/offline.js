(() => {
  const data=window.QUIET_SNAPSHOT;
  // Folder expansions (2.6 MB) live in their own file and load after the brain is up: they are only
  // needed to open a folder or search, so the first paint no longer waits on them.
  let loading=null;
  const loadExp=()=>window.QUIET_EXPANSIONS?Promise.resolve(window.QUIET_EXPANSIONS):loading||(loading=new Promise(res=>{const s=document.createElement('script');s.src='snapshot-expansions.js';s.onload=()=>res(window.QUIET_EXPANSIONS||data.expansions||{});s.onerror=()=>res(data.expansions||{});document.head.append(s)}));
  // Speed: over http the expansions live in a worker (expansions-worker.js), which answers folder and search
  // requests, so the page never parses the 2.6 MB file. If the worker can't start (file://) or fails, the
  // script above loads them on the page as before.
  let worker=location.protocol.startsWith('http')&&typeof Worker==='function'?null:false,seq=0;const waits=new Map();
  const viaPage=msg=>loadExp().then(exp=>msg.kind==='expand'?exp[msg.path]||[]:msg.kind==='search'?search(exp,msg.q):true);
  const ask=msg=>{if(worker===false)return viaPage(msg);
    if(!worker){try{worker=new Worker('expansions-worker.js');worker.onmessage=e=>{const w=waits.get(e.data.id);if(!w)return;waits.delete(e.data.id);e.data.error?viaPage(w.msg).then(w.res):w.res(e.data.result)};worker.onerror=()=>{worker=false;for(const w of waits.values())viaPage(w.msg).then(w.res);waits.clear()}}catch{worker=false;return viaPage(msg)}}
    return new Promise(res=>{const id=++seq;waits.set(id,{res,msg});worker.postMessage({id,...msg})})};
  const search=(exp,q)=>{q=(q||'').toLowerCase();const all=new Map([...data.graph.nodes,...Object.values(exp).flat()].map(n=>[n.id,n]));return [...all.values()].filter(n=>(n.path||n.id).toLowerCase().includes(q)||n.label.toLowerCase().includes(q)).slice(0,40).map(n=>({...n,name:n.label,path:n.path||n.id}))};
  window.__loadExpansions=()=>ask({kind:'warm'});
  const load=()=>{try{return JSON.parse(localStorage.getItem('unified-brain-copy-edits')||'{"hidden":[],"edits":{}}')}catch{return {hidden:[],edits:{}}}};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const body=(value,status=200)=>Promise.resolve(new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}}));
  // over http a file's text comes from the live engine through the server's /local/file; the bundled
  // bodies are only the fallback (file://, or the engine is down)
  const realFetch=window.fetch.bind(window),live=location.protocol.startsWith('http');
  const bundled=id=>{const content=data.bodies[id];return body(content?{content,ext:'.md',size:content.length}:{error:'Cet instantané contient les infos des fichiers et leurs liens. Le contenu de ce fichier n’est pas inclus dans l’aperçu autonome.'})};
  window.fetch=(input,options={})=>{
    const u=new URL(String(input),'http://brain.local'),method=(options.method||'GET').toUpperCase(),edit=load();
    if(u.pathname==='/api/graph'){const g=clone(data.graph);g.nodes=g.nodes.filter(n=>!edit.hidden.includes(n.id)).map(n=>({...n,...edit.edits[n.id]}));g.meta.hiddenCount=edit.hidden.length;return body(g)}
    if(u.pathname==='/api/expand'){const id=u.searchParams.get('path');return ask({kind:'expand',path:id}).then(nodes=>body({path:id,nodes:clone(nodes)}))}
    if(u.pathname==='/api/search')return ask({kind:'search',q:u.searchParams.get('q')||''}).then(results=>body({results}))
    if(u.pathname==='/api/file'){const id=u.searchParams.get('path');if(!live)return bundled(id);return realFetch('/local/file?path='+encodeURIComponent(id)).then(r=>r.ok?r.json():null).then(d=>d&&typeof d.content==='string'?body(d):data.bodies[id]?bundled(id):d?.error?body(d):bundled(id)).catch(()=>bundled(id))}
    if(u.pathname==='/api/tweak'&&method==='POST'){const x=JSON.parse(options.body);if(x.action==='edit')edit.edits[x.id]={label:x.label,desc:x.desc};if(x.action==='hide'&&!edit.hidden.includes(x.id))edit.hidden.push(x.id);if(x.action==='unhide-all')edit.hidden=[];localStorage.setItem('unified-brain-copy-edits',JSON.stringify(edit));return body({ok:true})}
    if(u.pathname==='/api/bake'){localStorage.setItem('unified-brain-copy-bake',options.body);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([options.body],{type:'application/json'}));a.download='quiet-geometry-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);return body({ok:true,path:'quiet-geometry-settings.json'})}
    if(u.pathname==='/api/open'){if(!live)return body({error:'Ouvert comme fichier : utilise « Copier le chemin » pour ouvrir ce fichier.'});let p={};try{p=JSON.parse(options.body||'{}')}catch{}return realFetch('/api/open',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:p.path||''})}).then(r=>r.json()).then(d=>body(d.opened?{ok:true}:d)).catch(()=>body({error:'Impossible de joindre l’OS.'}))}
    if(u.pathname==='/api/rescan')return body({ok:true});
    return body({error:'Prototype hors ligne : requête indisponible'},404);
  };
})();
