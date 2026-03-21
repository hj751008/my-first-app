# Copyright Reference Fixtures

This directory is the local staging area for plaintext reference samples used by the copyright harness.

## Why This Exists

`C:\MathFile` currently contains mostly `.hwp` and `.pdf` files, while the harness only loads plaintext sources with `.txt`, `.md`, `.json`, or `.csv` extensions.

Use the PDF extractor harness first, then review the generated fixtures here and trim or supplement them as needed.

## First Units To Stage

Start with these completed middle-1 units because they have clear source matches and were already prioritized in the project notes:

1. `primeFactorization`
2. `integersRational`
3. `literalExpressions`

After that, expand to:

- `coordinatePlane`
- `basicGeometry`
- `planeFigures`
- `solidFigures`
- `dataInterpretation`

See `reference-manifest.json` for the exact file mapping.

## What To Extract

For each source, keep only the plaintext that helps detect risky overlap:

- representative problem prompts
- answer-option frames
- explanation openings
- repeated instruction phrases
- common misconception wording

Do not copy large contiguous passages into the app. These fixtures are for internal comparison only.

## Suggested Naming

- `primeFactorization.sources.txt`
- `integersRational.sources.txt`
- `literalExpressions.sources.txt`

## Local Run

From `/app`, generate or refresh fixtures:

```powershell
$env:PYTHONIOENCODING = 'utf-8'
npm.cmd run harness:extract-references
```

Then run the copyright harness against this directory:

```powershell
$env:SUJI_REFERENCE_ROOT = Join-Path (Get-Location) 'harness/copyright/fixtures'
npm.cmd run harness:copyright
```

Clear the override when done:

```powershell
Remove-Item Env:PYTHONIOENCODING
Remove-Item Env:SUJI_REFERENCE_ROOT
```
