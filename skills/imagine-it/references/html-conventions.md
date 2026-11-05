# HTML output conventions

The output contract for everything written to the target repo. Follow it exactly.

## Folder layout

```
<out>/<slug>/           # default <out> = .imagine-it/
├── index.html          # hub (from assets/index-template.html)
├── styles.css          # tokens + base.css + feature styles
├── ii.js               # copied verbatim from assets/ii.js
├── 01-<screen>.html    # one file per screen, flow order
└── 02-<screen>.html
```

- Slug: lowercase kebab-case, ASCII only; see context-intake.md for the slug rule (issue number / ticket key prefix). If `<out>/<slug>/` already exists and this is a NEW spec, append `-2`; if it is the same spec, edit in place.
- Screen files: `NN-kebab-name.html`, zero-padded, in flow order (`01-order-list.html`).
- Everything lives in this one folder. Do not touch files outside `<out>/`.
- Local images are allowed if copied into the slug folder and referenced by relative path; never remote ones.

## Assembling styles.css

Build it in this order, in one file:

1. The `:root { ... }` tokens block from the design brief. Canonical names only: `--color-bg`, `--color-surface`, `--color-surface-2`, `--color-border`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-contrast`, `--color-success`, `--color-warning`, `--color-danger`, `--font-sans`, `--font-mono`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--shadow-sm`, `--shadow-md`, `--space-unit`.
2. The full contents of `assets/base.css`, verbatim. It holds the `ii-` chrome plus fallback classes: `.sr-only`, `.app-shell`, `.sidebar`, `.topbar`, `.main`, `.page-header`, `.btn`, `.btn-primary`, `.card`, `.muted`, `.empty`. Copy it verbatim; use the fallbacks as a starting point and restyle them in the feature CSS to imitate the repo.
3. Feature component styles (tables, forms, overrides of the fallbacks...) imitating the repo's real components. Tokens only, no raw hex/rgb/rgba. For tints use `color-mix(in srgb, var(--color-danger) 12%, transparent)`.

Wireframe mode: set `data-fidelity="wireframe"` on `<html>` and omit the tokens block; `base.css` supplies grayscale defaults. Do not add color. Both templates carry `data-fidelity`; set it to `hifi` or `wireframe` to match the hub's Mode line on every file.

## Hard rules

- Plain HTML + CSS. Vanilla JS only for tiny interactions (`ii.js` is enough in most cases).
- No CDNs, frameworks, web fonts, network images, `@import`, or any `http(s)://` / protocol-relative URL.
- Icons are inline SVG (`aria-hidden="true"` when decorative).
- Must work opened directly via `file://`. Relative links only; `href="#"` is allowed for links outside the flow.
- Realistic domain data (names, amounts, dates, statuses). Never lorem ipsum.
- Accessible semantic markup: landmarks, heading order, `<button>` vs `<a>`, labels on inputs, `aria-current`, visible focus.
- Copy language follows the target repo (UI strings, locale, currency and date formats).

## Annotations: data-note

Put `data-note` on the element that satisfies or embodies the point:

- `data-note="AC-2: Refund total updates as items are unchecked"` for acceptance criteria. One `AC-n:` per note (checks match the literal `AC-n:`). Do not write "(derived)"; the hub shows it.
- `data-note="NOTE: Confirmation modal is an assumption; spec is silent"` for design decisions and assumptions.

Rules:
- Never put `data-note` on void elements (`img`, `input`, `br`...) or on `ul`/`ol`/`table`/`tr`/`select`/`button`/`a`. Put it on a wrapping `div`/`span`.
- One sentence per note. `ii.js` renders the numbered pins; do not add pins by hand. Pins are numbered 1..n over the active state only.

## States

Wrap each state of a screen in a section inside the same file:

```html
<section data-state="default">...</section>
<section data-state="empty">...</section>
```

- Use `<section data-state>` only. Leave other `data-state` attributes (e.g. on imitated components from the repo) alone; `ii.js` ignores them.
- Names are lowercase kebab: `default`, `empty`, `loading`, `error`, `success`, `no-permission`, `validation-errors`.
- The first section in the DOM is the initial state; name it `default` when a neutral state exists.
- Anything that varies by state (page subtitle, counts, header text) goes INSIDE the state section, not in a shared header. Only truly shared chrome (shell, title) stays outside.
- Link to a state with `02-x.html#state=error`. Changing the selector updates the hash.
- Demo buttons: any element with `data-ii-state="<name>"` switches to that state on click (e.g. a "Start export" button with `data-ii-state="loading"`).
- Omit state sections if the screen has one state; the selector then does not render.

## Navigation contract

Each screen declares, in `<head>`:

```html
<meta name="ii-index" content="index.html">
<meta name="ii-prev" content="01-order-list.html">  <!-- omit on the first screen -->
<meta name="ii-next" content="03-confirmation.html"> <!-- omit on the last screen -->
<link rel="stylesheet" href="styles.css">
<script src="ii.js" defer></script>
```

`<title>` is `NN · Screen name`. `ii.js` builds the toolbar from these and adds `ii-has-bar` to `<body>`. In-page links between screens should point to the real next file.

## Responsive

- Desktop-first, designed at 1280-1440px, unless the product is mobile-first.
- Mobile-first products: wrap the app in a centered 390px-wide frame (`max-width: 390px; margin: 0 auto`) on a neutral backdrop.
- No full responsive breakpoints; a sane fluid layout is enough.

## Dark mode

Only if the repo has dark mode: set `data-has-dark` on `<html>` and add `:root[data-theme="dark"] { ...token overrides... }` to `styles.css`. Otherwise do neither; the theme toggle must not appear. The choice persists (`ii-theme`).

## Pre-delivery checklist

The single definition of "done". Every item must pass.

- [ ] Every file in the screen plan exists, and every `href`/`ii-prev`/`ii-next`/`ii-index` resolves (`href="#"` allowed for non-flow links).
- [ ] `grep -rnEi "(src|srcset|href)=[\"']?(https?:)?//|url\([\"']?(https?:)?//|@import" <out>/<slug>` returns nothing (or the equivalent search tool).
- [ ] `grep -rn "REPLACE" <out>/<slug>` returns nothing.
- [ ] Every AC from the digest appears as a literal `AC-n:` in some `data-note`; the hub's coverage table matches.
- [ ] `ii.js` is byte-identical to `assets/ii.js`; `base.css` is included verbatim in `styles.css`.
- [ ] No lorem ipsum.
- [ ] No raw hex/rgb/rgba outside the tokens block and the verbatim base.css section.
- [ ] Hub lists assumptions, out of scope, open questions, and design sources.
