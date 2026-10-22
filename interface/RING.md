# RING.md - make every build land on the ring

The ring around the orb is the OS's memory of your work: every HTML page in the `artifacts/` folder becomes a ball you can reopen, search (`/`) and browse. The habit that makes it work: your agent registers everything it builds, by itself.

## The snippet (add it to your agent's instructions file)

Add this to the file your agent reads at the start of every session, with the one path changed:

```
### Put finished HTML on my OS ring
Every time you finish an HTML page for me (report, dashboard, one-pager, tool):
1. Copy the file to <path-to-your-os>/artifacts/<short-slug>.html
2. Write <short-slug>.json next to it:
   { "title": "Short Human Title", "icon": "doc", "kind": "report",
     "created": "<ISO timestamp>", "note": "one line on what it is",
     "svg": "<circle cx='24' cy='24' r='14'/>" }
3. The svg is 1 to 4 plain shapes (path, circle, rect, line, polyline, polygon, ellipse)
   on a 48x48 grid, with no fill or stroke attributes, and it should show THAT page
   so I can find it at a glance.
4. Tell me: "added to the OS ring as <title>".
Icon fallback categories: dash, deck, report, mail, video, chart, visual, bolt, doc.
```

During install, your agent can add this for you. Say yes when it offers.

## Notes

- The ring reads the folder live. A new file is a new ball on the next pull (within 2 minutes), no restart.
- **Right-click any ball** for OPEN (new tab) or REMOVE. Remove can be undone: the page and its sidecar move to `artifacts/_trash`. Drag them back out to restore the ball.
- The circle shows only as many balls as fit. Older ones hide by themselves; press `/` and matching hidden balls come up on an inner ring while you search.
- Every ball carries a grey 30-day arc that empties as it ages, and a day tag (none on the day it was made). The newest sits beside the orange index ball; hover the orange ball to see every name.
- The folder is `"artifactsDir"` in `os-config.json`. Point it anywhere (an absolute path works) to make the ring watch an existing folder.
- Skills deck runs register their own report balls.
- A sidecar's `svg` only keeps plain shapes with plain geometry. Anything else (scripts, links, styles) drops the glyph, and the ball falls back to its category icon.
- Three sample balls ship with the kit. Delete their files in `artifacts/` any time.
