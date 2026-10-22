// Light on the CPU.
//
// Load this FIRST in every document of the OS (shell, homepage, brain, tabs). It wraps
// requestAnimationFrame, which drives every canvas, WebGL and motion loop here:
//  - while you move the mouse, drag, scroll, click or type, frames run at full speed, and for 2.5 s
//    after a click, key or wheel step, so the transitions they start (open zoom, view switch, fly to)
//    stay smooth;
//  - the rest of the time animation runs at 30 fps (the time-based loops move at the same pace, just
//    with fewer frames);
//  - after 1 minute with no input anywhere on the page, every loop pauses and CSS animations freeze,
//    until the next movement.
// One controller is shared through the top window, so a move in any frame wakes every frame.
// Add ?live=1 to the page address to turn all of this off (for comparisons); ?idle=<seconds> shortens the
// idle wait for the checks.
(() => {
  if (window.__ambientFrame) return;
  window.__ambientFrame = true;
  const FRAME_MS = 1000 / 30, HOVER_MS = 400, ACTION_MS = 2500;
  let IDLE_MS = 60000;

  let ctl = null;
  try { ctl = top.__ambient || null; } catch { ctl = null; }
  if (!ctl) {
    let home = window;
    try { void top.document.body; home = top; } catch { home = window; }   // file:// frames can't reach top
    const off = /[?&]live=1\b/.test(home.location.search), idle = /[?&]idle=(\d+)/.exec(home.location.search);
    if (idle) IDLE_MS = Math.max(1, +idle[1]) * 1000;
    ctl = {
      off, lastInput: Date.now(), liveUntil: 0, wakers: new Set(),
      paused() { return !this.off && Date.now() - this.lastInput > IDLE_MS; },
      live() { return this.off || Date.now() < this.liveUntil; },
      poke(ms = ACTION_MS) {
        const was = this.paused(); this.lastInput = Date.now(); this.liveUntil = Math.max(this.liveUntil, this.lastInput + ms);
        if (was) for (const w of [...this.wakers]) { try { w(); } catch { this.wakers.delete(w); } }
      },
      state() { return { paused: this.paused(), live: this.live(), idleSeconds: Math.round((Date.now() - this.lastInput) / 1000), off: this.off }; }
    };
    try { home.__ambient = ctl; } catch { window.__ambient = ctl; }
  }
  window.__ambient = ctl;

  const realRAF = window.requestAnimationFrame.bind(window);
  const queue = new Map();
  let seq = 0, pending = 0, asleep = false, lastRun = -1e9;
  window.__ambientRuns = 0;   // frames that actually ran callbacks here, for the checks
  const report = e => (typeof reportError === 'function' ? reportError(e) : setTimeout(() => { throw e; }));
  const root = document.documentElement;
  const freeze = on => root.classList.toggle('ambient-paused', on);
  function tick(ts) {
    pending = 0;
    if (!queue.size) return;
    if (ctl.paused()) { asleep = true; freeze(true); return; }            // no more frames until a wake
    if (!ctl.live() && ts - lastRun < FRAME_MS - 2) { pending = realRAF(tick); return; }   // 30 fps while ambient
    lastRun = ts; window.__ambientRuns++;
    const run = [...queue.values()]; queue.clear();
    for (const cb of run) { try { cb(ts); } catch (e) { report(e); } }
  }
  const schedule = () => { if (!pending && !asleep) pending = realRAF(tick); };
  window.requestAnimationFrame = cb => { const id = ++seq; queue.set(id, cb); schedule(); return id; };
  window.cancelAnimationFrame = id => { queue.delete(id); };

  const wake = () => { freeze(false); if (asleep) { asleep = false; lastRun = -1e9; schedule(); } };
  ctl.wakers.add(wake);
  addEventListener('pagehide', () => ctl.wakers.delete(wake));
  for (const [type, ms] of [['pointermove', HOVER_MS], ['pointerdown', ACTION_MS], ['wheel', ACTION_MS], ['keydown', ACTION_MS], ['touchstart', ACTION_MS]])
    addEventListener(type, () => ctl.poke(ms), { capture: true, passive: true });

  // CSS animations (bobbing sprites, spinners) freeze with the rest
  const style = document.createElement('style');
  style.textContent = '.ambient-paused *,.ambient-paused *::before,.ambient-paused *::after{animation-play-state:paused!important}';
  (document.head || root).appendChild(style);
  setInterval(() => { const p = ctl.paused(); freeze(p); if (!p && asleep) wake(); }, 1000);
  // coming back to the tab counts as activity, so anything that changed while it was away draws at once
  document.addEventListener('visibilitychange', () => { if (!document.hidden) ctl.poke(0); });
})();
