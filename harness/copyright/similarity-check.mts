import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { basicGeometryContent } from "../../lib/content/basicGeometry.ts";
import { coordinatePlaneContent } from "../../lib/content/coordinatePlane.ts";
import { dataInterpretationContent } from "../../lib/content/dataInterpretation.ts";
import { integersRationalContent } from "../../lib/content/integersRational.ts";
import { literalExpressionsContent } from "../../lib/content/literalExpressions.ts";
import { planeFiguresContent } from "../../lib/content/planeFigures.ts";
import { primeFactorizationContent } from "../../lib/content/primeFactorization.ts";
import { solidFiguresContent } from "../../lib/content/solidFigures.ts";
import type { DiagnosticQuestion, GeneratedProblem, LearningUnitContent } from "../../lib/content/types.ts";

type Severity = "review" | "high-risk";

type ContentTarget = {
  key: string;
  content: LearningUnitContent;
};

type AppTextKind = "problem-prompt" | "problem-hint" | "quiz-prompt" | "quiz-explanation" | "quiz-option";

type AppTextEntry = {
  unitKey: string;
  label: string;
  kind: AppTextKind;
  text: string;
  normalized: string;
};

type Issue = {
  severity: Severity;
  message: string;
};

type ReferenceScan = {
  root: string;
  fileCount: number;
  textSourceCount: number;
  scannedFiles: string[];
  textEntries: string[];
  notes: string[];
};

const contentTargets: ContentTarget[] = [
  { key: "primeFactorization", content: primeFactorizationContent },
  { key: "integersRational", content: integersRationalContent },
  { key: "literalExpressions", content: literalExpressionsContent },
  { key: "coordinatePlane", content: coordinatePlaneContent },
  { key: "basicGeometry", content: basicGeometryContent },
  { key: "planeFigures", content: planeFiguresContent },
  { key: "solidFigures", content: solidFiguresContent },
  { key: "dataInterpretation", content: dataInterpretationContent },
];

const referenceRoot = process.env.SUJI_REFERENCE_ROOT ?? "C:\\MathFile";
const textExtensions = new Set([".txt", ".md", ".json", ".csv"]);
const riskyInstructionPhrases = [
  "다음 중",
  "알맞은 것은",
  "옳은 것은",
  "구하시오",
  "답을 구하시오",
  "바르게 나타낸 것은",
  "설명하시오",
  "보기에서",
  "고르시오",
];

function getReportDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCompact(value: string) {
  return normalizeText(value).replace(/\s+/g, "");
}

function collectAppTexts(target: ContentTarget) {
  const entries: AppTextEntry[] = [];

  target.content.generatedProblems.forEach((problem: GeneratedProblem, index) => {
    entries.push({
      unitKey: target.key,
      label: `generatedProblems[${index}].prompt`,
      kind: "problem-prompt",
      text: problem.prompt,
      normalized: normalizeCompact(problem.prompt),
    });
    entries.push({
      unitKey: target.key,
      label: `generatedProblems[${index}].firstHint`,
      kind: "problem-hint",
      text: problem.firstHint,
      normalized: normalizeCompact(problem.firstHint),
    });
    entries.push({
      unitKey: target.key,
      label: `generatedProblems[${index}].secondHint`,
      kind: "problem-hint",
      text: problem.secondHint,
      normalized: normalizeCompact(problem.secondHint),
    });
  });

  target.content.diagnosticQuiz.forEach((question: DiagnosticQuestion, index) => {
    entries.push({
      unitKey: target.key,
      label: `diagnosticQuiz[${index}].prompt`,
      kind: "quiz-prompt",
      text: question.prompt,
      normalized: normalizeCompact(question.prompt),
    });
    entries.push({
      unitKey: target.key,
      label: `diagnosticQuiz[${index}].explanation`,
      kind: "quiz-explanation",
      text: question.explanation,
      normalized: normalizeCompact(question.explanation),
    });

    question.options.forEach((option, optionIndex) => {
      entries.push({
        unitKey: target.key,
        label: `diagnosticQuiz[${index}].options[${optionIndex}]`,
        kind: "quiz-option",
        text: option,
        normalized: normalizeCompact(option),
      });
    });
  });

  return entries;
}

function walkFiles(root: string) {
  const pending = [root];
  const files: string[] = [];

  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) {
      continue;
    }

    const stat = statSync(current);
    if (stat.isDirectory()) {
      readdirSync(current, { withFileTypes: true }).forEach((entry) => {
        pending.push(join(current, entry.name));
      });
      continue;
    }

    files.push(current);
  }

  return files;
}

