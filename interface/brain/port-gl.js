// WebGL sprite layer for the Second Brain renderer (port.js), added in the speed pass (2026-10-16).
// The 2D canvas spent most of each frame on ~1,750 drawImage calls spread over many sprite sheets:
// Chrome replays every call in its GPU process and breaks batches whenever the sheet changes.
// Here every node sprite goes into one instanced draw that reads all the sheets (one texture each).
// Same pixels: the sheets upload premultiplied, sampling is bilinear without mipmaps (what drawImage
// does), and blending is source-over, so stacking this layer over the 2D canvas matches drawing on it.
// The front half of the memory shell is passed in as a picture and drawn between the back and front
// nodes, so the depth order stays exactly as before. If WebGL2 is missing, create() returns null and
// port.js keeps drawing everything in 2D.
(() => {
  'use strict';
  const VS = `#version 300 es
  layout(location=0) in vec2 q;
  layout(location=1) in vec4 box;   // x, y (top-left, CSS px), side (CSS px), alpha
  layout(location=2) in vec4 src;   // u, v, side (0..1 of the sheet), sheet index
  uniform vec2 res;
  out vec2 uv; out float a; flat out float layer;
  void main(){
    vec2 p = box.xy + q * box.z;
    uv = src.xy + q * src.z; a = box.w; layer = src.w;
    gl_Position = vec4(p.x / res.x * 2. - 1., 1. - p.y / res.y * 2., 0., 1.);
  }`;
  // One plain texture per sheet, picked per sprite. (A texture array was tried first: Chrome reads every
  // sheet back to the CPU to fill one, 22 to 245 ms each, while a plain texture copies on the GPU in ~0.1 ms.)
  const UNITS = 16;
  const FS = `#version 300 es
  precision highp float;
  uniform sampler2D sheets[${UNITS}];
  in vec2 uv; in float a; flat in float layer;
  out vec4 o;
  void main(){
    int i = int(layer + .5); vec4 c;
    ${Array.from({ length: UNITS }, (_, i) => `${i ? 'else ' : ''}if (i == ${i}) c = texture(sheets[${i}], uv);`).join('\n    ')}
    o = c * a;
  }`;
  const QVS = `#version 300 es
  layout(location=0) in vec2 q;
  out vec2 uv;
  void main(){ uv = vec2(q.x, q.y); gl_Position = vec4(q.x * 2. - 1., 1. - q.y * 2., 0., 1.); }`;
  const QFS = `#version 300 es
  precision highp float;
  uniform sampler2D pic;
  in vec2 uv; out vec4 o;
  void main(){ o = texture(pic, uv); }`;

  function create(below, sheetSize) {
    const canvas = document.createElement('canvas');
    canvas.id = 'port-gl'; canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:3;pointer-events:none';
    let gl = null;
    try { gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false }); } catch (_) {}
    if (!gl) return null;
    const compile = (vs, fs) => {
      const p = gl.createProgram();
      for (const [type, srcText] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
        const s = gl.createShader(type); gl.shaderSource(s, srcText); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        gl.attachShader(p, s);
      }
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      return p;
    };
    let prog, quadProg;
    try { prog = compile(VS, FS); quadProg = compile(QVS, QFS); } catch (e) { console.warn('[port-gl]', e); return null; }
    const uRes = gl.getUniformLocation(prog, 'res'), uSheets = gl.getUniformLocation(prog, 'sheets'), uPic = gl.getUniformLocation(quadProg, 'pic');

    // one unit quad, shared by the sprite draw and the shell picture
    const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
    const vaoSprites = gl.createVertexArray(), vaoQuad = gl.createVertexArray();
    gl.bindVertexArray(vaoQuad); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(vaoSprites); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const inst = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, inst);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0); gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16); gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    const pixelsAsIs = () => {
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    };
    const linear = target => {
      gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    const units = Math.min(UNITS, gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
    gl.useProgram(prog); gl.uniform1iv(uSheets, Array.from({ length: UNITS }, (_, i) => Math.min(i, units - 1)));
    const uploaded = new Map();   // sheet object -> { tex, ver } on the GPU
    const picTex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, picTex); linear(gl.TEXTURE_2D);

    let data = new Float32Array(8 * 2048), count = 0, split = -1, W = 1, H = 1;
    const api = {
      canvas, ok: true, uploads: 0,
      resize(w, h, dpr) { W = w; H = h; canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); },
      begin() { count = 0; split = -1; },
      // sx, sy, size: the sprite's cell on its sheet (px); x, y, side: where it lands (CSS px)
      push(sheet, sx, sy, size, x, y, side, alpha) {
        if ((count + 1) * 8 > data.length) { const d = new Float32Array(data.length * 2); d.set(data); data = d; }
        const o = count * 8;
        data[o] = x; data[o + 1] = y; data[o + 2] = side; data[o + 3] = alpha;
        data[o + 4] = sx / sheetSize; data[o + 5] = sy / sheetSize; data[o + 6] = size / sheetSize; data[o + 7] = sheet.i;
        count++;
      },
      // everything pushed so far sits behind the shell picture, the rest in front of it
      mark() { if (split < 0) split = count; },
      end(sheets, shellPic) {
        if (!api.ok || gl.isContextLost()) return;
        // more sheets than texture units: hand everything back to the 2D path
        if (sheets.length > units) { api.ok = false; canvas.style.display = 'none'; api.onlost?.(); return; }
        for (const [k, v] of uploaded) if (!sheets.includes(k)) { gl.deleteTexture(v.tex); uploaded.delete(k); }   // sheets thrown away by a reset
        // upload a sheet when it first appears and again only when its sprites changed (a GPU-side copy)
        for (const s of sheets) {
          let u = uploaded.get(s);
          if (u && u.ver === s.ver) continue;
          if (!u) { u = { tex: gl.createTexture(), ver: -1 }; uploaded.set(s, u); gl.bindTexture(gl.TEXTURE_2D, u.tex); linear(gl.TEXTURE_2D); }
          else gl.bindTexture(gl.TEXTURE_2D, u.tex);
          pixelsAsIs();
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s.c);
          u.ver = s.ver; api.uploads++;
        }
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        const sprites = (from, to) => {
          if (to <= from) return;
          gl.useProgram(prog); gl.uniform2f(uRes, W, H);
          for (const s of sheets) { gl.activeTexture(gl.TEXTURE0 + s.i); gl.bindTexture(gl.TEXTURE_2D, uploaded.get(s).tex); }
          gl.bindVertexArray(vaoSprites);
          gl.bindBuffer(gl.ARRAY_BUFFER, inst);
          gl.bufferData(gl.ARRAY_BUFFER, data.subarray(from * 8, to * 8), gl.STREAM_DRAW);
          gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, to - from);
        };
        const cut = split < 0 ? count : split;
        sprites(0, cut);
        if (shellPic) {
          gl.useProgram(quadProg);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, picTex); gl.uniform1i(uPic, 0);
          pixelsAsIs();
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shellPic);
          gl.bindVertexArray(vaoQuad); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        sprites(cut, count);
        gl.bindVertexArray(null);
      },
      clear() { if (!gl.isContextLost()) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); } }
    };
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); api.ok = false; canvas.style.display = 'none'; api.onlost?.(); });
    below.after(canvas);
    return api;
  }
  window.PortGL = { create };
})();
