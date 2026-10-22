// Holds the folder expansions (snapshot-expansions.js, ~2.6 MB) off the page's main thread (speed pass,
// 2026-10-16). offline.js asks it for one folder's files or for search results; parsing the whole file
// on the page used to stall the 3D view for ~150 ms a few seconds after the brain opened.
// The search is the same as offline.js's: snapshot graph nodes first, then every expanded file.
let exp = null, nodes = null;
const body = text => JSON.parse(text.slice(text.indexOf('=') + 1).replace(/;\s*$/, ''));
const loadExp = () => exp || (exp = fetch('snapshot-expansions.js').then(r => r.text()).then(body));
const loadNodes = () => nodes || (nodes = fetch('snapshot.js').then(r => r.text()).then(t => body(t).graph.nodes));
onmessage = async e => {
  const { id, kind, path, q } = e.data;
  try {
    let result = true;
    if (kind === 'warm') await loadExp();
    if (kind === 'expand') result = (await loadExp())[path] || [];
    if (kind === 'search') {
      const [x, g] = await Promise.all([loadExp(), loadNodes()]), needle = String(q || '').toLowerCase();
      const all = new Map([...g, ...Object.values(x).flat()].map(n => [n.id, n]));
      result = [...all.values()].filter(n => (n.path || n.id).toLowerCase().includes(needle) || n.label.toLowerCase().includes(needle)).slice(0, 40)
        .map(n => ({ ...n, name: n.label, path: n.path || n.id }));
    }
    postMessage({ id, result });
  } catch (err) { postMessage({ id, error: String(err) }); }
};
