# Documentation Structure Decision

## Status
- Accepted

## Date
- 2026-03-21

## Decision
- Keep only two short operational files at the repository root:
  - `PROJECT_CONTEXT.md`
  - `NEXT_STEPS.md`
- Store session logs under `docs/handoffs/`.
- Store durable design and process decisions under `docs/decisions/`.
- Store long-range expansion plans under `docs/roadmap/`.

## Why
- A single growing markdown file becomes hard to scan and easy to stale.
- Session history, design policy, and active work should not compete in the same document.
- The project is expected to expand beyond middle-1 into middle school and high school, so documentation needs to scale before the content set grows.

## Rules
- `PROJECT_CONTEXT.md` should contain current facts, not long history.
- `NEXT_STEPS.md` should contain only active near-term work.
- Handoff files should be dated and append-only by session.
- Durable rules should move out of handoff notes into decision docs when they stop changing frequently.

