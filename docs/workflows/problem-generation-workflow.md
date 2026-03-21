# Problem Generation Workflow

## Purpose

Use this workflow when generating large batches of new Suji Math AI problems from publisher references without copying wording, structure, or explanation flow.

This workflow assumes:

- use of the `suji-math-problem-author` skill
- local reference PDFs in `C:\MathFile`
- plaintext fixtures already available under `/app/harness/copyright/fixtures/`

## Default Output Shape

Generate app-ready `generatedProblems` entries that match `/app/lib/content/types.ts`:

```ts
{
  id: "unit-style-number",
  level: "easy" | "medium" | "hard",
  prompt: "New original problem text",
  answer: "Target answer or key idea",
  firstHint: "Concept reconnect hint",
  secondHint: "First-step hint"
}
```

## Batch Rules

For one unit, default to:

- 4 `easy`
- 4 `medium`
- 2 `hard`

Each batch should include a mix of:

- direct factorization or computation
- comparison
- explanation
- error recovery
- strategy choice

## Hard Safety Rules

- Never reuse textbook or workbook sentences.
- Never mirror source multiple-choice options closely.
- Change at least two of these from any reference pattern:
  - situation or framing
  - numbers or objects
  - target question
  - answer format
  - hint flow
- Prefer short prompts with one clear target.
- Prefer hints that reconnect concept first, then suggest a first step.

## Recommended Flow

1. Read `/PROJECT_CONTEXT.md`, `/NEXT_STEPS.md`, and the latest file in `/docs/handoffs/`.
2. Read the target unit content file in `/app/lib/content/`.
3. Read the matching plaintext fixture in `/app/harness/copyright/fixtures/`.
4. Build a small style map first:
   - covered subskills
   - common misconception types
   - source problem families to avoid echoing
5. Generate a 10-problem batch.
6. Manually spot-check for wording echoes.
7. Add the selected problems to the target content pack.
8. Run:

```powershell
npm.cmd run harness:content
$env:SUJI_REFERENCE_ROOT = Join-Path (Get-Location) 'harness/copyright/fixtures'
npm.cmd run harness:copyright
```

## Review Checklist

- Does each prompt feel newly written?
- Are the numbers and answer paths varied?
- Are hints progressive instead of answer-giving?
- Does the set include more than one problem style?
- Would a student need to explain or compare ideas in at least some items?

## File Targets

- workflow doc: `/app/docs/workflows/problem-generation-workflow.md`
- unit content files: `/app/lib/content/*.ts`
- reference fixtures: `/app/harness/copyright/fixtures/*.sources.txt`

## Starting Units

Use this order unless the product priority changes:

1. `primeFactorization`
2. `integersRational`
3. `literalExpressions`
4. `coordinatePlane`

