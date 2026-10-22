# WIRING.md - the skills deck, Apply all comments, email, stats and Micro Apps

Most widgets read small files in `snapshots/` that your agent writes. If a file is missing, the widget shows a quiet "not wired yet" note and nothing breaks.

## The runner: skills deck cards and Apply all comments

Both run your agent headlessly through one command template in `os-config.json`:

```json
"runner": { "command": "", "cwd": "", "modelValues": [], "effortValues": [] }
```

- `command` is blank when shipped, so nothing runs until you set it. It takes one of three shapes:
  1. **Prompt on standard input (recommended).** The template is just your agent's headless command; the OS feeds it the prompt. Works for deck cards and Apply all comments.
  2. **`{prompt}` on the command line.** For an agent that only takes the prompt as an argument: `my-agent run "{prompt}"`. A deck card puts its prompt there (`/weekly-review`); Apply all comments puts one short line there that points at its prompt file.
  3. **`{skill}` (deck cards only, the v1 shape).** For an agent with no model or effort flags at all: `my-agent "/{skill}"`. `{skill}` is the card's id. Apply all comments cannot use this shape.
- If your agent is Claude Code, the template is:
  `claude -p --model {model} --effort {effort}`
  Add `--permission-mode bypassPermissions` only if you want runs to finish without stopping for permission prompts. That is a real trade-off: the run can then do anything your agent can do.
- `cwd`: the folder the run starts in, usually your main workspace (where your agent finds your skills).
- The model and effort dials are only labels. They reach your agent only if the template has `{model}` and `{effort}` in it: `{model}` gets the card's model name in lower case (`haiku`, `sonnet`, `opus`, `fable`), and `{effort}` the effort name (`low` to `max`). Rename the labels in `"models"` and `"efforts"` as you like. If your command wants different words, list them in `modelValues` / `effortValues` in the same order. If your agent has no such flags, leave both out of the template.

### Skills deck cards

Cards live in `os-config.json` under `"skills"`:

```json
"skills": [ { "id": "weekly-review", "icon": "pen", "model": 1, "effort": 1, "prompt": "/weekly-review" } ]
```

- `id`: lowercase letters, numbers and dashes. It shows as `/id`.
- `icon`: one of `bolt`, `trophy`, `broom`, `doc`, `gem`, `pen`, `send`, `eye`, `star`, `mail`, `cal`, `chart`.
- `model` / `effort`: positions in the dial lists (0 is the first).
- `prompt` (optional): what the run is told. Default: `/id`. A prompt must start with the skill's command, or the run may open the wrong skill.
- Restart the OS after editing. Press ▶ on a card: your agent runs, and the result lands on the ring as a formatted report.
- Good cards are skills that finish cleanly without asking you anything mid-run. Ask your agent to recommend 2 to 4. The + ADD SKILL button gives it a ready prompt.
- Each run uses your agent plan at the model the card is set to.

### Apply all comments

Review pages (RUBRIC Recos, RUBRIC Carousels, or any page with the Apply all comments button) send their open comments to `POST /api/apply-comments` and poll `/api/run-status`. A quiet run edits the file, and the page shows the result and reloads. Those pages look for the OS on port 50000, the default. If v2 runs on another port (beside v1), their button cannot reach it until v2 takes over 50000 (README, Upgrading from v1). Only pages on this computer can start it (the Security model in the README has the details).

## Email

The email widget sums up the last 24 hours of your inbox: a count, flagged rows that need you, and a mix bar (partnerships, leads, personal, other).

1. It calls a Gmail-capable command-line tool named in `"email"."command"`, using `gmail users messages list` and `get` with JSON params. If you use the Google Workspace CLI (`gws`), keep the shipped `"command": "gws"`; ask your agent to install it and sign in, with the Gmail API turned on in a Google Cloud project. If you use another Gmail CLI that takes the same commands, put its name there instead.
2. Set `"enabled": true` and restart the OS. The widget lights up on its next pull, and the TODAY'S MIX bar appears with your real counts (it stays hidden until then).
3. Tune the four buckets (partnerships, leads, personal, other) in `os-config.json`: `partnerHints` and `leadHints` are word lists matched against subjects, `personalFrom` matches the sender's domain. Flagged rows are partnerships and leads.

No Gmail CLI? Ask your agent to adapt `getEmail()` in `server.js` to the email access it has (it just returns rows), or remove the widget in edit mode.

## Stats

The stats widget shows any numbers you care about: subscribers, revenue, clients, workouts. Your agent writes `snapshots/stats.json`:

```json
{ "title": "YOUTUBE", "big": 12345, "cap": "SUBSCRIBERS<br>1.2M lifetime views", "gridLabel": "3 UPLOADS THIS MONTH", "publishDays": [2, 9, 16], "link": "https://studio.youtube.com" }
```

- `title` renames the widget. `big` is the headline number. `cap` is the two-line label under it (`<br>` is the only HTML allowed).
- `publishDays` lights those days of the month in the dots grid; `gridLabel` is its caption. The grid stays hidden until `stats.json` exists, so an unwired widget shows no made-up dots.
- `link` (optional, http or https) makes the grid clickable.

**Recipe: YouTube.** Tell your agent: "Get my channel's subscriber count and this month's upload days from the YouTube Data API (a free key from the Google Cloud console, YouTube Data API v3). Write them to <path-to-your-os>/snapshots/stats.json in the WIRING.md format, and refresh it daily."

## Micro Apps

The tiles: RUBRIC Recos first, then your own apps, then Add more.

- **RUBRIC Recos** opens `http://localhost:50013` when it runs on this computer, or its page when it does not. The page address is one named constant, `RECOS_CLASSROOM_URL`, at the top of `refresh/lib/apps.cjs`.
- **Your own apps** go in `os-config.json` under `"microApps"`:

```json
"microApps": [ { "id": "notes-app", "name": "My notes app", "desc": "One short line", "url": "http://localhost:3000/", "fallbackUrl": "", "icon": "gen" } ]
```

- `icon`: `gen`, `tele`, `brain`, `exca`, `recos` or `plus` (or draw a new 10x10 sprite in `ICS` in `os.html`).
- Restart the OS after editing. Each tile click is logged to `data/app-opens.jsonl`, which the Applications tab counts.
- The Add more tile gives your agent this same prompt, ready to copy.

## Keeping feeds fresh

Add one standing line to your instructions, with the absolute path of the OS folder in the slot: "After any task that changes my numbers or schedule, update the matching file in <path-to-your-os>/snapshots/ (stats.json, routines.json)." That one habit keeps the whole board honest.
