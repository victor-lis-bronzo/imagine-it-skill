# Screenshots

Only when a screenshot flag is passed. Runs after Verify, once the HTML is final. A capture problem never blocks or fails the run: the HTML is already delivered.

## Flags

- `--screenshot[=png|jpeg]`: enable capture; PNG by default. JPEG quality is fixed at 90.
- `--states`: also capture every `section[data-state]` of each screen. Default: initial state only.
- `--viewport <WxH>`: default `1440x900`; `390x844` when the product is mobile-first (the design brief's flag that triggers the 390px frame).
- `--notes`: capture with the spec-notes overlay on. Default: off.

Capture is full-page by default, with scrollbars hidden so every image is exactly the viewport width.

## Light/dark

- Pages carry `data-has-dark` (the design brief says the repo has dark mode): ask once per run, before building the shot list, "capture light, dark or both?", recommending both. Use a question tool if available; otherwise ask in plain text. No answer or no interactive channel: proceed with both.
- Single-mode repo: capture that mode and ask nothing.

## Shot list & naming

Shots = screens x (initial state, or all states with `--states`) x themes, plus the hub, captured last. Read the state list from the DOM: the unique `data-state` values of `section[data-state]` in document order; the first is the initial state.

Write to `<out>/<slug>/screenshots/`. Name: `NN-<screen>[--<state>][--dark].<ext>`.

- `NN-<screen>` is the html file stem; light has no suffix. The initial state never gets a state suffix, even with `--states`.
- `01-orders-list.png`, `01-orders-list--empty--dark.png`.
- Hub: `index.png`; `index--dark.png` only if the hub page has `data-has-dark`.

Write the full list in your notes before capturing.

## Capturing

URL per shot (absolute path; Windows form `file:///C:/...`):

```
file:///<abs-path>/<file>.html?ii-capture&theme=<light|dark>[&notes=1]#state=<name>
```

- `ii-capture` makes `ii.js` hide the toolbar and persist nothing. `theme=` only applies on pages with `data-has-dark`. Add `notes=1` only with `--notes`. Omit `#state=` for the initial state.
- Set the viewport from `--viewport`, hide scrollbars (`html{scrollbar-width:none}` and `::-webkit-scrollbar{display:none}` injected before capture; the CLI's `--hide-scrollbars` does it), then capture full-page. Without this, tall pages come out narrower than W.

Tool ladder, take the first that works:

1. **Any browser tool you have** (browser-automation skill or CLI, Playwright or Chrome DevTools MCP): open the URL, set viewport, full-page, `jpeg` quality 90 when requested. With `dev-browser`, `page.screenshot({path})` may write nothing: use `saveScreenshot(buf, name)` and copy the file from the path it returns.
2. **Chrome/Edge CLI:**
   ```
   <browser> --headless=new --hide-scrollbars --screenshot=<file> --window-size=W,H "<url>"
   ```
   Candidates: Windows `C:\Program Files\Google\Chrome\Application\chrome.exe`, `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`; macOS `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; Linux `google-chrome`, `chromium`, `microsoft-edge` on PATH.
   - It captures the **viewport only**. When the page is taller than H, use a tall window (for example H=2400) and say so in the hand-off.
   - It writes **PNG only**. For `jpeg`, convert afterwards with whatever exists: `magick`, `ffmpeg`, `sips` (macOS), PowerShell `System.Drawing` (Windows). None available: deliver PNG and state that JPEG conversion was unavailable.
   - Headless can crash on some machines: retry once, then try headed or the other browser.
3. **Nothing works:** skip capture, keep the HTML, and print the exact manual command per file.

## Hub update

1. After all screen shots, add a "Screenshots" section to `<out>/<slug>/index.html` (the template has an optional one): relative thumbnails linking to `screenshots/*`, ordered by screen, then state, light before dark. If the hub lacks the `.shots` rules, copy them from `assets/index-template.html`.
2. Then capture the hub (`index.<ext>`, plus `--dark`) so it shows that section.

## Failure handling

- Per shot: retry once, then move down the ladder, then skip that shot. Continue with the rest.
- Never delete or alter delivered HTML to work around a capture problem.
- Record every skipped shot with its reason and manual command; list them in the hand-off.
- Hub section lists only images that exist; remove the section if none were captured.

## Verification

- Each image exists, is non-empty, and has the right magic bytes: PNG `89 50 4E 47`, JPEG `FF D8 FF` (for example `head -c 4 <file> | xxd`).
- View the first image, and one dark image if any: no toolbar, no notes overlay (unless `--notes`), correct theme. A toolbar visible means `ii-capture` was dropped from the URL.
