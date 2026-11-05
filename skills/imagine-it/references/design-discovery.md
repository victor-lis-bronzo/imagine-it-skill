# Design discovery

Goal: read the target repo's design language and produce one **Design brief** (≤ ~40 lines) that the mockups follow. Output only the brief; never modify the repo.

## Budget

- Read-only sweep. Cap at ~15–25 file reads; prefer search (grep/glob) over opening whole files, and read only the relevant ranges of large files.
- If your agent supports subagents, delegate the whole sweep to one and receive only the finished brief (keeps file dumps out of the main context). Pass it this file and the Spec digest's Entry points.
- Stop as soon as every brief field is filled or confidently marked unknown.

## Step 1 — Stack detection

Locate the UI first. In monorepos check `apps/web`, `apps/*`, `frontend/`, `client/`, `web/`, `packages/ui`, `packages/design-system`; read workspace config (`pnpm-workspace.yaml`, `package.json` workspaces, `turbo.json`, `nx.json`) to find it. A shared `packages/ui` usually holds the tokens; the app holds the shell.

| Signal | Meaning / where tokens live |
|---|---|
| `tailwindcss` dep + `tailwind.config.*` | Tailwind v3: `theme.extend` in config |
| `@import "tailwindcss"` / `@theme { … }` in a CSS file | Tailwind v4: tokens are CSS vars in that `@theme` block |
| `components.json` (+ `@radix-ui/*`) | shadcn/ui: HSL/OKLCH vars in `globals.css` (`:root`, `.dark`); components in `components/ui/` |
| `daisyui` | daisyUI themes in Tailwind config / CSS plugin options |
| `@mui/material` | `createTheme(...)` in `theme.ts/js` → `palette`, `typography`, `shape` |
| `@chakra-ui/*` | `extendTheme` / `createSystem` theme file |
| `@mantine/core` | `createTheme` / `MantineProvider theme` |
| `antd` | `ConfigProvider theme={{ token }}`; defaults = Ant tokens (primary `#1677ff`) |
| `bootstrap` / `react-bootstrap` | `_variables.scss` overrides or `--bs-*` vars; else Bootstrap defaults |
| `styled-components` / `@emotion/*` | `ThemeProvider theme={…}` object, `theme.ts` |
| `vuetify` | `createVuetify({ theme })` in plugins file |
| `quasar` | `quasar.config.*` brand colors, `src/css/quasar.variables.scss` |
| `@angular/material` | `mat.define-theme` / palettes in `styles.scss` |
| `primeng` / `primereact` / `primevue` | theme preset import + overrides |
| `sass` + `_variables.scss` / `_tokens.scss` | SCSS variables |
| `tokens.json`, `design-tokens/`, Style Dictionary config | Canonical tokens — prefer these over anything else |
| `.storybook/` | Storybook: stories show component variants; preview file may load theme |
| Flutter (`pubspec.yaml`) | `ThemeData` / `ColorScheme` in `lib/**/theme*.dart` |
| React Native | `StyleSheet` constants, `theme.ts`, `colors.ts`; nav shell in navigator files |
| SwiftUI / iOS | `Assets.xcassets/*.colorset`, `Color` extensions |
| Android | `res/values/colors.xml`, `themes.xml`, Compose `Theme.kt` |
| Django / Rails / Laravel Blade / Razor | Base layout template (`base.html`, `application.html.erb`, `layouts/app.blade.php`, `_Layout.cshtml`) + linked CSS |

Non-web stacks: mockups are still HTML; mimic the native look (bottom nav, app bar, platform spacing) using the extracted tokens at phone width.

## Step 2 — Token extraction

Capture, with source `file:line` per group:
- **Colors:** primary (+ contrast/foreground), secondary/accent, background, surface/card, secondary surface, border, text, muted text, success, warning, danger/destructive, info if present.
- **Dark mode:** `.dark`, `[data-theme="dark"]`, `@media (prefers-color-scheme: dark)`, theme mode in JS config. Capture the dark values for the same roles.
- **Typography:** font families and how they load (`next/font`, Google Fonts link, `@font-face`, package). Mockups cannot fetch remote fonts — use the family name first, then a system fallback stack (e.g. `"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`). Note base size, heading sizes, weights.
- **Shape & depth:** radius scale, shadow scale.
- **Spacing:** base unit (4px or 8px typical) and notable container widths.
- **Breakpoints:** only if the feature needs responsive views.

