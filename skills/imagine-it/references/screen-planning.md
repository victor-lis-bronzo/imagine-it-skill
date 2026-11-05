# Screen planning

Decide what to generate before writing any HTML. Write the plan first, then generate.

## Principles

- One file per distinct view/route, or per major overlay (modal, drawer) that carries real content of its own (a form, a multi-step confirmation). A trivial confirm dialog is a state, not a file.
- States go inside the same file as `data-state` sections, never separate files: empty, loading skeleton, error, success/confirmation, permission denied, validation errors.
- As many as needed, as few as possible. Typical is 2-6 files. More than 8 needs a stated reason in the plan (for example, a multi-step wizard with distinct steps).
- If the feature hooks into an existing screen (new button, tab, column, banner), include that screen as a modified copy, with the change annotated by `data-note`. Imitate the real screen from the repo; mark the new parts.
- Add a mobile variant only if the product is mobile or responsive-critical. Otherwise skip it.
- Order files by the user's flow (entry point first), because numbering drives prev/next navigation.
- Every acceptance criterion must be covered by at least one screen state.

## Flags

- `--screens <n>`: caps or forces the count. If the natural plan has more than n, merge related views (fold overlays into states) and say what was merged. If it has fewer, split by the most distinct states or steps, and say so in the plan.
- `--wireframe`: does not change the plan, only the fidelity.

## Plan format

Write this table before generating; show it in the conversation at hand-off (the hub's flow cards are its summary, nothing is written to disk):

| # | file | purpose | states | ACs covered |
|---|------|---------|--------|-------------|

- `#`: flow order, matches the `NN` file prefix.
- `file`: exact filename, `NN-kebab-name.html`; mark modified existing screens as "(modified)".
- `purpose`: one sentence from the user's point of view.
- `states`: the `<section data-state>` names in the file. The first state is the initial one; name it `default` when neutral (otherwise e.g. `default (success)`). Anything that varies by state lives inside its section; link with `02-x.html#state=error`.
- `ACs covered`: AC ids; if the spec has no numbered ACs, number them yourself (AC-1...) in the hub.

After the table, list assumptions and open questions that affect the plan.

## Example

Spec: "Support agents can issue partial refunds from an order. Show a confirmation. Block refunds over $500 without manager approval."

| # | file | purpose | states | ACs covered |
|---|------|---------|--------|-------------|
| 1 | 01-order-detail.html (modified) | Agent opens an order and finds the new "Refund" action | default, already-refunded | AC-1 |
| 2 | 02-refund-form.html | Agent selects items and amounts to refund | default, validation-errors, needs-approval | AC-2, AC-3 |
| 3 | 03-refund-confirmation.html | Agent sees the result of the refund | default (success), error | AC-4 |

Why three files and not five: "needs-approval" and "validation-errors" are states of the form, and the confirm step is part of the result screen.
