# Suji Math AI Project Context

## Project Goal
- Build a math learning app for Suji that strengthens concept connection instead of giving fast answers.
- Keep the tutor warm, patient, and Socratic.
- Build a structure that can scale from middle school into high school without rewriting the core system.

## Product Direction
- Primary learner: Suji, middle school 2nd grade, with a weak middle school 1st grade foundation.
- Product focus: confidence recovery, concept connection, guided first steps.
- Tone: friendly Korean banmal, encouraging before correction.

## Current Scope
- Middle-1 shared learning flow is implemented.
- Completed middle-1 units:
  - Prime Factorization
  - Integers and Rational Numbers
  - Literal Expressions
  - Coordinate Plane and Graphs
  - Basic Geometry
  - Properties of Plane Figures
  - Properties of Solid Figures
  - Data Organization and Interpretation

## Current App Capabilities
- Shared unit flow across overview, quiz, tutor, progress, and report.
- Parent and teacher summary card on the middle-1 dashboard.
- Printable parent report at `/middle-1/report`.
- Client-side reset action for local test study data.

## Core Architecture
- Shared unit config: `/app/lib/units.ts`
- Shared tutor engine: `/app/lib/tutor.ts`
- Shared progress logic: `/app/lib/progress.ts`
- Shared middle-1 UI wrappers under `/app/app/middle-1/_shared/`
- Unit content packs under `/app/lib/content/`
- Harnesses under `/app/harness/`

## Validation Status
- `harness:content`: passing
- `harness:tutor`: passing
- `harness:extract-references`: passing against local PDF references in `C:\MathFile`
- `harness:copyright`: passing with local plaintext fixtures
- `lint`: passing
- `build`: passing
- `preflight`: passing with status `ready` in the real shell environment

## Known Gaps
- PDF extraction still leaves some symbol and number noise because some source files use custom embedded fonts.
- `preflight` can still show `ready-with-manual-check` inside the Codex sandbox even when the real shell result is `ready`.
- `C:\MathFile` remains a local reference store and is not part of git or deployment.

## Non-Negotiable Rules
- External math files are reference material only.
- Do not copy textbook or problem-bank wording, answer options, explanation flow, or near-identical number patterns.
- App-facing problems, hints, quizzes, and explanations must be newly created.
- The tutor should prefer:
  - identifying what the question asks
  - reconnecting the concept
  - giving one-step hints
  - asking Suji to restate the idea in her own words

## Environment
- Tech stack: Next.js App Router, TypeScript, OpenAI API, localStorage persistence, Vercel deployment
- Environment variables:
  - `OPENAI_API_KEY`
  - `OPENAI_MODEL`

## Documentation Rules
- Keep this file short and factual.
- Put active near-term work in `NEXT_STEPS.md`.
- Put dated session logs in `docs/handoffs/`.
- Put durable design/process choices in `docs/decisions/`.
- Read order for a new session:
  1. `PROJECT_CONTEXT.md`
  2. `NEXT_STEPS.md`
  3. latest file in `docs/handoffs/`
