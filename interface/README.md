![RUBRIC Agentic OS v2](assets/banner.png)

# RUBRIC Agentic OS v2

Your homepage and your Second Brain in one local page: live widgets, a ring of everything your agent has built, and a 3D map of your whole workspace with its routines, skills and apps. Your agent sets it up and keeps it fresh.

Built by Jay E at RoboNuggets. License: MIT (see LICENSE).

## Quick start

1. Install [Node.js](https://nodejs.org) 18 or newer. Nothing else is needed: the OS has zero dependencies.
2. Unzip this folder anywhere you like.
3. Hand this README to your agent and let it do the setup below. It points the OS at your workspace and builds your Second Brain.
4. Start it with `node server.js` inside the folder. That one command starts everything, the Second Brain engine included.
5. Open `http://localhost:50000` (the port is `"port"` in `os-config.json`; 50200 if you run v1 beside it). A short tour (7 steps) runs on your first visit, and the info icon replays it.

Widgets you have not connected yet show a quiet "not wired yet" note. That is by design: nothing is broken.

## Let your agent set it up (recommended)

This kit is built to be installed by your agent, whatever agent you use. Tell it:

> Read the README of this kit. Use what you already know about me and my workspace, then ask me only what you still need: which agent and schedulers I use, and which email, calendar and numbers I care about. Recommend which parts to wire first, then set it up step by step using the guides.

### For the agent: the install steps

You are setting this up for your user, inside their workspace. Respect what you find: map it, never reorganise it. Do these in order.

1. **Check Node.** `node --version` must be 18 or newer. If not, tell your user how to install it and stop.
2. **Check the ports before the first start.** v2 uses port 50000 by default, because RUBRIC Recos and RUBRIC Carousels look for the Apply all comments runner there. (Those two are separate free RUBRIC downloads in the RoboNuggets classroom; their Apply all comments button calls this OS. Until Recos is installed, the RUBRIC Recos tile in Micro Apps links to its classroom page.) Check whether something already answers on `http://localhost:50000`. If it does (usually RUBRIC Agentic OS v1), leave it alone: set `"port": 50200` in `os-config.json` so v2 runs beside it and nothing of theirs moves. Then ask your user one question: should v2 take over port 50000 and copy their settings, ring balls and skill cards across? If yes, follow "Upgrading from v1" below. If nothing answers on 50000, keep the default. Check that `"brainPort"` (default 50201, the Second Brain engine) is free too, and pick another free port if not.
3. **Point the OS at the workspace.** Fill `config/workspace.json`: `root` (the absolute path of your user's main agent workspace), `routerDoc` (the instruction file you read first, for example `AGENTS.md`), `instructionDocs` (every always-loaded instruction file at the root), `skillDirs`, `memoryDir`, `projectsDir`, `visibleRoots` and `sharedPrefixes`. [BRAIN.md](BRAIN.md) step 1 explains each field.
4. **Write the departments.** These are the coloured slices of the 3D globe. Use what you already know about your user and their workspace to write 3 to 6 departments in `config/departments.json`. Ask 2 or 3 quick questions only if you do not know. [BRAIN.md](BRAIN.md) step 2.
5. **List the applications.** Real connections only (MCP servers, command-line tools that talk to a service, APIs with stored keys) in `config/apps.json`. [BRAIN.md](BRAIN.md) step 3.
6. **Agent readers.** `"readers": { "claudeCode": "auto" }` in `os-config.json` means: if Claude Code's folders are found on this computer, its scheduled tasks and session logs are read (ROUTINES.md and USAGE.md list the exact folders). If your user isn't on Claude Code, or doesn't want its tasks and session logs read, set it to `false`.
7. **Routines.** If your agent is Claude Code (and the reader is on), its scheduled tasks are read for you. Anything else on a schedule (cron, Task Scheduler, launchd, another agent's scheduler, a server) goes in `snapshots/routines.json`. Use what you know about your user's schedulers to fill it. [ROUTINES.md](ROUTINES.md).
8. **Usage.** If your agent is Claude Code (and the reader is on), its session logs are read for skill runs, routine runs and tool calls. Otherwise, add the one-line usage log habit from [USAGE.md](USAGE.md) to your instructions. The instruction snippets in ROUTINES.md, USAGE.md, WIRING.md and RING.md have a `<path-to-your-os>` slot: put the absolute path of this folder there. Anything nothing measures shows "not measured".
9. **Build the Second Brain, then start.** Run `node refresh/run.mjs` so the first open already shows your user's own workspace. Then `node server.js`, open the page, and check it headless if you can: zero console errors, the orb opens the Second Brain, and the six tabs show their files.
10. **Offer the rest, one at a time:** the skills deck runner ([WIRING.md](WIRING.md)), the calendar and its world clocks ([OAUTH.md](OAUTH.md)), email and stats ([WIRING.md](WIRING.md)), the artifact ring habit ([RING.md](RING.md)), and an autostart that fits their machine (Task Scheduler, launchd, systemd, or pm2 if they already use it; none is required).
11. **Offer the `/agenticos` skill.** Ask your user first. If they say yes, copy `skills/agenticos/` into your skills folder. It teaches you how to change, refresh, check and fix this OS later. `SKILL.md` is the shared skills format many agents read; if your agent has no skills folder, keep the file anywhere and point your instructions file at it as a reference.

## The guides

| Part | Guide | What your agent does |
|---|---|---|
| Second Brain | [BRAIN.md](BRAIN.md) | Points the map at your workspace: departments, apps, skills, search, the file viewer |
| Routines | [ROUTINES.md](ROUTINES.md) | Lists everything on a schedule, for the homepage widget and the Routines tab |
| Usage | [USAGE.md](USAGE.md) | Measures skill runs, routine runs and app use (or says "not measured") |
| Skills deck, Email, Stats, Micro Apps | [WIRING.md](WIRING.md) | Wires the runner, your inbox, any numbers, your own local apps |
| Calendar | [OAUTH.md](OAUTH.md) | One-time Google sign-in, then live events |
| Artifact ring | [RING.md](RING.md) | Teaches your agent to put every build on the ring |
| Look and feel | [REDESIGN.md](REDESIGN.md) | Reskins the whole OS from one token block |

## Everyday use

- **Start:** `node server.js`. It starts the Second Brain engine beside it. Stop both with Ctrl+C.
- **The orb:** click its centre to zoom into your Second Brain. Press `/` there to search every file by name, and Back (or Escape) to come home.
- **The six tabs:** 3D orbs, 2D map, Timeline, Routines, Skills and Applications.
- **The refresh icon** (top right in the Second Brain) rebuilds the map, skills, routines, apps and usage. No model calls. `node refresh/run.mjs` does the same from a terminal.
- **The ring:** every HTML page in `artifacts/` is a ball. Hover the orange ball to see every name, press `/` to search, right-click a ball for OPEN or REMOVE (removed balls move to `artifacts/_trash`).
- **Micro Apps:** RUBRIC Recos opens if it runs on this computer, or its page if it does not. Add more gives your agent a ready prompt to add your own apps.
- **Ports:** `"port"` and `"brainPort"` in `os-config.json` (defaults 50000 and 50201). If the port is taken, the server stops with a one-line message instead of moving: change `"port"` and start again.

## Upgrading from v1

v2 is a separate folder. Your v1 folder keeps working on port 50000 until you say otherwise.

- **Run both:** set `"port": 50200` in v2's `os-config.json` (the install steps do this when something answers on 50000).
- **Let v2 take over port 50000:** stop v1, set `"port": 50000` in v2's `os-config.json`, then copy across what you want to keep:
  - your skill cards, models, efforts and email hints from v1's `os-config.json`;
  - your ring: the files in v1's `artifacts/` folder (or point `"artifactsDir"` at the old folder);
  - your feeds: `snapshots/stats.json` and `snapshots/calendar.json`, plus `.google-creds.json` and `.google-calendar-token.json` if you set up the calendar;
  - your routines: v1's `snapshots/routines.json` works as is (both row shapes are read).
- **The runner.** Your v1 `runner.command` (with `"/{skill}"`) still works for deck cards. Apply all comments needs a template that reads the prompt on standard input or takes `{prompt}` (WIRING.md shows all three shapes).
- **Email is off by default in v2.** Set `"email": { "enabled": true }` if you had it wired.
- Your browser keeps v1's layout under the old address. v2 starts with its own layout, so drag widgets back where you like them.

## Folder map

```
rubric-agentic-os-v2/
  server.js            the OS server (node, zero dependencies); starts the engine too
  os-config.json       ports, skills deck, runner, Micro Apps, email
  index.html           the shell: homepage + Second Brain
  os.html              the homepage (one editable file)
  copy.js, copy.css, shell-extras.js, view-transitions.js   the shell's code
  widgets.html         the widget library (/widgets)
  assets/              fonts, the orb, shared scripts
  brain/               the Second Brain's 3D orbs, 2D map and Timeline (+ their data, built by refresh)
  views/               the Routines, Skills and Applications tabs
  engine/              the Second Brain engine: scan.js (the map), server.js (search, file viewer), brain.js (recall and store)
  refresh/             builds the Second Brain's data; sources/ holds per-agent readers
  config/              workspace.json, departments.json, apps.json, agents.json (yours to edit)
  snapshots/           feeds your agent writes: routines.json, usage-log.jsonl, stats.json, calendar.json
  data/                what the OS writes: page data, app opens, run list, caches
  artifacts/           every HTML here is a ball on the ring
  os-runs/             logs of headless runs (made on the first run)
  tools/               google-calendar.js (OAUTH.md)
  skills/agenticos/    the /agenticos skill for your agent
```

## Security model

Every sentence here is true of the shipped code.

- Both servers (the OS and the Second Brain engine) listen on 127.0.0.1 only, so nothing on your network can reach them.
- Both refuse any request whose Host header is not `localhost` or `127.0.0.1`, which stops DNS-rebinding pages.
- No CORS headers, with one narrow exception. `/api/apply-comments` and `/api/run-status` echo the request's Origin back only when it is `http(s)://localhost` or `http(s)://127.0.0.1` on any port (or `null`, if you turned on `"allowNullOrigin"`), so review pages on your other local apps can read the answer. No other route and no other origin ever gets a CORS header, and no preflight is ever granted.
- Every action (POST) must come from a page on this computer: Origin `localhost` or `127.0.0.1` on any port, or no Origin at all (a non-browser tool). Anything else gets 403, including the Origin `null`, because a page opened as a file sends it and so does a sandboxed frame on any website. Only if you need Apply all comments from pages opened as files, set `"allowNullOrigin": true` in `os-config.json`; RUBRIC Recos and RUBRIC Carousels run on localhost and do not need it.
- JSON actions (`/api/run`, `/api/open`, `/api/app-open`, `/api/artifact-remove`) also need `Content-Type: application/json`, which another website cannot send without a preflight.
- Request bodies over 1 MB are refused. There are no WebSockets.
- Optional shared secret: start the OS with the environment variable `RUBRIC_TOKEN` set, and every `/api/*` and `/local/*` request then needs a matching `x-rubric-token` header. The OS's own pages get it from a meta tag. Pages on your other local apps do not send it, so Apply all comments from them stops working while the token is on.
- Only the page files are served: `index.html`, `os.html`, the shell scripts, `assets/`, `brain/`, `views/`, `widgets.html` and two page data files. `config/`, `snapshots/`, `engine/`, `refresh/`, `os-runs/`, `os-config.json` and the rest of `data/` are never served. Every file path is resolved and must sit inside its folder.
- The file viewer reads text files inside your workspace root only, under 500 KB, and never a file whose name looks like a secret (`.env`, keys, tokens, credentials).
- Names, titles, notes and descriptions from your feeds are escaped before they reach the page. A ball's glyph from its sidecar is filtered to plain shapes.
- Runs: the skills deck and Apply all comments run the command template you put in `"runner.command"`. It is blank when shipped, so nothing runs until you set it. The prompt goes to the command on standard input from a file in `os-runs/`, or, if your template uses `{prompt}` or `{skill}`, as a short line on the command line that may contain only letters, numbers, spaces and `_ . / \ : , ( ) -` (Apply all comments then passes only a pointer to its prompt file). Model and effort must be on the allowed list and contain only letters, numbers, dots, dashes and colons. If your template skips your agent's permission prompts, runs happen without prompts: that is your choice.
- `/api/open` opens web links, or files inside your workspace, this OS folder or the artifacts folder. It never opens program files and uses no shell.
- The pages load nothing from the internet. The OS itself makes no outside calls. The calendar tool calls Google only after you set it up, the email command runs only after you turn it on, and the agent your runner starts does what that agent does.
- What it reads: your workspace (names, sizes, dates, and markdown files for their links), `config/`, `snapshots/`. If your agent is Claude Code and `"readers.claudeCode"` is not `false`, also its scheduled tasks and its session logs (to count runs, tokens and tool calls; only command names and local port numbers are kept, never full commands or message text).
- What it writes: `data/` (page data, app opens, the run list, caches), `os-runs/` (run logs and prompt files), `artifacts/` (run reports, and `_trash` when you remove a ball), `snapshots/calendar.json` (the calendar cache). It stores no credentials of its own; the calendar's sign-in token is written by `tools/google-calendar.js` only when you run it.

## Credit

Made by Jay E | RoboNuggets, the community where this OS was built live. MIT license: use it, change it, ship your own version, and keep the copyright line.
