# Context intake

Goal: turn whatever the user pointed at into one **Spec digest** that drives every mockup. Fetch the source, distill it, and continue. Do not stop to ask questions unless no spec exists anywhere.

## 1. Detect the source

Inspect the skill argument (minus flags like `--wireframe`) and pick the first matching row.

| Argument looks like | Source | How to read it |
|---|---|---|
| `https://github.com/<o>/<r>/issues/<n>`, `#123`, `123` in a GitHub repo | GitHub issue | If `gh` CLI is available: `gh issue view <n> --comments` (add `-R <owner>/<repo>` for full URLs). Else use a GitHub MCP issue-read tool. Else ask the user to paste it. |
| `https://github.com/<o>/<r>/pull/<n>` | GitHub PR | `gh pr view <n> --comments`, or a GitHub MCP pull-request read tool. Also read the issue(s) it closes/links. |
| Jira URL (`*.atlassian.net/browse/…`) or key like `ABC-123` | Jira ticket | Use an Atlassian/Jira MCP if available (issue + comments + subtasks). Otherwise ask the user to paste the ticket. |
| Linear, Notion, Confluence, Google Docs, other URL | External doc | Use a matching MCP if available, else a generic web-fetch tool (works only for public pages). If neither works, ask the user to paste the content. |
| Existing local path (`.md`, `.txt`, `.pdf`, spec, PRD, ADR) | File | Read it. If it references sibling files (e.g. `api.md`, diagrams), read those too. |
| Any other text | Free text | Treat the text itself as the spec. |
| Nothing | Conversation | Use the current conversation: the feature under discussion, decisions made, files mentioned. |

When reading tickets/issues, also collect:
- **Linked sub-issues / subtasks / parent epic** — read titles and bodies; they often hold the real acceptance criteria.
- **Comments** — later comments override the body (scope changes, decisions).
- **Image attachments / screenshots** mentioned in the body or comments — if your environment can view images, open them; existing sketches or screenshots outrank your own assumptions. If you cannot view them, note "screenshot attached, not viewed" under Open questions.
- **Labels / components** — hint at the area of the app (Entry points).

Ask the user only when: the argument is empty AND the conversation contains no feature description, OR a fetch failed and there is no fallback. Ask once, for the content (paste or path), not for clarifications.

## 2. Distill into a Spec digest

Write the digest in your working context (it is not a deliverable file unless the main skill says so). Use these fields exactly, in this order. Keep it tight: bullets, no prose paragraphs.

```markdown
## Spec digest
- **Title:** <human title>
- **Slug:** <kebab-case, ≤ 5 words; prefix ticket number if any>
- **Goal:** <1–2 sentences: who gets what value>
- **Actors/roles:** <role — what they do here>
- **Entry points:** <where in the existing app this lives: page, menu item, button>
- **Primary flow:**
  1. <step>
  2. <step>
- **Entities & fields:** <entity: field (type) = realistic sample value>
- **States to show:** <only relevant ones>
- **Acceptance criteria:**
  - AC-1 <verbatim or derived>
- **Out of scope:** <explicit exclusions>
- **Assumptions:** <every gap you filled>
- **Open questions:** <decisions a human must make>
```

Field rules:
- **Slug** (single source of the slug rule): prefix the issue number or ticket key, then ≤ 5 words: `#142` "Bulk export of invoices" → `142-bulk-export`; `ABC-123` → `abc-123-bulk-export`; no ticket → words only. Lowercase ASCII, hyphens, no stopwords. It names `<out>/<slug>/`; if that folder exists and the spec is new, append `-2`.
- **Entry points:** finalized after design discovery (SKILL.md step 2 updates it with real routes/labels); until then use the wording from the spec.
- **Entities & fields:** use realistic, domain-appropriate sample values in the product's UI language (names, amounts, dates, statuses). Never `foo`, `Lorem ipsum`, `Test 1`. 3–8 sample rows is enough for lists.
- **States to show:** choose from empty, loading, error, success, partial/in-progress, validation error, permission-denied, read-only, offline, long-content/overflow, first-run/onboarding. Include only states the spec implies or that a reviewer would obviously ask about.
- **Acceptance criteria:** if the source has them (checklist, "AC", "Given/When/Then", "Definition of done"), copy verbatim and number them `AC-1`, `AC-2`… If not, derive 3–7 testable criteria from the flow and suffix each with `(derived)`. Mockups will reference these IDs.
- **Out of scope:** copy explicit exclusions; add obvious ones you chose not to draw (e.g. "mobile layout") and mark them `(assumed)`.

## 3. Ambiguity policy

- Ambiguities become **Assumptions**, not blocking questions. Proceed.
- Prefer conservative assumptions that fit the existing product: reuse existing patterns, roles, and navigation; pick the smaller scope; don't invent new permission models or settings pages.
- When two readings are plausible and both are cheap to draw, draw the primary one and list the alternative under Open questions (the main skill may add a variant screen).
- Every assumption must be visible later (mockup annotations / hub page), so phrase each as one checkable sentence.

## 4. Non-UI specs

Backend, API, job, migration, or infra tasks still get mockups. Pick the closest useful visual and record the choice under Assumptions:
- **Consuming screen** — the existing page whose data/behavior changes (e.g. new field appears in a table, new filter, faster pagination).
- **Admin/ops view** — config toggle, job queue, retry controls, audit log.
- **Status/observability panel** — progress, last run, error list, health badges.
- **API-only with no consumer** — a developer-facing view: request/response example card, webhook delivery log, API key settings.

If truly nothing visual exists (pure refactor, dependency bump), say so in the digest and propose the closest useful visual — e.g. a sequence of states (before → during → after) or a timeline of user-observable effects — instead of refusing. Generate fewer screens (1–2).

## 5. Example digest

Issue `#142` "Allow bulk export of invoices" (abridged; fields follow the template above):

```markdown
- **Title:** Bulk export of invoices
- **Slug:** 142-bulk-export
- **Entry points:** Invoices list (`/invoices`), table toolbar.
- **Entities & fields:** Invoice: number = "INV-2026-0413", customer = "Acme Ltda", amount = "R$ 12.480,00", status = Overdue.
- **States to show:** empty selection, export in progress, export failed, permission-denied (Viewer).
- **Acceptance criteria:** AC-1 Select many invoices and export as CSV. AC-4 Viewers cannot export. (derived)
- **Assumptions:** Export button lives in the existing toolbar; UI language is pt-BR.
- **Open questions:** Max export size? Does "select all" span pages?
```
