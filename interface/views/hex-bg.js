// The /agenticos homepage hex backdrop behind the Routines, Skills and Applications tabs. Same pattern as os.html's drawHex and brain/port.js:
// 20px hexes, white strokes fading from the centre, 0.064 x the homepage's 0.85 layer opacity.
// Drawn once per window size on a still canvas behind the page.
(() => {
  const cv = document.createElement('canvas'); cv.id = 'hex-bg'; cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const ALPHA = 0.064 * 0.85;
  let key = '';
  function draw() {
    const W = innerWidth, H = innerHeight, DPR = Math.min(devicePixelRatio || 1, 2), k = W + 'x' + H + '@' + DPR;
    if (k === key) return; key = k;
    cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const g = cv.getContext('2d'), size = 20, hs = size * Math.sqrt(3), vs = size * 1.5, cx = W / 2, cy = H / 2, maxD = Math.hypot(cx, cy);
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H); g.lineWidth = 0.6;
    for (let row = -1; row < H / vs + 2; row++) for (let col = -1; col < W / hs + 2; col++) {
      const hx = col * hs + (row % 2 ? hs / 2 : 0), hy = row * vs, fade = Math.max(0, 1 - Math.hypot(hx - cx, hy - cy) / maxD * 0.6), a = ALPHA * fade * fade;
      if (a < 0.004) continue;
      g.beginPath();
      for (let i = 0; i < 6; i++) { const t = Math.PI / 3 * i - Math.PI / 6, x = hx + size * Math.cos(t), y = hy + size * Math.sin(t); i ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.closePath(); g.strokeStyle = 'rgba(255,255,255,' + a + ')'; g.stroke();
    }
  }
  draw(); addEventListener('resize', draw);
})();
