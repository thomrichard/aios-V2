# USAGE.md - measure what you use

The Skills, Applications and Routines tabs size things by real use: skill runs, tokens and API $, routine runs, app calls and local app opens, over the last 7 and 30 days. The rule is simple: what is measured shows its number, and what is not shows "not measured". Nothing is estimated or made up.

`node refresh/usage.mjs` builds the figures (the refresh icon runs it too). It reads files on this computer only and calls no model. Three sources, all optional:

## 1. Your agent's session logs (read for you when a reader exists)

- **If your agent is Claude Code:** its session logs in `~/.claude/projects/` are read for you, including subagents. A skill run starts where the log shows the skill loading and lasts until the next skill or your next prompt. A routine run is a session started by a scheduled task. Each model call counts once, even when a resumed session copies it. Tool calls to MCP servers and the command names your agent ran count toward your apps. Only command names and local port numbers are kept from commands, never the full command or any message text. A first read of a large log folder can take a minute; later reads use a cache in `data/usage-cache.json`. The same reader also reads the scheduled tasks (`~/.claude/scheduled-tasks/` and the desktop app's `scheduled-tasks.json` files under `%APPDATA%\Claude\claude-code-sessions` on Windows, `~/Library/Application Support/Claude/claude-code-sessions` on macOS, `~/.config/Claude/claude-code-sessions` on Linux; see ROUTINES.md).
- **To turn that reader off** (you are not on Claude Code, or you do not want its tasks and session logs read): set `"readers": { "claudeCode": false }` in `os-config.json`. The default, `"auto"`, reads those folders only when they exist.
- **Any other agent:** use the usage log below. To teach the OS to read another agent's logs, add a reader in `refresh/sources/` the same way.

## 2. The usage log: `snapshots/usage-log.jsonl`

One line of JSON per event, appended by any agent or script. Add this to your instructions so it becomes a habit, with the absolute path of the OS folder in the slot:

> After you finish a skill, a scheduled routine, or a call to one of my connected apps, append one line to <path-to-your-os>/snapshots/usage-log.jsonl: {"at": "<ISO time>", "kind": "skill" | "routine" | "app", "name": "<skill name, routine id or app id>", "tokens": <if known>, "cost": <USD, if known>}.

```
{"at":"2026-01-05T07:00:12Z","kind":"routine","name":"morning-digest","tokens":18400,"cost":0.05}
{"at":"2026-01-05T10:21:40Z","kind":"skill","name":"weekly-review","tokens":42100,"cost":0.12}
{"at":"2026-01-05T10:24:03Z","kind":"app","name":"app:github","calls":3}
```

- `name` for a skill is its name without the slash. For a routine, its `id` or its `name` from ROUTINES.md. For an app, its `id` or `label` from `config/apps.json`.
- `tokens` and `cost` are optional. Leave them out if your agent cannot see them; runs still count.
- `calls` (apps) defaults to 1.
- A sample ships as `snapshots/usage-log.example.jsonl`.

## 3. Local app opens (always on)

Every click on a Micro Apps tile goes through the OS, which writes one line to `data/app-opens.jsonl`. That is how the Applications tab counts your local apps (RUBRIC Recos and any you add), without reading your browser.

## What each tab shows

| Tab | Measured | Not measured |
|---|---|---|
| Skills | runs, tokens, API $ per skill, 7 and 30 days | every skill found, labelled "not measured" |
| Applications | calls per connection, opens per local app | connections labelled "not measured" |
| Routines | runs, tokens, API $ per routine for the last 7 days | "not measured" in the row and the details |

API $ is what the measured tokens would cost at standard API rates (`refresh/sources/claude-code.cjs` holds the rates for that reader). It is not your subscription bill.
