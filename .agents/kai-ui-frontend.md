# KAI Frontend UI Context

This file stores the detailed frontend UI context for the KAI Predictive Maintenance dashboard.

The user should not need to repeat this context in every Codex request.

## Main project

Main project root:

`D:\Downloads\KAI`

Main frontend folder:

`D:\Downloads\KAI\frontend`

External UI reference:

`D:\Downloads\DependencyTrack-frontend-reference`

The external UI reference should be used only as a design/structure reference. Do not modify it unless explicitly requested.

---

## Frontend goal

The frontend is a dashboard for KAI predictive maintenance and trainset monitoring.

The UI should feel like an operational monitoring dashboard, not a generic template.

The current frontend is the baseline. Preserve existing routes and domain meaning.

Backend integration will come later. Dummy/mock data is acceptable for now.

---

## Main routes and labels

Keep these routes working:

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

Do not remove these routes.

Do not rename visible Indonesian labels unless requested.

---

## Sidebar expectations

The sidebar should be stable and compact.

Important behavior:

- It may start collapsed when requested.
- It should support expand/collapse.
- Icons should remain visible.
- Labels should appear correctly when expanded.
- Collapse button should not be clipped.
- Resizer should not overlap the collapse button.
- Route navigation must keep working.
- Avoid visual glitching when switching states.
- Sidebar should not cover dashboard content.
- Sidebar should not cause layout overflow.

Use a modern dashboard style. Phosphor-style icons are acceptable if already used in the project.

---

## Overview page expectations

The Overview page should summarize the system clearly.

Possible components:

- Summary cards
- Trainset panel
- Train composition
- Priority insight
- Train position map / mini map
- Active alarm table
- Predictive maintenance panel
- Connected train list

When space is limited:

- Give upper summary components enough space.
- Reduce lower chart/map/LLM height instead of squeezing top cards.
- Avoid making the page feel cramped.
- Keep important operational information readable.

---

## Trainset page expectations

The Trainset / Armada page may show:

- Trainset list
- Trainset detail
- Composition C1-C10
- Priority cars
- Health score
- Subsystem heatmap
- Location/status

Trainset IDs:

- `TS-001`
- `TS-002`
- `TS-003`

Cars:

- `C1` to `C10`

---

## Car detail page expectations

The Gerbong / Car Detail page may show:

- Selected car
- Subsystem health
- Evidence
- Recommendation
- Diagnosis
- Severity
- Sensor or anomaly indicators

Subsystem examples:

- Brake
- Door
- HVAC
- Genset
- Speed
- Traction

---

## Insight page expectations

The Insight page may show a flow such as:

Sensor -> Rule -> Event -> JSON -> LLM -> Natural Insight

The LLM section is only a viewer/insight display unless the user explicitly asks to implement LLM execution.

Insight fields may include:

- severity
- event
- diagnosis
- confidence
- health score
- recommendation
- evidence

---

## Predictive maintenance page expectations

The Prediktif page may show:

- Risk ranking
- Maintenance queue
- Priority actions
- Health trend
- Failure risk
- Recommendation

Do not overcomplicate with backend integration unless requested.

---

## Pantauan / live monitoring expectations

The Pantauan page may show:

- Full map
- Train markers
- Trainset status
- Popup summary
- Location and operational state

Map rules:

- Avoid SSR CSS import issues.
- Keep map readable.
- Keep map container height stable.
- If Overview has a mini map, full map belongs here.

---

## Alarm page expectations

The Alarm page may show:

- Alarm table
- Filter
- Severity
- Status
- Timestamp
- Detail panel
- Related trainset/car/subsystem

---

## SPK page expectations

Use `SPK` as the visible Indonesian label.

The SPK page may show:

- SPK form
- SPK status table
- Maintenance action
- Assigned priority
- Related trainset/car/subsystem

---

## Report page expectations

The Laporan page may show:

- Report analytics
- Export/simulation area
- Summary section
- Vertical layout if needed

---

## Settings page expectations

The Pengaturan page may show:

- Dashboard settings
- Mode/disclaimer
- Data/mock mode notes

---

## Sensor mentah page expectations

The Sensor mentah page may show:

- Raw telemetry viewer
- Sensor logs
- Filter/search
- Trainset/car/subsystem selection

---

## UI style rules

Prefer:

- Modern dashboard layout
- Clean spacing
- Stable responsive behavior
- Clear hierarchy
- Tables that are readable
- Cards that are compact but not cramped
- Charts that do not dominate the page
- Consistent border radius and spacing
- Existing design language from the project

Avoid:

- Deleting components unexpectedly
- Breaking route navigation
- Hardcoding fragile sizes everywhere
- Oversized maps/charts/LLM panels that squeeze top content
- Copying unrelated DependencyTrack business logic
- Modifying backup folders

---

## Reference UI usage

The external reference is:

`D:\Downloads\DependencyTrack-frontend-reference`

Use it for:

- Sidebar structure inspiration
- Layout behavior
- Card density
- Table patterns
- Chart area sizing
- Spacing
- Navigation patterns
- Responsive patterns

Do not use it for:

- KAI domain data
- DependencyTrack-specific logic
- Backend behavior
- Direct feature copying unrelated to KAI

---

## RTK reminder

Use RTK for long command outputs:

- `rtk git status`
- `rtk git diff`
- `rtk pnpm build`
- `rtk pnpm test`
- `rtk rg`
- `rtk find`
- `rtk cat`

If RTK command is unavailable, try:

`D:\Tools\rtk\rtk.exe`

or temporarily add PATH:

`$env:Path += ";D:\Tools\rtk"`

Summarize long outputs instead of dumping everything.
