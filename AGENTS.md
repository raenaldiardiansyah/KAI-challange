# KAI Project Instructions for Codex

This repository is the main KAI Predictive Maintenance dashboard project.

## Root locations

Main project root:

`D:\Downloads\KAI`

Main frontend target:

`D:\Downloads\KAI\frontend`

External UI frontend reference:

`D:\Downloads\DependencyTrack-frontend-reference`

Additional project context folder:

`D:\Downloads\KAI\.agents`

Before doing frontend UI work, read:

- `.agents/kai-ui-frontend.md`

## Important rule

The main project to edit is always:

`D:\Downloads\KAI`

Do not modify the external reference project:

`D:\Downloads\DependencyTrack-frontend-reference`

unless the user explicitly asks to edit that folder.

Use the external reference only as a UI/structure/design reference.

---

## Project overview

This project is a KAI Predictive Maintenance dashboard frontend built with Next.js App Router.

The frontend is currently the main focus. Backend/API integration will be connected later, so dummy JSON or mock data is acceptable unless the user says otherwise.

The LLM/Insight section is a viewer/insight display, not an execution engine.

Preserve the existing frontend UI structure, routes, sidebar, and dashboard components as the baseline.

Do not ask the user to repeat the frontend UI context if it is already described in this file or in `.agents/kai-ui-frontend.md`.

---

## Repository structure awareness

Important folders:

- `frontend` - main UI/frontend app
- `backend` - backend area, do not edit unless requested
- `docs` - documentation
- `.agents` - extra Codex/project context
- `frontend_BACKUP_SEBELUM_RESTORE_2` - backup folder, do not edit unless specifically requested

Avoid editing backup folders unless explicitly instructed.

---

## External UI reference

The user has provided an external frontend UI reference at:

`D:\Downloads\DependencyTrack-frontend-reference`

Use this folder as a visual/UI implementation reference when improving the KAI frontend dashboard.

Rules:

- Use it only as a UI, layout, component, sidebar, spacing, table, card, chart, and interaction reference.
- Do not copy unrelated business logic.
- Do not copy branding or domain-specific DependencyTrack logic unless it is only structural and adapted to KAI.
- Do not modify files inside `D:\Downloads\DependencyTrack-frontend-reference` unless explicitly requested.
- The main project to edit is still `D:\Downloads\KAI`.
- Before making major UI changes, inspect relevant files from both:
  - `D:\Downloads\KAI\frontend`
  - `D:\Downloads\DependencyTrack-frontend-reference`

When adapting UI from the reference project:

- Keep the KAI domain labels.
- Keep the current KAI dashboard purpose.
- Adapt patterns, not unrelated features.
- Prefer safe incremental changes over full rewrites.

---

## RTK usage

RTK is installed at:

`D:\Tools\rtk`

Use RTK for large terminal outputs when available.

Preferred commands:

- `rtk git status`
- `rtk git diff`
- `rtk pnpm build`
- `rtk pnpm test`
- `rtk rg`
- `rtk find`
- `rtk cat`

If `rtk` is not recognized in a terminal session, use:

`D:\Tools\rtk\rtk.exe`

or temporarily add it to PATH:

`$env:Path += ";D:\Tools\rtk"`

Avoid dumping full logs unless necessary. Summarize only relevant errors, changed files, and actionable fixes.

---

## Branch and safety rules

Before editing:

- Check the current branch.
- Inspect relevant files first.
- Prefer small, safe UI changes.
- Avoid large rewrites unless the user explicitly requests them.
- Do not delete existing routes, components, or files unless explicitly requested.
- Do not overwrite user changes without checking git status/diff.
- Do not edit backup folders unless requested.

After meaningful code changes:

- Run an appropriate build/check command when possible.
- Prefer `rtk pnpm build` for build output.
- Summarize only relevant build errors.

---

## Frontend routes

Keep these routes working and avoid deleting them:

