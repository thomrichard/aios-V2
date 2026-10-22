# REDESIGN.md - make it look like yours

This OS has been reskinned end to end more than once without touching a single feature. Same bones, very different skin. Here is how.

## Where the look lives

1. **The homepage tokens:** the `:root` block at the top of `os.html`'s `<style>`:
   ```css
   :root { --accent:#ff6b1a; --cream:#e8e2d2; --mute:#8d8775; --warm:#b9b19c; --bg:#050504; --panel:#0d0c09; }
   ```
   Accent, text, muted text, background, panel. Change these six and most of the homepage follows.
2. **The homepage's JS THEME block,** just above `const ICS` in `os.html`. Canvas drawings (clock hands, pixel sprites, the ring) cannot read CSS variables, so they take their colours here:
   ```js
   const THEME = { accent:'#ff6b1a', cream:'#e8e2d2', mute:'#8d8775', warm:'#b9b19c' };
   ```
   Keep it in step with the CSS tokens.
3. **The Second Brain's skin:** the `skin` object in `brain/index.html`. `layerColors` and `deptColors` override the colours in `config/departments.json`; `themes.dark.css` holds the panel colours; the shell around it is `copy.css`; the three tabs are `views/views.css` and `views/usage-board.css`. After changing department or layer colours, press the refresh icon so the homepage orb's centre matches.
4. **Stragglers:** a few inline SVG strings keep fixed colours (the hex logo, the sun and moon icons, some fades). Search the files for `#ff6b1a` after a reskin.
5. **Fonts:** Outfit and Doto ship as local files in `assets/` (`@font-face` at the top of `os.html` and `copy.css`). Swap the files and the names to change the personality faster than any colour.

## The redesign prompt (paste to your agent)

> Redesign my Agentic OS into a completely new visual direction while changing ZERO functionality. The homepage is os.html; the Second Brain's look is the skin in brain/index.html, copy.css and the views/ CSS files.
>
> First, quietly consider three candidate directions that have nothing in common with the current look or with each other: different palette temperature, different type personality, different texture (flat, glass, paper, terminal). Pick the strongest, then commit fully.
>
> Rules: work through the :root tokens and the THEME block first, then the Second Brain's skin, then the fonts, then any stragglers. Do not touch layout logic, APIs, widget behaviour or ids. Every widget must stay readable at its current size; check the contrast of muted text especially. When done, open the OS headless, check the console for errors, screenshot the homepage and every Second Brain tab, and look at the screenshots before you say it is done. Then tell me the direction you chose in one line.

Ask for "three options as screenshots first" if you want to pick the direction yourself.

## Principles that survived our reskins

- **Direction beats decoration.** One committed direction (terminal, editorial, botanical, brutalist) reads at once; a palette swap alone reads as the same OS in a different shirt.
- **The accent is a budget.** One accent colour, spent on the few things that matter (the next routine, the running skill, the selected thing). Spend it everywhere and the board gets noisy.
- **Muted text carries the design.** Most of the OS is labels. If `--mute` fails contrast on `--bg`, everything feels broken however pretty the accent is.
- **Type first, then colour.** The display font sets the personality; colours season it.
- **Keep the bones.** The layout grid, widget chrome, ring and brain took many rounds to feel right. Reskin, do not re-architect, and you keep getting upstream improvements.
