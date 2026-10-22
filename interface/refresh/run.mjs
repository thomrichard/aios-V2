// Refreshes everything the Second Brain shows, in order: the map, skills, routines and
// applications (brain.mjs), then usage (usage.mjs). The refresh icon in the Second Brain runs
// the same two steps. No model calls, no network.
// Run: node refresh/run.mjs
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const STEPS = ['brain.mjs', 'usage.mjs'];
let ok = true;
for (const step of STEPS) {
  const t = Date.now();
  const r = spawnSync(process.execPath, ['--no-warnings', path.join(HERE, step)], { stdio: 'inherit', windowsHide: true });
  console.log(`${r.status === 0 ? 'done' : 'FAILED'}  ${step}  ${Date.now() - t} ms`);
  if (r.status !== 0) { ok = false; break; }
}
process.exit(ok ? 0 : 1);
