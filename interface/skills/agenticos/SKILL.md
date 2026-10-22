---
name: agenticos
description: Change, refresh, check and fix the user's RUBRIC Agentic OS v2 (the local homepage plus Second Brain started with node server.js). Use when the user says /agenticos, "the OS", "my homepage", "the Second Brain", names a widget (Micro Apps, Calendar, Stats, Email, Routines, Skills deck, the ring, the orb), asks to add an app, a skill card, a routine or a department, wants the map refreshed, or reports something on the OS looks wrong.
---

# /agenticos - look after the user's Agentic OS

The OS lives in one folder (the user's `rubric-agentic-os-v2`). Find it first: ask the user if you do not know where they put it. Its README, BRAIN, ROUTINES, USAGE, WIRING, OAUTH, RING and REDESIGN guides sit at the top of that folder; read the one that owns the part you are changing.

## The moving parts

| Part | Where it lives | After a change |
|---|---|---|
| Server (homepage, feeds, actions) | `server.js` + `os-config.json` (port, deck, runner, Micro Apps, email) | restart `node server.js` |
| Second Brain engine (search, file viewer) | `engine/server.js` + `engine/scan.js`, started by `server.js` on `brainPort` | restart the OS |
| Where the workspace is | `config/workspace.json` | refresh (or restart: the OS rebuilds when this changes) |
| Departments, apps, remote agents | `config/departments.json`, `config/apps.json`, `config/agents.json` | refresh |
| Routines | `snapshots/routines.json` plus the agent-scheduler readers in `refresh/sources/` | homepage within a minute; tabs and map on refresh |
| Usage | `snapshots/usage-log.jsonl`, `data/app-opens.jsonl`, readers in `refresh/sources/` | refresh |
| Stats, calendar feeds | `snapshots/stats.json`, `snapshots/calendar.json`, `tools/google-calendar.js` | next pull (2 minutes) |
| The ring | `artifacts/` (an `.html` plus a `.json` sidecar per ball) | next pull |
| The homepage | `os.html`: one editable file | reload the page |
| The Second Brain's look | the `skin` in `brain/index.html`, `copy.css`, `views/*.css` | reload |

Generated files: never edit them by hand, because the next refresh overwrites them. They are `brain/snapshot.js`, `brain/snapshot-expansions.js`, `brain/_icons.js`, `brain/map-layouts.js`, `assets/home-orb-mini.js`, `data/snapshot.js`, `data/arms-usage.js` and everything else in `data/`.

## Refresh order

`node refresh/run.mjs` runs, in order:

1. `refresh/brain.mjs`: scan the workspace, one `/name` node per skill, routines, apps, honest edit dates, icons, the homepage orb's colours.
2. `refresh/usage.mjs`: runs, tokens and calls from the usage log, local app opens and any agent log reader.

The refresh icon (top right in the Second Brain) runs the same two steps and then rescans the engine. No model calls either way.

## Common jobs

- **Add a Micro Apps tile:** add `{ id, name, desc, url, fallbackUrl, icon }` to `"microApps"` in `os-config.json`, restart. (WIRING.md, Micro Apps.)
- **Add a skills deck card:** add `{ id, icon, model, effort, prompt }` to `"skills"`, restart. The runner must be set (`"runner.command"`, prompt on standard input). Prefer skills that finish without asking questions.
- **Add or change a routine:** edit `snapshots/routines.json` (cron, or days plus times). ROUTINES.md has the shape.
- **Change departments:** edit `config/departments.json` (3 to 6, every file lands in one), then refresh. Use what you know about the user; ask 2 or 3 questions only if unsure.
- **Show more or fewer folders on the map:** edit `visibleRoots` in `config/workspace.json`, then refresh.
- **Start measuring:** add the usage-log line from USAGE.md to your instructions, or write a reader for your agent's logs in `refresh/sources/`.
- **Move ports:** `"port"` / `"brainPort"` in `os-config.json`, restart. Port 50000 is where RUBRIC Recos and RUBRIC Carousels look for Apply all comments.
- **Reskin:** follow REDESIGN.md.

## The check loop (every time, before you say done)

1. Restart the OS if you changed `os-config.json`, `server.js` or anything in `engine/`. Watch the terminal: it says when the Second Brain is ready.
2. Open the page headless if you can (any headless browser). Collect console errors, and check there are none.
3. Check the exact thing you changed in the page itself: the tile is there, the card renders, the routine shows on the Routines tab, the department colour is on the globe.
4. Take a screenshot of that part and look at it. Widgets clip silently, so a fit check matters.
5. `GET /api/health` should show `engine: true`, `workspaceSet: true` and the runner status.

## Fixing things

| Symptom | Likely cause | Fix |
|---|---|---|
| The Second Brain is empty | `root` blank or wrong in `config/workspace.json` | set it, refresh |
| Files land in the wrong department | a rule in `config/departments.json` has the wrong shape or an unknown key | read the `Warning:` lines the scan prints, fix the rule (BRAIN.md step 2), refresh |
| Search "is not answering" | engine still scanning a big workspace, or `brainPort` taken | wait, or change `brainPort` and restart |
| A file will not open in the viewer | binary, over 500 KB, outside the workspace, or a secret-looking name | expected |
| A deck card or Apply all comments says no runner | `"runner.command"` blank, or still uses `{skill}` | set the v2 template (WIRING.md) |
| A run fails | the command is not on PATH, or the agent needs a sign-in | read the log in `os-runs/`, run the command by hand once |
| Skills or routines say "not measured" | no usage log and no log reader | USAGE.md |
| A widget says "not wired yet" | its feed file or setting is missing | its guide (WIRING.md, OAUTH.md) |
| The homepage layout is odd after an update | the browser kept an old layout | Menu > Reset the layout in the Second Brain, or clear this site's storage |
| Port in use on start | another program, or v1 on 50000 | change `"port"`, or stop the other program |

## Rules

- Change only what the user asked for. Keep every feature, id and storage key working.
- Never paste secrets into any OS file. Keys live where the user's tools keep them.
- Never point the runner at a command that skips permission prompts unless the user chose that.
- The OS has no outside calls of its own; keep it that way unless the user asks.