function scanReferences(root: string): ReferenceScan {
  const result: ReferenceScan = {
    root,
    fileCount: 0,
    textSourceCount: 0,
    scannedFiles: [],
    textEntries: [],
    notes: [],
  };

  try {
    const files = walkFiles(root).sort();
    result.fileCount = files.length;
    result.scannedFiles = files.slice(0, 12).map((file) => file.replace(`${root}\\`, ""));

    files.forEach((file) => {
      const extension = extname(file).toLowerCase();
      if (!textExtensions.has(extension)) {
        return;
      }

      try {
        const text = readFileSync(file, "utf8");
        if (text.trim().length === 0) {
          return;
        }

        result.textEntries.push(normalizeCompact(text));
        result.textSourceCount += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        result.notes.push(`Could not read text reference "${file}": ${message}`);
      }
    });

    if (result.textSourceCount === 0) {
      result.notes.push(
        "No plaintext references were found under the reference root. Direct phrase comparison is skipped for PDF/HWP-only sources."
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.notes.push(`Reference scan skipped: ${message}`);
  }

  return result;
}

function buildOptionSignature(options: readonly string[]) {
  return options
    .map((option) => {
      if (/^-?\d+$/.test(option.trim())) {
        return "integer";
      }
      if (/^-?\d+\s*x\s*-?\d+$/i.test(option.trim())) {
        return "multiplication";
      }
      if (/^\(.+\)$/.test(option.trim())) {
        return "coordinate";
      }
      if (/^[a-z][a-z0-9+\- ]*$/i.test(option.trim())) {
        return "expression";
      }
      return "text";
    })
    .join("|");
}

function sharedPrefixLength(left: string, right: string) {
  const limit = Math.min(left.length, right.length);
  let index = 0;

  while (index < limit && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

function countSharedChars(left: string, right: string) {
  const leftCounts = new Map<string, number>();
  const rightCounts = new Map<string, number>();

  left.split("").forEach((char) => {
    leftCounts.set(char, (leftCounts.get(char) ?? 0) + 1);
  });
  right.split("").forEach((char) => {
    rightCounts.set(char, (rightCounts.get(char) ?? 0) + 1);
  });

  let shared = 0;
  leftCounts.forEach((count, char) => {
    shared += Math.min(count, rightCounts.get(char) ?? 0);
  });

  return shared;
}

function createIssueBuckets() {
  return new Map<string, Issue[]>();
}

function pushIssue(issueMap: Map<string, Issue[]>, unitKey: string, severity: Severity, message: string) {
  const issues = issueMap.get(unitKey) ?? [];
  issues.push({ severity, message });
  issueMap.set(unitKey, issues);
}

function checkRiskyInstructionPhrases(target: ContentTarget, issueMap: Map<string, Issue[]>) {
  target.content.diagnosticQuiz.forEach((question, index) => {
    const normalizedPrompt = normalizeText(question.prompt);
    riskyInstructionPhrases.forEach((phrase) => {
      if (normalizedPrompt.startsWith(phrase)) {
        pushIssue(
          issueMap,
          target.key,
          "review",
          `diagnosticQuiz[${index}].prompt starts with textbook-style instruction phrase "${phrase}".`
        );
      }
    });
  });
}

function checkRepeatedExplanationFrames(target: ContentTarget, issueMap: Map<string, Issue[]>) {
  const explanations = target.content.diagnosticQuiz.map((question, index) => ({
    index,
    normalized: normalizeCompact(question.explanation),
  }));

  for (let leftIndex = 0; leftIndex < explanations.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < explanations.length; rightIndex += 1) {
      const left = explanations[leftIndex];
      const right = explanations[rightIndex];
      const prefixLength = sharedPrefixLength(left.normalized, right.normalized);
      const minLength = Math.min(left.normalized.length, right.normalized.length);

      if (minLength >= 18 && prefixLength >= Math.floor(minLength * 0.7)) {
        pushIssue(
          issueMap,
          target.key,
          "review",
          `diagnosticQuiz explanations ${left.index} and ${right.index} share a long leading frame.`
        );
      }
    }
  }
}

function checkOptionPatternReuse(targets: ContentTarget[], issueMap: Map<string, Issue[]>) {
  const signatureMap = new Map<string, { unitKey: string; label: string }[]>();

  targets.forEach((target) => {
    target.content.diagnosticQuiz.forEach((question, index) => {
      const signature = `${buildOptionSignature(question.options)}::answerIndex=${question.options.indexOf(question.answer)}`;
      const entries = signatureMap.get(signature) ?? [];
      entries.push({
        unitKey: target.key,
        label: `diagnosticQuiz[${index}]`,
      });
      signatureMap.set(signature, entries);
    });
  });

  signatureMap.forEach((entries, signature) => {
    if (entries.length < 4) {
      return;
    }
    if (!/(integer|multiplication|coordinate|expression)/.test(signature)) {
      return;
    }

    entries.forEach((entry) => {
      pushIssue(
        issueMap,
        entry.unitKey,
        "review",
        `${entry.label} reuses an option-pattern signature that appears ${entries.length} times across units (${signature}).`
      );
    });
  });
}

function checkNearDuplicateAppTexts(entries: AppTextEntry[], issueMap: Map<string, Issue[]>) {
  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const left = entries[leftIndex];
      const right = entries[rightIndex];

      if (left.unitKey === right.unitKey || left.kind !== right.kind) {
        continue;
      }
      if (left.normalized.length < 14 || right.normalized.length < 14) {
        continue;
      }
      if (Math.abs(left.normalized.length - right.normalized.length) > 6) {
        continue;
      }

      const sharedChars = countSharedChars(left.normalized, right.normalized);
      const ratio = sharedChars / Math.max(left.normalized.length, right.normalized.length);

      if (ratio >= 0.92) {
        pushIssue(
          issueMap,
          left.unitKey,
          "high-risk",
          `${left.label} is unusually close to ${right.unitKey}:${right.label}.`
        );
        pushIssue(
          issueMap,
          right.unitKey,
          "high-risk",
          `${right.label} is unusually close to ${left.unitKey}:${left.label}.`
        );
      }
    }
  }
}

function checkPlaintextReferenceOverlap(entries: AppTextEntry[], referenceScan: ReferenceScan, issueMap: Map<string, Issue[]>) {
  if (referenceScan.textEntries.length === 0) {
    return;
  }

  entries.forEach((entry) => {
    if (entry.normalized.length < 12) {
      return;
    }

    const matched = referenceScan.textEntries.some((referenceText) => referenceText.includes(entry.normalized));
    if (!matched) {
      return;
    }

    pushIssue(
      issueMap,
      entry.unitKey,
      "high-risk",
      `${entry.label} appears verbatim inside a plaintext reference source.`
    );
  });
}

export function createCopyrightReport() {
  const referenceScan = scanReferences(referenceRoot);
  const issueMap = createIssueBuckets();
  const appEntries = contentTargets.flatMap(collectAppTexts);

  contentTargets.forEach((target) => {
    checkRiskyInstructionPhrases(target, issueMap);
    checkRepeatedExplanationFrames(target, issueMap);
  });

  checkOptionPatternReuse(contentTargets, issueMap);
  checkNearDuplicateAppTexts(appEntries, issueMap);
  checkPlaintextReferenceOverlap(appEntries, referenceScan, issueMap);

  let reviewCount = 0;
  let highRiskCount = 0;
  let safeCount = 0;
  const lines: string[] = ["[copyright harness]"];

  lines.push(`- reference root: ${referenceScan.root}`);
  lines.push(`- reference files scanned: ${referenceScan.fileCount}`);
  lines.push(`- plaintext reference sources loaded: ${referenceScan.textSourceCount}`);

  if (referenceScan.scannedFiles.length > 0) {
    lines.push(`- sample reference files: ${referenceScan.scannedFiles.join(", ")}`);
  }

  referenceScan.notes.forEach((note) => {
    lines.push(`- note: ${note}`);
  });

  lines.push("");

  contentTargets.forEach((target) => {
    const issues = issueMap.get(target.key) ?? [];
    const hasHighRisk = issues.some((issue) => issue.severity === "high-risk");
    const status = issues.length === 0 ? "safe" : hasHighRisk ? "high-risk" : "review";

    if (status === "safe") {
      safeCount += 1;
    } else if (status === "review") {
      reviewCount += 1;
    } else {
      highRiskCount += 1;
    }

    lines.push(`- ${target.key}: ${status}`);
    issues.forEach((issue) => {
      lines.push(`  - [${issue.severity}] ${issue.message}`);
    });
  });

  lines.push("");
  lines.push(`[summary] safe=${safeCount}, review=${reviewCount}, high-risk=${highRiskCount}`);

  return {
    report: lines.join("\n"),
    safeCount,
    reviewCount,
    highRiskCount,
  };
}

function main() {
  const { report } = createCopyrightReport();
  const reportsDir = join(process.cwd(), "harness", "reports");
  mkdirSync(reportsDir, { recursive: true });

  const date = getReportDate();
  const reportPath = join(reportsDir, `${date}-copyright-summary.txt`);
  const latestPath = join(reportsDir, "latest-copyright-summary.txt");

  writeFileSync(reportPath, report, "utf8");
  writeFileSync(latestPath, report, "utf8");

  console.log(report);
  console.log("");
  console.log(`Saved report: ${reportPath}`);
}

main();