Conversion rules — the brief holds plain CSS values:
- Tailwind palette names → hex (`blue-600` → `#2563eb`, `slate-900` → `#0f172a`, `gray-200` → `#e5e7eb`).
- shadcn HSL triplets (`222.2 84% 4.9%`) → copy as-is into the var and note that usage is `hsl(var(--x))`; or wrap: `--color-text: hsl(222.2 84% 4.9%)`. Prefer wrapping so templates can use `var(--color-text)` directly. OKLCH values (Tailwind v4): copy as-is as `oklch(...)`. Derived tints/opacity utilities (`bg-primary/10`) become `color-mix(in srgb, var(--color-primary) 10%, transparent)` in feature CSS.
- MUI/Chakra/Mantine palette objects → the `main`/`500`/`6` shade as hex.
- SCSS variables → resolved literal values (follow one level of references).
- Framework defaults when nothing is overridden (e.g. Bootstrap primary `#0d6efd`, MUI primary `#1976d2`) — mark `(framework default)`.

## Step 3 — Structure & patterns

- **App shell:** sidebar / topbar / tabs / bottom nav; widths; logo placement; user menu. Read the root layout (`app/layout.tsx`, `App.vue`, `_app.tsx`, base template).
- **Navigation:** copy real nav item labels and order; the mockup inserts the feature where the Spec digest's Entry points say.
- **Responsive behaviour:** check what changes the layout (`@container` queries, `hidden xl:…` column hiding) and replicate it.
- **Page header pattern:** title + breadcrumb + actions? subtitle? tabs below?
- **Core components** — note look and variants: buttons (primary/secondary/ghost/destructive, sizes), inputs/selects/forms (label position, help/error text), tables/lists (density, zebra, row actions, pagination), cards, badges/status pills, modals/drawers/sheets, toasts, empty states.
- **Reference screens:** find 1–3 existing screens closest to the feature's domain (search routes/pages by entity names from the Spec digest) and read them; the mockups should look like siblings of these.
- **Logo:** a real logo file may be copied into the slug folder and referenced relatively.
- **Icons:** detect library (`lucide-react`, `@heroicons/*`, `@mui/icons-material`/Material Symbols, `@fortawesome/*`, `react-icons`, `@tabler/icons`, `phosphor`). Mockups use inline SVG approximations in that style (stroke 1.5–2px outline for lucide/heroicons/tabler; filled for Material).

## Step 4 — Copy & locale

- **UI language:** from i18n files (`locales/`, `messages/`, `*.po`, `i18n/*.json`), hardcoded strings in reference screens, `<html lang>`. All mockup copy uses this language, even if the spec is in another.
- **Tone:** formal/informal, button verb style ("Save" vs "Save changes"), capitalization (Title vs Sentence case).
- **Formats:** dates, numbers, currency (e.g. `12/11/2026`, `R$ 1.234,56` vs `Nov 12, 2026`, `$1,234.56`).

## Fallbacks

- **UI exists but no explicit tokens:** read computed values from the most-used components/CSS; failing that, use the framework defaults and mark them.
- **No UI in repo** (backend/library/CLI): check README/docs images and `docs/`, `screenshots/` for a product look; if images exist and you can view them, infer palette and shell from them.
- **Otherwise, or `--wireframe` passed:** wireframe mode — use the base.css wireframe defaults. State the reason in the brief's Mode line.

## Output: Design brief

Fill this template. Use the canonical variable names exactly — they are a contract with the HTML templates. Add repo-specific extras after them (e.g. `--color-accent`, `--color-info`, `--sidebar-width`).

````markdown
## Design brief
- **Mode:** hi-fi | wireframe — <why>
- **Stack:** <framework + UI lib + styling; UI app path>
- **Tokens:** (wireframe: "none — use base.css wireframe defaults"; the templates' `data-fidelity` becomes `wireframe`)
```css
:root {
  --color-bg: #ffffff;
  --color-surface: #ffffff;
  --color-surface-2: #f8fafc;
  --color-border: #e2e8f0;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-primary: #2563eb;
  --color-primary-contrast: #ffffff;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 12px rgb(0 0 0 / 0.08);
  --space-unit: 4px;
  /* repo-specific extras */
}
```
- **Dark mode:** yes|no — <selector>; overrides: `--color-bg: …; --color-surface: …; …`
- **App shell:** <e.g. 240px left sidebar, 56px topbar with search + avatar; content max-width 1280px>
- **Nav items:** <real labels in order>
- **Component notes:** <buttons, inputs, tables, cards, badges, modals, toasts, empty states — one line each>
- **Reference screens:** <paths>
- **Icons:** <library> → inline SVG, <outline 1.5px | filled>
- **Locale:** <language>, <tone>, dates `<fmt>`, currency `<fmt>`
- **Sources:** <file:line per token group and pattern>
````
