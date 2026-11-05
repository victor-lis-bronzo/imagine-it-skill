---
name: imagine-it
description: Turns a feature spec into speculative HTML mockups styled after the current repo's design. Use when the user wants to visualize, mock up, wireframe or "see" a feature, issue, ticket, PRD or idea under discussion, or asks to run imagine-it.
---

# imagine-it

Turn a spec into a **speculative mockup**: a small set of plain `.html` files that show what a feature could look like inside *this* product. It is a conversation piece for humans to react to, not production code — so speed and plausibility beat completeness.

Input (all optional, any order): an issue/PR URL or `#123`, a Jira key or URL, a file path, free text, plus flags:

- `--wireframe` — force grayscale wireframe instead of the repo's look.
- `--out <dir>` — output root (default `.imagine-it/` at the repo root). Output always goes to `<out>/<slug>/`.
- `--screens <n>` — cap or force the number of screen files.
- `--screenshot[=png|jpeg]` — also capture images of the screens (PNG default).
- `--states` — with a screenshot, capture every state, not just the initial one.
- `--viewport <WxH>` — capture size (default 1440x900; 390x844 for mobile-first products).
- `--notes` — capture with the spec-notes overlay on (default off).

With no input, the spec is the current conversation.

## Workflow

Run the steps in order. Each produces an artifact the next one consumes; keep them in your working notes — only the HTML is written to disk.

### 1. Spec digest

Fetch and distill the spec into a **spec digest**: title, slug, goal, actors, entry points, primary flow, entities with realistic sample values, states, acceptance criteria numbered `AC-1…`, out of scope, assumptions, open questions.

Every gap you fill becomes an **assumption**; decisions only a human can make become **open questions**. Keep moving — ask the user only when no spec exists anywhere (no argument, nothing in the conversation).

Done when: every digest field is filled (or explicitly "none") and every AC is numbered.
Details, source-by-source fetching and an example: [references/context-intake.md](references/context-intake.md).

### 2. Design brief

Sweep the repo read-only and write a **design brief**: mode (hi-fi or wireframe), stack, a ready-to-paste `:root` token block using the canonical variable names, dark mode, app shell, component notes, 1–3 reference screens closest to the feature, icon style, UI locale, and the source files everything came from.

If your environment supports subagents, delegate this sweep to one and take back only the brief; if not, do the sweep inline within the same read budget. Mode is wireframe when `--wireframe` is passed or the repo has no UI to imitate; say why in the brief. Then update the digest's Entry points with the real routes/labels found.

Done when: the token block uses every canonical variable name (unless wireframe: Tokens = none) and each token group cites a source file.
Stack detection matrix, where tokens hide, canonical names: [references/design-discovery.md](references/design-discovery.md).

### 3. Screen plan

Decide the files before writing any HTML: a table of `# | file | purpose | states | ACs covered`, in flow order. One file per distinct view or content-heavy overlay; states (empty, loading, error, success…) live as sections inside their screen. As many as needed, as few as possible — typically 2–6.

Done when: every AC appears in the "ACs covered" column of at least one row.
Rules and an example: [references/screen-planning.md](references/screen-planning.md).

### 4. Generate

Write into `<out>/<slug>/`:

```
index.html          hub: digest summary, flow, AC coverage, assumptions, open questions, design sources
styles.css          design-brief tokens + assets/base.css verbatim + feature component styles
ii.js               copied verbatim from assets/ii.js (mockup toolbar: nav, notes, states, theme)
01-<screen>.html    one per row of the screen plan
02-<screen>.html
```

Start from [assets/index-template.html](assets/index-template.html) and [assets/screen-template.html](assets/screen-template.html); copy [assets/base.css](assets/base.css) and [assets/ii.js](assets/ii.js) from this skill folder. Imitate the reference screens: same shell, nav labels, component shapes and copy tone, in the repo's UI language. Fill with realistic domain data. Mark each element that satisfies an AC with `data-note="AC-n: …"` and each speculative design choice with `data-note="NOTE: …"`.

The output is self-contained plain HTML/CSS with tiny vanilla JS, opened straight from disk: relative links only, inline SVG icons, system-font fallbacks for the repo's fonts.
Full output contract and pre-delivery checklist: [references/html-conventions.md](references/html-conventions.md).

### 5. Verify

Run the pre-delivery checklist in [references/html-conventions.md](references/html-conventions.md). Done when every checklist item passes; fix and re-check otherwise.

### 6. Capture (only with `--screenshot`)

Skipped entirely without a screenshot flag. Otherwise render the planned screens (and the hub, last) to images in `<out>/<slug>/screenshots/` and add a Screenshots section to `index.html`. A capture problem never blocks the run.

Done when: every planned image exists, is non-empty, has the right magic bytes, and the first image was viewed; skipped shots are reported with the manual command.
Flags, light/dark, naming, tool ladder and fallbacks: [references/screenshots.md](references/screenshots.md).

### 7. Hand off

Reply with: the path to `index.html`, the screen plan table, the screenshot paths (plus any skipped shots and their manual command), the assumptions and open questions, and an offer to open it (`start` on Windows, `open` on macOS, `xdg-open` on Linux). If `<out>` is inside the repo and not already ignored, suggest adding it to `.gitignore`.

Follow-ups: rebuild context from `<out>/<slug>/index.html` (assumptions, design sources) and `styles.css`; do not re-sweep the repo; keep the slug; update `index.html` to match; re-run step 5 (and, if screenshots existed, re-capture the affected screens and the hub).
