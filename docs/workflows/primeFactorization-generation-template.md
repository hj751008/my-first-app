# Prime Factorization Batch Template

## Goal

Generate one original 10-problem batch for `primeFactorization` that can be reviewed and then folded into `/app/lib/content/primeFactorization.ts`.

## Unit Focus

Target these ideas:

- tell prime numbers from composite numbers
- rewrite a number as a product of factors
- continue factor splitting until only primes remain
- compare two factorization paths
- use prime factorization to reason about divisors or multiples

## Misconceptions To Target

- treating `1` as a prime number
- stopping at `2 x 6` or `3 x 4` and thinking the work is done
- thinking factorization must follow one fixed path
- performing calculation without understanding what the final prime-only form means

## Batch Mix

- `easy`: 4
- `medium`: 4
- `hard`: 2

## Style Mix

Include at least one problem from each group:

- plain factorization
- comparison of two solution paths
- error checking or debugging
- explanation in words
- application to divisor or multiple reasoning

## Prompt Constraints

- Keep prompts short and concrete.
- Avoid copying textbook-style command openings.
- Prefer asking Suji to explain, compare, or judge a path when possible.
- Avoid repeating the same number pattern across the set.

## Hint Constraints

- `firstHint`: reconnect the concept
- `secondHint`: suggest the first usable step
- do not reveal the full answer in the hint

## Output Skeleton

```ts
[
  {
    id: "pf-batch-easy-1",
    level: "easy",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-easy-2",
    level: "easy",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-easy-3",
    level: "easy",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-easy-4",
    level: "easy",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-medium-1",
    level: "medium",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-medium-2",
    level: "medium",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-medium-3",
    level: "medium",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-medium-4",
    level: "medium",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-hard-1",
    level: "hard",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  },
  {
    id: "pf-batch-hard-2",
    level: "hard",
    prompt: "",
    answer: "",
    firstHint: "",
    secondHint: ""
  }
]
```

## Review Before Inserting

- Compare against `/app/harness/copyright/fixtures/primeFactorization.sources.txt`
- Reject items that echo reference wording
- Reject items that reuse too many of the same numbers as one source cluster
- Keep only items that feel app-native and student-friendly

## Next Command Set

After inserting the selected problems into `/app/lib/content/primeFactorization.ts`:

```powershell
npm.cmd run harness:content
$env:SUJI_REFERENCE_ROOT = Join-Path (Get-Location) 'harness/copyright/fixtures'
npm.cmd run harness:copyright
```
