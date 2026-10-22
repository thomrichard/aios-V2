# BRAIN.md - set up the Second Brain

The Second Brain is the world inside the orb: your whole workspace as one map, in four layers. ARMS, from the outside in:

- **Applications** (blue): what your agent can reach outside this computer.
- **Routines** (gold): what runs on a schedule.
- **Memory** (by department colour): every file of context, grouped into departments.
- **Skills** (cream): what your agent can run on demand, one node per skill, named the way you type it (`/name`).

At the centre sits **AGENTS md**: the instruction file your agent reads first.

It has six tabs: **3D orbs**, **2D map** (Force, Circle, Hex and Rings layouts), **Timeline** (every file and routine by its last edit), **Routines**, **Skills** and **Applications**. Press `/` anywhere inside to search every file by name; Enter flies to it. Click a file twice (or View here) to read it in the side viewer.

Everything is set in `config/`. You should not need to touch any code for a normal setup.

## Step 1 - point it at the workspace (`config/workspace.json`)

| Field | What to put there |
|---|---|
| `root` | The absolute path of your user's main agent workspace. Blank means "not set up yet" and the map stays empty. |
| `routerDoc` | The instruction file you read first, relative to `root` (for example `AGENTS.md`). It becomes the AGENTS md node at the centre. |
| `instructionDocs` | Every always-loaded instruction file at the root. The centre node shows their latest edit, and the Timeline gives each edit a tick. |
| `skillDirs` | Folders that hold skills: one folder per skill (with a `SKILL.md` inside) or one `.md` file per command. Each becomes a `/name` node. |
| `memoryDir` + `memoryIndex` | Your notes folder and its index file, if your user keeps one. Used for departments and by `engine/brain.js`. |
| `projectsDir` | Your projects folder, if any. Its folder name prefixes can decide departments. |
| `visibleRoots` | Folders whose direct children show on the map from the start (pick the 3 to 8 that matter). The root's own children always show. Everything else folds into one node per folder that opens with a click. |
| `sharedPrefixes` | Folders a remote agent can also see (for example a synced folder). Their files show as reachable by both. |
| `maxFiles` | A safety cap for huge workspaces (default 500,000). |

The scan skips `node_modules`, `.git`, caches and build folders, follows folder links once, and never maps this OS folder itself.

## Step 2 - departments (`config/departments.json`)

Departments are the coloured slices of the 3D globe and the clusters of the 2D map.

1. **Use what you already know.** From your instructions, your notes about your user and the folder structure, write 3 to 6 departments that match how your user thinks about their work (for example Clients, Content, Product, Personal, Operations).
2. **Ask only if you do not know.** Then ask 2 or 3 quick questions, such as "what are the main areas of your work?" and "which folders belong to which?".
3. **Make every file land somewhere.** A file gets the first department that matches, in this order (paths are relative to `root`):
   - `projectPrefixes`: for folders directly inside `projectsDir`, the start of the folder's name. An object of prefix to department key:
     ```json
     "projectPrefixes": { "client-": "clients", "pod-": "content" }
     ```
   - `memoryKeywords`: for files inside `memoryDir`, words in the file's name (lower case). A list:
     ```json
     "memoryKeywords": [ { "match": ["pricing", "invoice"], "dept": "money" } ]
     ```
   - `pathRules`: for any file or folder, the start of its path. A list:
     ```json
     "pathRules": [ { "prefix": "notes/", "dept": "content" }, { "prefix": "skills/research", "dept": "clients" } ]
     ```
   - `default`: the department key for everything else.

   Every `dept` must be one of your department `key`s. A rule with the wrong shape or an unknown key is skipped, and the scan prints a warning naming it in the terminal that runs `node server.js` (and in `node refresh/run.mjs`), so check there after a change.
   **Skills** get their department the same way: the first `pathRules` prefix that matches the skill's folder (for example `skills/research`), else `default`.