- `/overview` - Ringkasan
- `/trainset` - Armada
- `/car-detail` - Gerbong
- `/insight-analytic` - Insight
- `/predictive-maintenance` - Prediktif
- `/live-monitoring` - Pantauan
- `/alarm-center` - Alarm
- `/work-order` - SPK
- `/report-analytics` - Laporan
- `/settings` - Pengaturan
- `/telemetry-explorer` - Sensor mentah

There should be no 404 for these routes.

---

## Indonesian UI labels

Use these UI labels consistently:

- Ringkasan
- Armada
- Gerbong
- Insight
- Prediktif
- Pantauan
- Alarm
- SPK
- Laporan
- Pengaturan
- Sensor mentah

Use `SPK` instead of `Work Order` in the visible Indonesian UI unless the user asks otherwise.

---

## Sidebar rules

The sidebar is an important UI component.

Expected behavior:

- Sidebar should be compact, stable, and route-safe.
- Sidebar may support collapsed and expanded states.
- Default collapsed behavior may be used when requested.
- Collapse icon must not be clipped.
- Collapse icon should not overlap the resizer.
- Sidebar navigation clicks must keep working.
- Avoid glitching when switching collapsed/expanded state.
- Avoid broken labels, broken icons, or inaccessible menu items.
- Sidebar should not push content in a way that breaks dashboard layout.
- The lower sidebar area may show time/date information if already implemented or requested.

Use existing icons and style direction when possible.

---

## Dashboard layout rules

When adjusting dashboard layout:

- Avoid component overlap.
- Avoid cards, charts, maps, or LLM panels being squeezed too much.
- If the top components are cramped, reduce vertical height of lower components such as charts, maps, or LLM/Insight sections.
- Preserve readability.
- Prefer responsive layout fixes over hardcoded fragile sizes.
- Do not break existing dashboard cards.
- Do not remove important summary information.
- Keep layout modern and clean.

For Overview page:

- Keep Summary Cards usable.
- Keep trainset and alarm information visible.
- Keep map or monitoring preview usable.
- Keep LLM/Insight area readable but not too tall if it compresses upper components.

---

## Frontend structure rules

Use the existing frontend structure where possible:

- `src/app`
- `src/features`
- `src/components`
- `src/services`
- `src/dummy`
- `src/constants`
- `src/types`
- `src/hooks`

Do not introduce unnecessary new structure if existing folders already fit.

---

## Trainset and domain context

Trainset IDs:

- `TS-001`
- `TS-002`
- `TS-003`

Each trainset may contain cars:

- `C1` through `C10`

Car detail may include subsystem-level information such as:

- Brake
- Door
- HVAC
- Genset
- Speed
- Traction

Priority insight may include:

- severity
- event
- diagnosis
- confidence
- health score
- recommendation
- evidence

---

## Map and monitoring context

The frontend may include train position maps and live monitoring.

Expected behavior:

- Overview map can act as a compact preview.
- Full map should belong to Pantauan / live monitoring.
- Train markers should be interactive when implemented.
- Avoid SSR CSS import errors with map libraries.
- Keep map container height stable and readable.

---

## LLM / Insight context

The LLM section is currently a viewer or natural-language insight display.

Do not implement LLM execution unless explicitly requested.

LLM/Insight content may show:

- diagnosis
- recommendation
- confidence
- evidence
- event explanation
- subsystem context

Keep the section readable but avoid making it so tall that upper dashboard components become cramped.

---

## Dummy data context

Mock/dummy data is acceptable for now.

Do not remove dummy data unless replacing it with an agreed API/service layer.

Keep data shape consistent with existing components and types.

---

## Testing and validation

After edits, prefer checking:

- route still works
- sidebar links still work
- build succeeds
- no obvious layout overlap
- no broken imports
- no 404 on the 11 main routes

Use:

- `rtk git status`
- `rtk git diff`
- `rtk pnpm build`

When build fails, summarize only the relevant errors and suggest/perform minimal fixes.

---

## Communication style for Codex

When reporting changes:

- Mention files changed.
- Mention why the change was made.
- Mention whether build/check passed.
- Mention any remaining risk.
- Keep the explanation concise.
