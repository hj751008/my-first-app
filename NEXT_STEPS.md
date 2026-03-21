# Next Steps

## Recommended Next Task
- Review and trim the generated plaintext fixtures so the `copyright harness` keeps high-signal reference text.

## Active Tasks
1. Review the generated files under `/app/harness/copyright/fixtures/` and remove low-signal extraction noise where useful.
2. Tune `/app/harness/reference-extract/extract_pdf_references.py` and `/app/harness/copyright/similarity-check.mts` if fixture quality needs improvement.
3. Commit the generated fixture files as stable repo inputs unless the reference workflow changes.
4. Keep the new documentation structure in use:
   - current facts in `PROJECT_CONTEXT.md`
   - session notes in `docs/handoffs/`
   - stable process/design rules in `docs/decisions/`

## Deployment Guardrail
- Keep using the existing Vercel project `my-first-app`
- Keep using the existing production URL `https://my-first-app-ten-nu.vercel.app/`
- Do not relink this app to the separate Vercel project named `app` unless explicitly requested

## Content Guardrail
- Keep all app-facing content original
- Use publisher files only for topic coverage, likely difficulty spread, and misconception patterns
- Do not copy wording, answer options, explanation flow, or near-identical number patterns
- Prefer problems that make Suji explain, compare, or recover a thought process

## Follow-Ups After The Active Tasks
- Expand each unit with more original problems and quiz items
- Add more tutor scenarios for answer leakage and encouragement-first behavior
- Expand fixture coverage if new units or new reference sets are added
- Improve numeric and symbol cleanup in PDF extraction for custom-font source files
- Improve `preflight harness` reporting so sandbox-only manual checks are easier to distinguish from true failures

## Resume Prompt For Next Session
- Read `PROJECT_CONTEXT.md`, then `NEXT_STEPS.md`, then the latest file in `docs/handoffs/`. Continue by reviewing the committed copyright fixtures, tightening extraction quality where needed, and then return to content expansion.
