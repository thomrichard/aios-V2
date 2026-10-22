/* The homepage orb face (the C3 halftone puzzle) and its coloured centre, a small copy of the Second Brain's 3D view. */
/* OS Evolve lab: the centre orb, evolved. Direction 0 is the live orb, untouched.
   The live module hands over its real scene (init) and calls tick() every frame.
   Design sources: Second Brain prototype 2026-10-15 (layer palette and ring
   motion constants from brain/port.js and graph.json), the approved puzzle
   thinking orb (thinking-orbs 0.3.2 rubik), and the chosen look 02 Layers unfold. */
(() => {
  /* layer palette from the Second Brain graph.json; Skills uses OS orange there too */
  const PAL = { A: [.247, .561, .831], R: [.851, .604, .122], M: [.604, .4, .878], S: [1, .42, .102] };
  const CREAM = [.91, .886, .824];
  const DOT_SHAPE = "hex", GREY_DOT_ALPHA = 0.64, HEX_AREA_K = Math.sqrt(2 * Math.PI / (3 * Math.sqrt(3)));
  const L = window.__labOrb = { dir: +(document.documentElement.dataset.odir || 0), ready: false,
    hover: 0, open: 0, opening: false, thinking: false, rings: { angA: 0, angR: 0, axA: 0, axR: 0 } };
  let C, T, live, o1, o1rings, o2, layers, puz, tags, warned = false;

  const PVERT = `
    attribute float aSize, aSeed; attribute vec3 aColor;
    uniform float uTime, uPix, uFade, uNear, uFar;
    varying vec3 vColor; varying float vA;
    void main(){
      vColor = aColor;
      vec4 mv = modelViewMatrix * vec4(position, 1.);
      float d = clamp((-mv.z - uNear) / (uFar - uNear), 0., 1.);
      vA = uFade * (1. - .62*d) * (.84 + .16*sin(uTime*1.3 + aSeed*40.));
      gl_PointSize = aSize * uPix * (120. / -mv.z);
      gl_Position = projectionMatrix * mv;
    }`;
  /* one shape per layer, as in the brain: dot, hex (apps), ring dot (routines),
     chip (memory), diamond (skills) */
  const PFRAG = `
    uniform float uShape; varying vec3 vColor; varying float vA;
    float hexd(vec2 p){ p = abs(p); return max(p.x*.866 + p.y*.5, p.y); }
    void main(){
      vec2 p = gl_PointCoord - .5; float a; float r = length(p);
      if (uShape < .5) a = smoothstep(.5, .15, r);
      else if (uShape < 1.5) { float h = hexd(p*1.06); a = smoothstep(.5,.43,h)*smoothstep(.31,.38,h) + smoothstep(.13,.06,r)*.8; }
      else if (uShape < 2.5) a = smoothstep(.5,.42,r)*smoothstep(.24,.31,r) + smoothstep(.12,.05,r);
      else if (uShape < 3.5) { vec2 q = abs(p) - .24; a = smoothstep(.07, -.02, length(max(q, 0.)) - .1); }
      else a = smoothstep(.5, .38, abs(p.x) + abs(p.y));
      a *= vA; if (a < .02) discard;
      gl_FragColor = vec4(vColor, a);
    }`;

  const fib = (i, n) => {
    const y = 1 - 2 * (i + .5) / n, rad = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
    return [rad * Math.cos(a), y, rad * Math.sin(a)];
  };
  function cloud(list, shape) {
    const n = list.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const siz = new Float32Array(n), sed = new Float32Array(n);
    list.forEach((d, i) => { pos.set(d.p, i * 3); col.set(d.c, i * 3); siz[i] = d.s; sed[i] = C.sr(i * 2.3 + shape * 17); });
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new T.BufferAttribute(col, 3));
    g.setAttribute('aSize', new T.BufferAttribute(siz, 1));
    g.setAttribute('aSeed', new T.BufferAttribute(sed, 1));
    return new T.Points(g, new T.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPix: { value: C.renderer.getPixelRatio() }, uFade: { value: 1 },
        uNear: { value: 60 }, uFar: { value: 130 }, uShape: { value: shape } },
      vertexShader: PVERT, fragmentShader: PFRAG, transparent: true, depthWrite: false,
      blending: T.AdditiveBlending }));
  }
  /* a soft glow under a set of badges: same points, bigger, faint round dots */
  function halo(list, k = 2.6, fade = .2) {
    const p = cloud(list.map(d => ({ ...d, s: d.s * k })), 0);
    p.material.uniforms.uFade.value = fade;
    return p;
  }
  const lineMat = (rgb, op) => new T.LineBasicMaterial({ color: new T.Color(...rgb), transparent: true,
    opacity: op, depthWrite: false, blending: T.AdditiveBlending });
  function ringLine(rgb, op, segs = 160) {
    const pts = [];
    for (let i = 0; i <= segs; i++) { const a = i / segs * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a), 0, Math.sin(a))); }
    return new T.Line(new T.BufferGeometry().setFromPoints(pts), lineMat(rgb, op));
  }
  function meridian(lon, rgb, op) {      /* pole to pole half circle, unit radius */
    const pts = [];
    for (let i = 0; i <= 64; i++) { const la = -Math.PI / 2 + i / 64 * Math.PI; pts.push(new T.Vector3(Math.cos(la), Math.sin(la), 0)); }
    const l = new T.Line(new T.BufferGeometry().setFromPoints(pts), lineMat(rgb, op));
    l.rotation.y = lon; return l;
  }
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const ease = (cur, target, dt, rate) => cur + (target - cur) * Math.min(1, dt * rate);
  /* the artifact ring in the orb group's units: the box shows 78.7 world units
     across 2.1 ring radii, so the ball ring sits at 37.5 world units */
  const ringUnits = () => 37.5 / C.getZoom();

  /* ---------- 01 ORBIT: the brain's tilted rings, in miniature ---------- */
  function buildOrbit() {
    o1 = new T.Group();                                   /* rides the globe */
    for (let k = 0; k < 5; k++) o1.add(meridian(k * Math.PI * 2 / 5 + .3, CREAM, .2));
    C.group.add(o1);
    o1rings = new T.Group();                              /* scene level: own motion */
    const mk = (n, shape, rgb, size, lineOp) => {
      const tilt = new T.Group(), spin = new T.Group();
      const list = Array.from({ length: n }, (_, i) => {
        const a = i / n * Math.PI * 2; return { p: [Math.cos(a), 0, Math.sin(a)], c: rgb, s: size };
      });
      spin.add(ringLine(rgb, lineOp));
      spin.add(halo(list));
      spin.add(cloud(list, shape));
      tilt.add(spin); o1rings.add(tilt); return { tilt, spin };
    };
    o1rings.A = mk(25, 1, PAL.A, 13, .38);               /* 25 apps, hex badges */
    o1rings.R = mk(77, 2, PAL.R, 5.4, .45);              /* 77 routines, ring dots */
    C.scene.add(o1rings);
  }

  /* ---------- 02 LAYERS: nested ARMS shells that part, then unfold ---------- */
  function buildLayers() {
    o2 = new T.Group(); C.group.add(o2);
    const lay = (key, frac) => { const g = new T.Group(); g.userData = { key, frac }; o2.add(g); return g; };
    const S = lay('S', .23), M = lay('M', .46), R = lay('R', .63), A = lay('A', .78);
    S.add(cloud(Array.from({ length: 260 }, (_, i) => ({ p: fib(i, 260), c: PAL.S, s: 3.4 })), 4));
    S.add(cloud(Array.from({ length: 640 }, (_, i) => {       /* hot core dust, like the live core */
      const d = fib(i, 640), r = Math.pow(C.sr(i + 7), .6) * .9;
      return { p: [d[0] * r, d[1] * r, d[2] * r], c: mix([1, .88, .68], PAL.S, C.sr(i + 3)), s: 2 + C.sr(i) * 2.6 };
    }), 0));
    const DEPT = [[.78, .5, .88], [.5, .77, .91], [.39, .78, .81], [.92, .81, .37], [.78, .64, .91]];
    M.add(cloud(Array.from({ length: 1100 }, (_, i) => {
      const p = fib(i, 1100), lon = (Math.atan2(p[2], p[0]) + Math.PI) / (Math.PI * 2);
      return { p, c: mix(PAL.M, DEPT[Math.floor(lon * 5) % 5], .22), s: 2.5 + C.sr(i + 9) * .9 };
    }), 3));
    for (let k = 0; k < 5; k++) M.add(meridian(k * Math.PI * 2 / 5, PAL.M, .34));
    const rList = Array.from({ length: 77 }, (_, i) => ({ p: fib(i, 77), c: PAL.R, s: 5.6 }));
    R.add(halo(rList)); R.add(cloud(rList, 2));
    R.add(ringLine(PAL.R, .3));
    const ico = new T.IcosahedronGeometry(1, 1);
    A.add(new T.LineSegments(new T.WireframeGeometry(ico), lineMat(PAL.A, .1)));
    const pos = ico.attributes.position.array, seen = new Set(), verts = [];
    for (let i = 0; i < pos.length; i += 3) {
      const key = pos.slice(i, i + 3).map(v => v.toFixed(3)).join();
      if (!seen.has(key)) { seen.add(key); verts.push([pos[i], pos[i + 1], pos[i + 2]]); }
    }
    const aList = verts.slice(0, 25).map(p => ({ p, c: PAL.A, s: 13 }));
    A.add(halo(aList)); A.add(cloud(aList, 1));
    layers = [S, M, R, A];
    /* layer names sit above their circles, no prefixes (brain default) */
    tags = document.createElement('div');
    tags.id = 'labLayerTags';
    tags.innerHTML = [['S', 'SKILLS'], ['M', 'MEMORY'], ['R', 'ROUTINES'], ['A', 'APPLICATIONS']]
      .map(([k, n]) => `<span data-k="${k}">${n}</span>`).join('');
    document.body.appendChild(tags);
  }

  /* ---------- 03 PUZZLE: the approved thinking orb becomes the face ----------
     Pattern presets for the face: a, b and c are rings, c1 hex, c2 spiral, c3 halftone (the one the homepage uses). */
  const PV = {
    a:  { spin: 0,    moves: .4,  pattern: 'rings', lat: 40, lon: 104, r: .42, a: .5,  act: .78, core: 1,   icon: 3   },
    b:  { spin: .06,  moves: .35, pattern: 'rings', lat: 48, lon: 124, r: .36, a: .46, act: .7,  core: .72, icon: 3.5 },
    c:  { spin: .025, moves: .3,  pattern: 'rings', lat: 62, lon: 160, r: .3,  a: .44, act: .64, core: 1,   icon: 0   },
    /* honeycomb: the face centres of a 4x subdivided icosahedron sit in hexagons, like the OS's own hex grid */
    c1: { spin: .025, moves: .3,  pattern: 'hex',   level: 3, wall: 2,  r: .42, a: .66, act: .8,  core: 1,   icon: 0   },
    /* spiral: golden-angle dots, sized by eight stripes that wind from pole to pole */
    c2: { spin: .025, moves: .3,  pattern: 'spiral', n: 5600,           r: .38, a: .5,  act: .66, core: 1,   icon: 0   },
    /* halftone: the /robo dot-matrix look, dots swell where a top-left light hits the globe.
       Every turn must land on the grid, with vertical shifts as well as horizontal. So: every ring holds a multiple of 4 dots,
       horizontal layers make quarter turns round y, vertical slices make half turns round x or z
       (the ring grid is mirror-symmetric, so a half turn lands too; a vertical quarter turn
       cannot), and the grid sits half a step off every slice boundary (no poles, no equator ring,
       no dot on x=0 or z=0), so float noise can never split a ring and leave a hole. */
    c3: { spin: .025, moves: .3,  pattern: 'halftone', lat: 56, lon: 146, quad: true, offset: true, axes: 'mixed',
          lit: true, r: .5, a: .55, act: .72, core: 1, icon: 0, mini: true },
    /* the same halftone on a cube grid (6 faces x 30 x 30, equal-angle): the grid is symmetric
       under every quarter turn about x, y and z, so Rubik turns on all three axes land exactly too */
    c4: { spin: .025, moves: .3,  pattern: 'cube', N: 30, lit: true,
          r: .5, a: .55, act: .72, core: 1, icon: 0, mini: true }
  };
  L.pv = PV[document.documentElement.dataset.pv] ? document.documentElement.dataset.pv : 'a';
  /* the Robo agent sprite, the same 4-column mirrored grid the Routines board paints (SPR4.robo) */
  const ROBO = [[0,0,1,0],[1,1,1,1],[1,1,1,1],[1,0,1,1],[1,1,1,1],[1,1,1,1],[1,0,0,1],[0,0,0,0]];
  /* solveCycle and applyMoves are thinking-orbs 0.3.2 (MIT, Jakub Antalik), copied
     unchanged so the spin can run on its own clock instead of the slice clock */
  function solveCycle(time, count, slotDur, rest) {
    const cyc = 2 * count * slotDur + rest, tc = time % cyc, amount = new Array(count).fill(0);
    let active = -1;
    if (tc < 2 * count * slotDur) {
      const slot = Math.floor(tc / slotDur), p = (tc - slot * slotDur) / slotDur;
      const cl = Math.min(1, p / 0.7), ep = 1 - (1 - cl) ** 3;
      if (slot < count) { for (let i = 0; i < slot; i++) amount[i] = 1; amount[slot] = ep; active = slot; }
      else { const u = 2 * count - 1 - slot; for (let i = 0; i < u; i++) amount[i] = 1; amount[u] = 1 - ep; active = u; }
    }
    return { amount, active };
  }
  function applyMoves(pt3, moves, sc) {
    let [x, y, z] = pt3, inActive = false;
    for (let i = 0; i < moves.length; i++) {
      if (sc.amount[i] <= 0) continue;
      const mv = moves[i], coord = mv.axis === 0 ? x : mv.axis === 1 ? y : z;
      if (coord < mv.lo || coord >= mv.hi) continue;
      if (i === sc.active) inActive = true;
      const a = mv.ang * sc.amount[i], ca = Math.cos(a), sa = Math.sin(a);
      if (mv.axis === 0) { const y2 = y * ca - z * sa; z = y * sa + z * ca; y = y2; }
      else if (mv.axis === 1) { const x2 = x * ca + z * sa; z = -x * sa + z * ca; x = x2; }
      else { const x2 = x * ca - y * sa; y = x * sa + y * ca; x = x2; }
    }
    return [x, y, z, inActive];
  }
  /* each pattern is a fixed list of unit-sphere points [x, y, z, weight], built once */
  const norm3 = v => { const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
  function patternPoints(cfg) {
    if (cfg._pts) return cfg._pts;
    const out = [];
    if (cfg.pattern === 'hex') {
      const t = (1 + Math.sqrt(5)) / 2;
      const V = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(norm3);
      let F = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
               [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
      for (let l = 0; l < cfg.level; l++) {
        const cache = new Map();
        const mid = (a, b) => {
          const k = a < b ? a + ':' + b : b + ':' + a;
          if (!cache.has(k)) { V.push(norm3([V[a][0] + V[b][0], V[a][1] + V[b][1], V[a][2] + V[b][2]])); cache.set(k, V.length - 1); }
          return cache.get(k);
        };
        F = F.flatMap(([a, b, c]) => { const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
          return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]; });
      }
      /* face centres are the honeycomb's corners; dots along each shared edge draw the cell walls */
      const cen = F.map(([a, b, c]) => norm3([V[a][0] + V[b][0] + V[c][0], V[a][1] + V[b][1] + V[c][1], V[a][2] + V[b][2] + V[c][2]]));
      cen.forEach(p => out.push([...p, 1]));
      const edges = new Map();
      F.forEach((f, fi) => [[f[0], f[1]], [f[1], f[2]], [f[2], f[0]]].forEach(([a, b]) => {
        const k = a < b ? a + ':' + b : b + ':' + a;
        if (edges.has(k)) {
          const p = cen[edges.get(k)], q = cen[fi];
          for (let s = 1; s <= cfg.wall; s++) {
            const u = s / (cfg.wall + 1);
            out.push([...norm3([p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u]), .8]);
          }
        } else edges.set(k, fi);
      }));
    } else if (cfg.pattern === 'spiral') {
      const g = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < cfg.n; i++) {
        const y = 1 - 2 * (i + .5) / cfg.n, rad = Math.sqrt(1 - y * y), a = i * g;
        /* stripes that wind pole to pole (loxodromes): 6 arms, a third of a turn per radian of latitude */
        const x = rad * Math.cos(a), z = rad * Math.sin(a);
        out.push([x, y, z, .5 + .5 * Math.cos(8 * Math.atan2(z, x) + 12 * Math.asin(y))]);
      }
    } else if (cfg.pattern === 'cube') {
      /* equal-angle cube sphere; offsets never hit 0 (N even), so no dot sits on a slice boundary */
      const a = Array.from({ length: cfg.N }, (_, i) => Math.tan(-Math.PI / 4 + (i + .5) * Math.PI / (2 * cfg.N)));
      for (const s of [1, -1]) for (const u of a) for (const v of a) {
        out.push([...norm3([s, u, v]), 1], [...norm3([u, s, v]), 1], [...norm3([u, v, s]), 1]);
      }
    } else {                                     /* rings and halftone share the lat-lon grid */
      /* offset: rings and dots sit half a step in (lat count even, so no equator ring and no poles) */
      const h = cfg.offset ? .5 : 0, rings = cfg.offset ? cfg.lat - 1 : cfg.lat;
      for (let li = 0; li <= rings; li++) {
        const lat = -Math.PI / 2 + (li + h) / cfg.lat * Math.PI, cl = Math.cos(lat), sl = Math.sin(lat);
        const k = Math.abs(cl) * cfg.lon;
        /* quad: ring counts rounded to a multiple of 4, so quarter turns map dots onto dots; the poles stay one dot */
        const n = cfg.quad ? (Math.abs(cl) < 1e-9 ? 1 : 4 * Math.max(1, Math.round(k / 4))) : Math.max(1, Math.round(k));
        for (let lj = 0; lj < n; lj++) { const lon = (lj + h) / n * 2 * Math.PI; out.push([cl * Math.cos(lon), sl, cl * Math.sin(lon), 1]); }
      }
    }
    return (cfg._pts = out);
  }
  const LIGHT = norm3([-.45, .55, .7]);          /* halftone light: top left, toward the viewer */
  /* the engine's 14 moves, fitted to what a pattern survives: 'y' forces every turn horizontal;
     'mixed' keeps the engine's own mix of axes but makes x and z turns half turns */
  function movesFor(cfg) {
    if (cfg._moves) return cfg._moves;
    return (cfg._moves = puz.moves.map(m =>
      cfg.axes === 'y' ? { ...m, axis: 1 }
      : cfg.axes === 'mixed' && m.axis !== 1 ? { ...m, ang: m.ang * 2 }
      : m));
  }
  /* numeric proof for the check: at every settled moment of a full solve, how far is each dot
     from the nearest original grid place? Exact turns give float noise only (~1e-15). */
  L.alignReport = (key, override) => {
    const cfg = Object.assign({}, PV[key], override || {});
    delete cfg._pts; delete cfg._moves; delete cfg._heat;
    const pts = patternPoints(cfg), moves = movesFor(cfg), slot = .42, n = moves.length;
    const keyOf = p => p.slice(0, 3).map(v => Math.round(v * 1e6)).join(',');
    const home = new Set(pts.map(keyOf));
    let worst = 0, missed = 0, checks = 0, measured = 0, holes = 0;
    for (let s = 0; s <= 2 * n; s++) {               /* slot boundaries: every move fully done or not started */
      const sc = solveCycle(s * slot + 1e-9, n, slot, 1.2);
      sc.amount = sc.amount.map(v => v > .5 ? 1 : 0); sc.active = -1;
      const landed = new Set();
      for (const p of pts) {
        const q = applyMoves(p, moves, sc);
        landed.add(keyOf(q));
        checks++;
        if (home.has(keyOf(q))) continue;
        if (measured++ > 400) { missed++; continue; }   /* enough samples to size the gap */
        let best = 9;
        for (const h of pts) best = Math.min(best, Math.hypot(q[0] - h[0], q[1] - h[1], q[2] - h[2]));
        if (best > 1e-6) missed++;
        worst = Math.max(worst, best);
      }
      holes += pts.length - landed.size;            /* two dots on one place leaves a gap elsewhere */
    }
    const vertical = moves.filter(m => m.axis !== 1).length;
    return { dots: pts.length, checks, offGrid: missed, holes, worstGap: +worst.toExponential(2),
      turns: `${moves.length - vertical} horizontal, ${vertical} vertical` };
  };
  function buildPuzzle() {
    const cv = document.createElement('canvas');
    cv.id = 'labPuzzle';
    C.box.appendChild(cv);
    const E = window.ThinkingOrbs, moves = [];
    for (let i = 0; i < 14; i++) {     /* makeMoves(14), as the engine builds it */
      const axis = Math.min(2, Math.floor(E.hashD(i, 2.3) * 3));
      const lo = -1 + 0.5 * Math.min(3, Math.floor(E.hashD(i, 5.9) * 4));
      moves.push({ axis, lo, hi: lo + 0.5, ang: (E.hashD(i, 7.7) < 0.5 ? 1 : -1) * Math.PI / 2 });
    }
    puz = { cv, ctx: cv.getContext('2d'), moveT: 2.3, yaw: .9, tilt: .38, size: 0, moves };
  }
  /* SPEED. A CPU profile put 67% of the page's time in this
     paint: per dot it built arrays and objects, ran 14 sin/cos pairs and parsed a colour
     string. Now every move's sin/cos is worked out once per frame, dots live in reused typed
     arrays (nothing allocated per frame), colours are set once per colour level with the dot's
     own alpha as globalAlpha, and a frame that would draw the same picture is skipped. The
     maths per dot is the same as before, so turns still land exactly on the grid. */
  const LEVELS = 24;                              /* grey to white, in 24 colour steps */
  const LEVEL_RGB = Array.from({ length: LEVELS + 1 }, (_, k) => {
    const m = k / LEVELS; return `rgb(${232 + 18 * m | 0},${226 + 22 * m | 0},${210 + 34 * m | 0})`;
  });
  const MV_ON = new Uint8Array(64), MV_C = new Float64Array(64), MV_S = new Float64Array(64);
  const LV_AT = new Int32Array(LEVELS + 1);
  let SX, SY, SR, SA, SZ, SL, SORD;
  function scratch(n) {
    if (SX && SX.length >= n) return;
    SX = new Float32Array(n); SY = new Float32Array(n); SR = new Float32Array(n); SA = new Float32Array(n);
    SZ = new Float32Array(n); SL = new Uint8Array(n); SORD = new Int32Array(n);
  }
  function cfgBuf(cfg) {                          /* the pattern as one flat x, y, z, weight array */
    if (cfg._buf) return cfg._buf;
    const p = patternPoints(cfg), b = new Float64Array(p.length * 4);
    p.forEach((q, i) => b.set(q, i * 4));
    return (cfg._buf = b);
  }
  const hexPath = (ctx, x, y, hr) => { const hw = hr * .8660254037844386, hq = hr * .5;
    ctx.beginPath(); ctx.moveTo(x, y - hr); ctx.lineTo(x + hw, y - hq); ctx.lineTo(x + hw, y + hq);
    ctx.lineTo(x, y + hr); ctx.lineTo(x - hw, y + hq); ctx.lineTo(x - hw, y - hq); ctx.fill(); };
  let HX = null;
  function hexSheet(dpr) {
    if (HX && HX.dpr === dpr) return HX;
    const MIN = 1, STEP = .25, NB = 24, cells = [];
    let y = 0, cw = 0;
    for (let b = 0; b < NB; b++) {
      const rb = MIN + b * STEP, hr = rb * HEX_AREA_K * dpr, c = Math.ceil(hr * 2) + 2;
      cells.push({ rb, c, y, d: c / dpr / rb }); y += c; cw = Math.max(cw, c);
    }
    const off = typeof OffscreenCanvas === 'function', W = cw * (LEVELS + 1);
    let cv = off ? new OffscreenCanvas(W, y) : Object.assign(document.createElement('canvas'), { width: W, height: y });
    const x = cv.getContext('2d');
    cells.forEach(cell => { for (let k = 0; k <= LEVELS; k++) {
      x.fillStyle = LEVEL_RGB[k]; hexPath(x, k * cw + cell.c / 2, cell.y + cell.c / 2, cell.rb * HEX_AREA_K * dpr); } });
    if (off) cv = cv.transferToImageBitmap();
    return (HX = { dpr, cv, cells, cw, MIN, STEP, NB, minR: 2 / dpr });
  }
  function paintPuzzle(dt, t) {
    const E = window.ThinkingOrbs;
    if (!E || !E.makeProj) return;
    const cfg = PV[L.pv], prof = E.BASE_PROFILES.rubik;
    const OB = C.box.offsetWidth || 600;
    /* canvas = 1.8 ring radii; the sphere fills 82% of it */
    const size = Math.round(OB / 2.1 * 1.8 * Math.max(.02, 1 - C.getCollapse()));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let resized = false;
    if (size !== puz.size || dpr !== puz.dpr) {   /* a zoom or a move to another screen changes dpr, not size */
      puz.size = size; puz.dpr = dpr; resized = true;
      puz.cv.width = Math.max(2, Math.round(size * dpr)); puz.cv.height = puz.cv.width;
      Object.assign(puz.cv.style, { width: size + 'px', height: size + 'px',
        left: (OB - size) / 2 + 'px', top: (OB - size) / 2 + 'px' });
    }
    /* two clocks: the slices think (faster on hover, solving while it opens); the globe barely turns */
    puz.moveT += dt * (cfg.moves + L.hover * 1.05 + L.open * 4) * (L.speedMul || 1);
    /* the scroll wheel and drag-to-spin turn the live orb group, so the dot globe takes the
       same push as before: its own slow drift, plus whatever the group gained this
       frame beyond its built-in .06 rad/s drift */
    const gy = C.group.rotation.y, gx = C.group.rotation.x;
    if (puz.gy === undefined) { puz.gy = gy; puz.gx = gx; }
    puz.yaw += dt * cfg.spin + (gy - puz.gy) - dt * .06;
    puz.tilt = Math.max(-.6, Math.min(1.3, puz.tilt + (gx - puz.gx)));
    puz.gy = gy; puz.gx = gx;
    const cx = size / 2, R = size / 2 * .82;
    const moves = movesFor(cfg), nm = moves.length, sc = solveCycle(puz.moveT, nm, .42, 1.2), active = sc.active;
    /* skip a frame that would draw the same picture: no turn moving, no dot mid-fade, the globe
       moved under a fifth of a pixel since the last draw, same size and pattern (or paused by a host) */
    const amt = active >= 0 ? sc.amount[active] : -1;
    if (L.paused || (!resized && puz.settled && puz.drawnPv === L.pv && puz.drawnActive === active && puz.drawnAmt === amt
        && Math.abs(puz.yaw - puz.drawnYaw) * R < .2 && Math.abs(puz.tilt - puz.drawnTilt) * R < .2)) {
      puz.hdt = 0; L.skipped = (L.skipped || 0) + 1; return;
    }
    /* lite: the face redraws at most L.faceFps times a second (thousands of dots per draw); the time
       in between still counts for the slice heat, so turns brighten and fade at the same pace */
    puz.hdt = (puz.hdt || 0) + dt;
    if (!resized && L.faceFps && t - (puz.paintT || 0) < 1 / L.faceFps) { L.skipped = (L.skipped || 0) + 1; return; }
    const hdt = puz.hdt; puz.hdt = 0; puz.paintT = t;
    const pts = cfgBuf(cfg), n = pts.length / 4;
    scratch(n);
    /* each dot keeps a heat: it climbs while its slice turns and drains after, and the
       colour follows a smoothstep of it, so grey eases into white and fades back */
    if (!cfg._heat || cfg._heat.length !== n) cfg._heat = new Float32Array(n);
    const heat = cfg._heat, up = hdt / .45, down = hdt / .9;
    for (let m = 0; m < nm; m++) {                /* each move's turn, once per frame (was once per dot) */
      const a = sc.amount[m]; MV_ON[m] = a > 0 ? 1 : 0;
      if (a > 0) { const ang = moves[m].ang * a; MV_C[m] = Math.cos(ang); MV_S[m] = Math.sin(ang); }
    }
    const sy = Math.sin(puz.yaw), cyw = Math.cos(puz.yaw), st = Math.sin(puz.tilt), ct = Math.cos(puz.tilt);
    const rs = E.radiusScale(size, prof.rsPow), rB = prof.rBase, rD = prof.rDepth, inkFar = prof.inkFar, inkSpan = prof.inkSpan;
    const cr = cfg.r, ca = cfg.a * GREY_DOT_ALPHA, cact = cfg.act, lit = cfg.lit, pattern = cfg.pattern;
    const L0 = LIGHT[0], L1 = LIGHT[1], L2 = LIGHT[2];
    LV_AT.fill(0);
    let midFade = false;
    for (let i = 0; i < n; i++) {
      const o = i * 4, w = pts[o + 3];
      let x = pts[o], y = pts[o + 1], z = pts[o + 2], act = false;
      for (let m = 0; m < nm; m++) {              /* applyMoves, same maths, no arrays */
        if (!MV_ON[m]) continue;
        const mv = moves[m], coord = mv.axis === 0 ? x : mv.axis === 1 ? y : z;
        if (coord < mv.lo || coord >= mv.hi) continue;
        if (m === active) act = true;
        const c = MV_C[m], s = MV_S[m];
        if (mv.axis === 0) { const y2 = y * c - z * s; z = y * s + z * c; y = y2; }
        else if (mv.axis === 1) { const x2 = x * c + z * s; z = -x * s + z * c; x = x2; }
        else { const x2 = x * c - y * s; y = x * s + y * c; x = x2; }
      }
      /* makeProj, inline: x1 and y1 are also the view-space normal for the halftone light */
      const x1 = x * cyw + z * sy, z1 = -x * sy + z * cyw, y1 = y * ct - z1 * st, z2 = y * st + z1 * ct;
      const depth = (z2 + 1) / 2;
      let h = heat[i];
      h = act ? (h + up > 1 ? 1 : h + up) : (h - down < 0 ? 0 : h - down);
      heat[i] = h;
      if (h > 0 && h < 1) midFade = true;
      const mix = h * h * (3 - 2 * h);
      let sizeK = 1, alphaK = 1;
      if (pattern === 'spiral') { sizeK = .25 + 1.3 * Math.pow(w, 4); alphaK = .3 + .75 * w * w; }
      else if (pattern === 'hex') sizeK = w;
      else if (lit) {
        let lam = x1 * L0 + y1 * L1 + z2 * L2; if (lam < 0) lam = 0;
        sizeK = .22 + 1.45 * Math.pow(lam, 1.15); alphaK = .4 + .8 * lam;
      }
      const r = (rB + rD * depth) * rs * cr * sizeK;
      let light = (.16 + .84 * Math.min(1, (1 - (inkFar - inkSpan * depth)) * 1.12)) * alphaK;
      if (light > 1) light = 1;
      SX[i] = cx + x1 * R; SY[i] = cx - y1 * R; SR[i] = r < .3 ? .3 : r; SZ[i] = z2;
      /* grey cream at rest, easing to a soft white while its slice turns */
      SA[i] = mix < .004 ? light * ca : Math.min(1, light * (ca + (cact - ca) * mix));
      const lv = mix < .004 ? 0 : Math.max(1, Math.round(mix * LEVELS));
      SL[i] = lv; LV_AT[lv]++;
    }
    /* counting sort by colour level, so each level sets its colour once */
    for (let k = 0, acc = 0; k <= LEVELS; k++) { const c = LV_AT[k]; LV_AT[k] = acc; acc += c; }
    for (let i = 0; i < n; i++) SORD[LV_AT[SL[i]]++] = i;
    const ctx = puz.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    const hex = L.dotShape === 'hex', hs = hex ? hexSheet(dpr) : null;
    const passes = cfg.icon ? 2 : 1;               /* Robo sits inside the globe: back half, Robo, front half */
    for (let pass = 0; pass < passes; pass++) {
      if (pass === 1) { ctx.globalAlpha = 1; drawRobo(ctx, cx, t, cfg); }
      for (let k = 0, start = 0; k <= LEVELS; k++) {
        const end = LV_AT[k];
        if (end > start) {
          ctx.fillStyle = LEVEL_RGB[k];
          for (let j = start; j < end; j++) {
            const i = SORD[j];
            if (passes === 2 && (pass === 0) !== (SZ[i] < 0)) continue;
            if (L.lite && SZ[i] < -.15) continue;   /* lite: skip the far side's faint dots */
            const r = SR[i];
            ctx.globalAlpha = SA[i];
            if (r < 1) ctx.fillRect(SX[i] - r, SY[i] - r, r * 2, r * 2);
            else if (hex && r >= hs.minR) {      /* pointy-top hexagon, same area as the circle */
              const b = Math.round((r - hs.MIN) / hs.STEP);
              if (b >= hs.NB) { hexPath(ctx, SX[i], SY[i], r * HEX_AREA_K); continue; }
              const cell = hs.cells[b < 0 ? 0 : b], d = cell.d * r;
              ctx.drawImage(hs.cv, k * hs.cw, cell.y, cell.c, cell.c, SX[i] - d / 2, SY[i] - d / 2, d, d);
            }
            else { ctx.beginPath(); ctx.arc(SX[i], SY[i], r, 0, 6.283185307179586); ctx.fill(); }
          }
        }
        start = end;
      }
    }
    ctx.globalAlpha = 1;
    puz.drawnSc = sc; puz.drawnR = R; puz.drawnCx = cx;
    puz.settled = !midFade; puz.drawnPv = L.pv; puz.drawnActive = active; puz.drawnAmt = amt;
    puz.drawnYaw = puz.yaw; puz.drawnTilt = puz.tilt;
    L.drawn = (L.drawn || 0) + 1;
  }
  function drawRobo(ctx, c, t, cfg) {
    if (!cfg.icon) return;
    const p = cfg.icon * Math.max(.02, 1 - C.getCollapse());
    const hop = Math.max(0, Math.sin(t * 5.2)) ** 6 * -p * .5;   /* the board's little agent hop */
    const x0 = c - 4 * p, y0 = c - 4 * p + hop;
    const g = ctx.createRadialGradient(c, c, 0, c, c, p * 9);     /* a soft dark seat so it reads on the core */
    g.addColorStop(0, `rgba(5,5,4,${cfg.core ? .55 : .2})`); g.addColorStop(1, 'rgba(5,5,4,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, p * 9, 0, Math.PI * 2); ctx.fill();
    if (!cfg.core) {                                                  /* no core: Robo carries the warmth */
      const w = ctx.createRadialGradient(c, c, 0, c, c, p * 7);
      w.addColorStop(0, 'rgba(255,107,26,.22)'); w.addColorStop(1, 'rgba(255,107,26,0)');
      ctx.fillStyle = w; ctx.beginPath(); ctx.arc(c, c, p * 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#ff6b1a';
    for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) if (ROBO[y][x]) {
      ctx.fillRect(x0 + x * p, y0 + y * p, p + .3, p + .3);
      ctx.fillRect(x0 + (7 - x) * p, y0 + y * p, p + .3, p + .3);
    }
  }
  L.dotShape = DOT_SHAPE;
  L.setDotShape = s => { L.dotShape = s === 'hex' ? 'hex' : 'circle'; if (puz) puz.drawnPv = null; };
  L.setPV = v => { if (PV[v]) { L.pv = v; L.set(L.dir); } };
  /* proof for the speed pass: redo the last drawn frame the old way (applyMoves + the engine's
     makeProj) and report the largest gap, in pixels, from where the fast loop put each dot */
  L.paintSelfTest = () => {
    if (!puz || !puz.drawnSc) return null;
    const E = window.ThinkingOrbs, cfg = PV[L.pv], pts = patternPoints(cfg), moves = movesFor(cfg);
    const pt = E.makeProj(puz.drawnYaw, puz.drawnTilt, puz.drawnCx, puz.drawnCx, puz.drawnR);
    let worst = 0;
    pts.forEach((p, i) => {
      const [x, y, z] = applyMoves(p, moves, puz.drawnSc), [px, py] = pt(x, y, z);
      worst = Math.max(worst, Math.abs(px - SX[i]), Math.abs(py - SY[i]));
    });
    return { dots: pts.length, worstPx: +worst.toExponential(2), drawn: L.drawn, skipped: L.skipped || 0 };
  };
  /* read-only numbers for the headless check: globe yaw and how many dots sit mid-fade */
  L.debug = () => {
    const h = PV[L.pv]._heat || [];
    let mid = 0, hot = 0;
    for (const v of h) { if (v > .02 && v < .98) mid++; if (v >= .98) hot++; }
    let turn = null;
    if (puz) {
      const mv = movesFor(PV[L.pv]), sc = solveCycle(puz.moveT, mv.length, .42, 1.2);
      if (sc.active >= 0) turn = { axis: 'xyz'[mv[sc.active].axis], amount: +sc.amount[sc.active].toFixed(2) };
    }
    return { yaw: puz ? puz.yaw : null, tilt: puz ? puz.tilt : null, midFade: mid, white: hot, dots: h.length, turn };
  };

  /* ---------- the coloured centre as a small copy of the Second Brain's 3D orbs ----------
     The centre is the Second Brain's 3D view in small: brain/port.js nests the layers at radii A 1, R .81,
     M .59, S .19 (AGENTS md at the centre); Memory sits in department wedges by longitude from
     -pi, each as wide as its share of files (min .035), in graph.json's order; the rings follow
     the brain's ringVector (see tickMini). Colours: the Second Brain's skin
     (brain/index.html), put in by build-home.mjs. The particles use the live core's own shader, so it glows like the old core. */
  const hex3 = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  /* departments, skills, routines and apps come from assets/home-orb-mini.js, written by refresh/brain.mjs */
  const MINI = window.HOME_ORB_MINI || { U: 7.5, depts: [['general', '#9a66e0', 400]], S: ['#f2efe8', 60], R: ['#d99a1f', 24], A: ['#3f8fd4', 12] };
  let mini = null;
  function miniCloud(list) {
    const n = list.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    const siz = new Float32Array(n), sed = new Float32Array(n);
    list.forEach((d, i) => { pos.set(d.p, i * 3); col.set(d.c, i * 3); siz[i] = d.s; sed[i] = C.sr(i * 3.7 + 17); });
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('aColor', new T.BufferAttribute(col, 3));
    g.setAttribute('aSize', new T.BufferAttribute(siz, 1));
    g.setAttribute('aSeed', new T.BufferAttribute(sed, 1));
    return new T.Points(g, new T.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPix: { value: C.renderer.getPixelRatio() }, uHue: { value: 0 }, uSpread: { value: 0 } },
      vertexShader: C.VERT, fragmentShader: C.FRAG, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
  }
  function buildMini() {
    const U = MINI.U, shade = (c, i, k) => { const b = .8 + .2 * C.sr(i * 1.3 + k); return [c[0] * b, c[1] * b, c[2] * b]; };
    const memory = [], skills = [];
    const total = MINI.depts.reduce((s, d) => s + d[2], 0);
    const weights = MINI.depts.map(d => Math.max(.035, d[2] / total)), wsum = weights.reduce((a, b) => a + b, 0);
    let from = -Math.PI;
    MINI.depts.forEach(([key, hex, cnt], di) => {
      const width = Math.PI * 2 * weights[di] / wsum, s0 = from + .025, span = width - .05, c = hex3(hex);
      for (let i = 0; i < cnt; i++) {
        const y = 1 - 2 * (i + .5) / cnt, rr = Math.sqrt(1 - y * y), lon = s0 + span * ((i * .6180339887) % 1);
        const r = .59 * U * (.96 + .08 * C.sr(i * 7.1 + di));
        memory.push({ p: [rr * Math.cos(lon) * r, y * r, rr * Math.sin(lon) * r], c: shade(c, i, di), s: 2.6 + 1.7 * C.sr(i + di * 97) });
      }
      from += width;
    });
    const orange = hex3(MINI.S[0]), core = hex3('#ff6b1a');   /* Skills in the skin's colour; AGENTS md stays OS orange */
    for (let i = 0; i < MINI.S[1]; i++) {          /* Skills: a small sphere round AGENTS md */
      const d = fib(i, MINI.S[1]), r = .19 * U * (.55 + .45 * C.sr(i + 300));
      skills.push({ p: [d[0] * r, d[1] * r, d[2] * r], c: shade(orange, i, 5), s: 3 + 2 * C.sr(i + 400) });
    }
    for (let i = 0; i < 60; i++) {                 /* AGENTS md: the hot centre, white into orange */
      const d = fib(i, 60), r = .06 * U * C.sr(i + 500);
      skills.push({ p: [d[0] * r, d[1] * r, d[2] * r], c: mix([1, .88, .68], core, C.sr(i + 600) * .5), s: 3.5 + 2.5 * C.sr(i + 700) });
    }
    mini = new T.Group();
    mini.add(miniCloud(memory), miniCloud(skills));
    const ring = (n, hex, radius, size, glow) => {  /* radius baked in, so the shader's wobble stays core-sized */
      const outer = new T.Group(), tilt = new T.Group(), spin = new T.Group(), c = hex3(hex);
      const at = (i, s, k) => { const a = i / n * Math.PI * 2;
        return { p: [Math.cos(a) * radius, 0, Math.sin(a) * radius], c: shade(c, i, n).map(v => v * k), s }; };
      /* a faint wide dot under each one, like the brain's glow round its badges */
      spin.add(miniCloud(Array.from({ length: n }, (_, i) => at(i, size * 2.6, glow))));
      spin.add(miniCloud(Array.from({ length: n }, (_, i) => at(i, size, 1))));
      tilt.add(spin); outer.add(tilt); mini.add(outer); return { outer, tilt, spin };
    };
    mini.R = ring(MINI.R[1], MINI.R[0], .81 * U, 4.2, .2);
    mini.A = ring(MINI.A[1], MINI.A[0], 1 * U, 7.5, .3);
    L.miniU = U; L.mini = mini;
    mini.visible = false;
    C.group.add(mini);
  }
  function tickMini(dt) {
    /* the brain's ringVector (brain/port.js), so the rings line up when the click zooms in:
       phi = ringAxis precesses the tilt direction (outer turn round y); the tilt only breathes,
       base * (1 + .4 sin 1.7 phi), base A +.22 / R -.20, and is negated because three's
       rotation.x lifts the back where the brain lifts the front; the spin runs the other way
       round for the same reason. Speeds are the brain's. L.rings carries the same values the
       brain's ringAngles / ringAxis do, so the host copies them across at the click. */
    const r = L.rings;
    r.angA += dt * .066; r.angR -= dt * .0864; r.axA += dt * .042; r.axR -= dt * .0324;
    const set = (g, base, phi, ang) => {
      g.outer.rotation.y = phi;
      g.tilt.rotation.x = -(base * (1 + .4 * Math.sin(1.7 * phi)));
      g.spin.rotation.y = -ang;
    };
    set(mini.A, .22, r.axA, r.angA);
    set(mini.R, -.20, r.axR, r.angR);
    /* the tweak panel tints anything with uHue in the orb group; these colours must stay the brain's */
    mini.traverse(o => { if (o.material && o.material.uniforms) { o.material.uniforms.uHue.value = 0; o.material.uniforms.uSpread.value = 0; } });
  }

  /* ---------- switching ---------- */
  L.set = d => {
    L.dir = d;
    if (!L.ready) return;
    const { core, shell, mesh } = live, pv = PV[L.pv];
    if (puz) puz.drawnPv = null;                  /* a switch always redraws the face */
    core.visible = d !== 2 && !(d === 3 && (!pv.core || pv.mini));
    if (mini) mini.visible = d === 3 && !!pv.mini;   /* the 3D-orbs centre replaces the colour-arm core */
    shell.visible = d === 0 || d === 1;
    mesh.visible = d === 0;
    C.cage.visible = d === 0;
    C.cube.visible = d !== 3;             /* in the puzzle, Robo takes the centre */
    o1.visible = o1rings.visible = d === 1;
    o2.visible = d === 2;
    puz.cv.style.display = d === 3 ? 'block' : 'none';
    tags.style.display = d === 2 ? 'block' : 'none';
    /* the globe shrinks to make room for the rings; puzzle versions set their own core size */
    const k = d === 1 ? .8 : d === 3 ? (pv.core || 1) : 1;
    [core, shell, C.cube].forEach(o => o.scale.setScalar(k));
    o1.scale.setScalar(11.5 * 1.004 * k);
  };

  L.init = c => {
    try {
      C = c; T = c.THREE;
      const kids = c.group.children;
      live = { core: kids[0], shell: kids[1], mesh: kids[3] };
      if (!(live.core.isPoints && live.shell.isPoints && live.mesh.isLineSegments && kids[4] === c.cage))
        throw new Error('live orb layout changed - lab hooks need a look');
      buildOrbit(); buildLayers(); buildPuzzle(); buildMini();
      L.ready = true;
      L.set(L.dir);
    } catch (e) { console.warn('[lab orb]', e); }
  };

  L.tick = (dt, t) => {
    if (!L.ready) return;
    try {
      const hovering = document.body.classList.contains('orbcore') ? 1 : 0;
      L.hover = ease(L.hover, hovering, dt, 5);
      L.open = ease(L.open, (L.opening || L.thinking) ? 1 : 0, dt, (L.opening || L.thinking) ? 3.2 : 6);
      const ru = ringUnits(), col = Math.max(.02, 1 - C.getCollapse());
      if (L.dir === 1) {
        /* ring motion constants from the brain prototype (brain/port.js) */
        const r = L.rings;
        r.angA += dt * .066 * (1 + L.hover * 1.5); r.angR -= dt * .0864 * (1 + L.hover * 1.5);
        r.axA += dt * .042; r.axR -= dt * .0324;
        const zoom = C.getZoom();
        o1rings.scale.setScalar(col);
        o1rings.A.tilt.rotation.x = 1.12 + r.axA; o1rings.A.spin.rotation.y = r.angA;
        o1rings.R.tilt.rotation.x = .32 + r.axR; o1rings.R.spin.rotation.y = r.angR;
        const spread = 1 + L.hover * .035 + L.open * .1;
        o1rings.A.tilt.scale.setScalar(ru * zoom * .84 * spread);
        o1rings.R.tilt.scale.setScalar(ru * zoom * .72 * spread);
        o1rings.traverse(o => { if (o.material && o.material.uniforms) {
          o.material.uniforms.uTime.value = t;
          o.material.uniforms.uNear.value = 95 - ru * zoom * .84;
          o.material.uniforms.uFar.value = 95 + ru * zoom * .84;
        } });
      } else if (L.dir === 2) {
        /* each layer turns its own way; hover parts them, a click unfolds them */
        const SPIN = [.2, -.07, .066, -.0864], PART = [0, .1, .13, .07], OPEN = [.05, .28, .34, .16];
        const TILT = [0, .5, -.62, .9];
        layers.forEach((g, i) => {
          g.rotation.y += dt * SPIN[i] * (1 + L.hover);
          g.rotation.x = TILT[i] * L.open;
          const r = ru * g.userData.frac * (1 + PART[i] * L.hover + OPEN[i] * L.open);
          g.scale.setScalar(r);
          g.userData.r = r;
        });
        const zoom = C.getZoom();
        o2.traverse(o => { if (o.material && o.material.uniforms) {
          o.material.uniforms.uNear.value = 95 - ru * zoom * .8;
          o.material.uniforms.uFar.value = 95 + ru * zoom * .8;
        } });
        /* tags: on hover or while unfolding, each name at the top of its circle */
        const show = Math.max(L.hover, L.open);
        tags.style.opacity = show.toFixed(3);
        if (show > .01) {
          const OB = C.box.offsetWidth, px = OB / 78.7, cx = orbCX(), cy = orbCY();
          tags.querySelectorAll('span').forEach((s, i) => {
            const rr = layers[i].userData.r * zoom * px * col * (1 + .018 * Math.sin(t * 1.3));
            s.style.transform = `translate(${cx}px, ${cy - rr - 10}px) translate(-50%, -100%)`;
          });
        }
      } else if (L.dir === 3) {
        if (mini && mini.visible) tickMini(dt);
        paintPuzzle(dt, t);
      }
    } catch (e) { if (!warned) { warned = true; console.warn('[lab orb tick]', e); } }
  };

  /* a click on the core: new directions play their own open first, then the
     live Second Brain opening runs exactly as it does today */
  window.__labOrbOpen = orig => {
    if (!L.ready || L.dir === 0) return orig();
    if (L.opening) return;
    L.opening = true;
    setTimeout(orig, L.dir === 2 ? 820 : 520);
    setTimeout(() => { L.opening = false; }, 1600);
  };
})();