4. **Colours:** saturated, clearly different from each other and from the four layer colours (blue, gold, purple, orange).
5. **Icons** (`icon`): one of `build`, `pen`, `people`, `coin`, `data`, `pulse`, `book`, `clock`, `visual`, `api`.

Leave `layers` as shipped unless your user wants different layer colours.

## Step 3 - applications (`config/apps.json`)

Only real connections: MCP servers in your agent's config, command-line tools signed in to a service (a code host, a deploy tool, a cloud CLI), APIs with stored keys. Local runtimes and tools (node, python, ffmpeg, git itself) do not belong here. Ask yourself: does it talk to something outside this computer?

```json
{ "id": "app:github", "label": "GitHub CLI", "kind": "cli", "command": "gh", "access": "local", "status": "live", "desc": "repos, pull requests, issues" }
```

- `kind`: `mcp`, `cli`, `api` or `app`.
- `command` (command-line tools): the word you type, so usage can count its runs (USAGE.md).
- `mcp` (MCP servers): the server name as your agent logs it, if it differs from the id.
- Icons: brand marks for many common services are built in, keyed by id (`app:telegram`, `app:gmail-connector`, `app:gcal`, `app:gdrive`, `app:gh`, `app:vercel`, `app:slack`, `app:stripe`, `app:canva`, `app:hubspot` and more in `refresh/lib/icons-base.json`). For anything else, add `"path"` (one 24x24 brand path) or `"svg"` (a 48x48 stroke drawing, 2 to 5 shapes). With neither, a simple line icon is drawn for it.

## Step 4 - optional

- `config/agents.json`: a remote agent that sees your synced folders (`kind: "vps"`, `access: "synced"`), or a helper agent with set skills and notes.
- `config/access-overrides.json`: mark a folder as this-computer-only or remote-only.

## Step 5 - build it

```
node refresh/run.mjs
```

That builds the map, the skills, routines and apps, and the usage figures. The OS also builds it by itself on the first start after `root` is set, and again whenever you change `workspace.json`, `departments.json` or `apps.json`. After that, the refresh icon (top right in the Second Brain) rebuilds everything in place. No model calls.

## How it is built (for changes later)

| Part | File |
|---|---|
| The scan (files, departments, access, markdown links) | `engine/scan.js` |
| Search and the file viewer (read only) | `engine/server.js`, started by `server.js` on `brainPort` |
| The data the pages show | `refresh/brain.mjs` writes `brain/snapshot.js`, `brain/snapshot-expansions.js`, `brain/_icons.js`, `assets/home-orb-mini.js` |
| The look: colours, physics, labels | the `skin` object in `brain/index.html` (`layerColors`, `deptColors` override the config colours) |
| 3D, 2D and Timeline drawing | `brain/port.js`, `brain/port-gl.js`, `brain/_core.js`, `brain/timeline-layout.js` |
| The homepage orb's coloured centre | `assets/home-orb-mini.js` (rebuilt by refresh to match your departments) |

## The recall engine (optional)

`engine/brain.js` is a zero-token lookup and filing tool for an index-based notes folder (one fact per file plus an index file):

```
node engine/brain.js recall "what did we decide about pricing"
node engine/brain.js store "fact" --type feedback --name short-slug
node engine/brain.js ask "question"      (copies a one-turn prompt with the evidence)
```

It reads `memoryDir` and `memoryIndex` from `workspace.json` and never calls a model. Offer it only if your user keeps (or wants) that kind of notes folder.

## Troubleshooting

- **The map is empty:** `root` is blank or wrong. Fix it, then press the refresh icon.
- **Search says it is not answering:** the engine is still scanning a big workspace, or `brainPort` is taken. Watch the terminal running `node server.js`.
- **A file will not open in the viewer:** it is binary, over 500 KB, outside the workspace, or its name looks like a secret. All on purpose.
- **Too many nodes:** remove folders from `visibleRoots`; they fold into one node each.
