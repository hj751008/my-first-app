import { fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { basicGeometryContent } from "../../lib/content/basicGeometry.ts";
import { coordinatePlaneContent } from "../../lib/content/coordinatePlane.ts";
import { dataInterpretationContent } from "../../lib/content/dataInterpretation.ts";
import { integersRationalContent } from "../../lib/content/integersRational.ts";
import { literalExpressionsContent } from "../../lib/content/literalExpressions.ts";
import { planeFiguresContent } from "../../lib/content/planeFigures.ts";
import { primeFactorizationContent } from "../../lib/content/primeFactorization.ts";
import { solidFiguresContent } from "../../lib/content/solidFigures.ts";
import type { LearningUnitContent } from "../../lib/content/types.ts";

type Level = "easy" | "medium" | "hard";

type ContentTarget = {
  key: string;
  content: LearningUnitContent;
};

type Issue = {
  severity: "error" | "warning";
  message: string;
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

function getReportDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

function isNonEmptyText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function pushIssue(issues: Issue[], severity: Issue["severity"], message: string) {
  issues.push({ severity, message });
}

function validateContent(target: ContentTarget) {
  const issues: Issue[] = [];
  const { content, key } = target;

  if (!isNonEmptyText(content.overview.title)) {
    pushIssue(issues, "error", `${key}: overview.title is missing.`);
  }
  if (!isNonEmptyText(content.overview.subtitle)) {
    pushIssue(issues, "error", `${key}: overview.subtitle is missing.`);
  }
  if (!isNonEmptyText(content.overview.description)) {
    pushIssue(issues, "error", `${key}: overview.description is missing.`);
  }
  if (content.overview.checkpoints.length < 3) {
    pushIssue(issues, "error", `${key}: overview.checkpoints should contain at least 3 items.`);
  }

  if (content.misconceptions.length < 3) {
    pushIssue(issues, "error", `${key}: misconceptions should contain at least 3 items.`);
  }

  content.misconceptions.forEach((item, index) => {
    if (!isNonEmptyText(item)) {
      pushIssue(issues, "error", `${key}: misconceptions[${index}] is empty.`);
    }
  });

  if (content.hintCards.length < 3) {
    pushIssue(issues, "error", `${key}: hintCards should contain at least 3 items.`);
  }

  content.hintCards.forEach((card, index) => {
    if (!isNonEmptyText(card.title)) {
      pushIssue(issues, "error", `${key}: hintCards[${index}].title is empty.`);
    }
    if (!isNonEmptyText(card.text)) {
      pushIssue(issues, "error", `${key}: hintCards[${index}].text is empty.`);
    }
  });

  if (content.generatedProblems.length < 3) {
    pushIssue(issues, "error", `${key}: generatedProblems should contain at least 3 items.`);
  }

  const ids = new Set<string>();
  const prompts = new Set<string>();
  const levelSet = new Set<Level>();

  content.generatedProblems.forEach((problem, index) => {
    if (!isNonEmptyText(problem.id)) {
      pushIssue(issues, "error", `${key}: generatedProblems[${index}].id is empty.`);
    } else if (ids.has(problem.id)) {
      pushIssue(issues, "error", `${key}: generatedProblems has a duplicate id "${problem.id}".`);
    } else {
      ids.add(problem.id);
    }

    if (!isNonEmptyText(problem.prompt)) {
      pushIssue(issues, "error", `${key}: generatedProblems[${index}].prompt is empty.`);
    } else if (prompts.has(problem.prompt)) {
      pushIssue(issues, "warning", `${key}: generatedProblems has a duplicate prompt at index ${index}.`);
    } else {
      prompts.add(problem.prompt);
    }

    if (!isNonEmptyText(problem.answer)) {
      pushIssue(issues, "error", `${key}: generatedProblems[${index}].answer is empty.`);
    }
    if (!isNonEmptyText(problem.firstHint)) {
      pushIssue(issues, "error", `${key}: generatedProblems[${index}].firstHint is empty.`);
    }
    if (!isNonEmptyText(problem.secondHint)) {
      pushIssue(issues, "error", `${key}: generatedProblems[${index}].secondHint is empty.`);
    }

    if (!["easy", "medium", "hard"].includes(problem.level)) {
      pushIssue(issues, "error", `${key}: generatedProblems[${index}] has invalid level "${problem.level}".`);
    } else {
      levelSet.add(problem.level);
    }
  });

  if (!levelSet.has("easy")) {
    pushIssue(issues, "warning", `${key}: generatedProblems does not include an easy problem.`);
  }
  if (!levelSet.has("medium")) {
    pushIssue(issues, "warning", `${key}: generatedProblems does not include a medium problem.`);
  }
  if (!levelSet.has("hard")) {
    pushIssue(issues, "warning", `${key}: generatedProblems does not include a hard problem.`);
  }

  if (content.diagnosticQuiz.length < 3) {
    pushIssue(issues, "error", `${key}: diagnosticQuiz should contain at least 3 items.`);
  }

  const quizIds = new Set<number>();

  content.diagnosticQuiz.forEach((question, index) => {
    if (quizIds.has(question.id)) {
      pushIssue(issues, "error", `${key}: diagnosticQuiz has a duplicate id "${question.id}".`);
    } else {
      quizIds.add(question.id);
    }

    if (!isNonEmptyText(question.prompt)) {
      pushIssue(issues, "error", `${key}: diagnosticQuiz[${index}].prompt is empty.`);
    }
    if (question.options.length < 3) {
      pushIssue(issues, "error", `${key}: diagnosticQuiz[${index}] should have at least 3 options.`);
    }
    if (!question.options.every(isNonEmptyText)) {
      pushIssue(issues, "error", `${key}: diagnosticQuiz[${index}] contains an empty option.`);
    }
    if (!question.options.includes(question.answer)) {
      pushIssue(issues, "warning", `${key}: diagnosticQuiz[${index}] answer is not included in options.`);
    }
    if (!isNonEmptyText(question.explanation)) {
      pushIssue(issues, "error", `${key}: diagnosticQuiz[${index}].explanation is empty.`);
    }
  });

  return issues;
}

export function createContentReport() {
  const lines: string[] = ["[content harness]"];
  let errorCount = 0;
  let warningCount = 0;

  contentTargets.forEach((target) => {
    const issues = validateContent(target);
    const errors = issues.filter((issue) => issue.severity === "error");
    const warnings = issues.filter((issue) => issue.severity === "warning");

    errorCount += errors.length;
    warningCount += warnings.length;

    if (issues.length === 0) {
      lines.push(`- ${target.key}: pass`);
      return;
    }

    const status = errors.length > 0 ? "fail" : "warning";
    lines.push(`- ${target.key}: ${status}`);

    issues.forEach((issue) => {
      lines.push(`  - [${issue.severity}] ${issue.message}`);
    });
  });

  lines.push("");
  lines.push(`[summary] errors=${errorCount}, warnings=${warningCount}`);

  return {
    report: lines.join("\n"),
    errorCount,
    warningCount,
  };
}

function main() {
  const { report, errorCount, warningCount } = createContentReport();
  const reportsDir = join(process.cwd(), "harness", "reports");
  mkdirSync(reportsDir, { recursive: true });

  const date = getReportDate();
  const reportPath = join(reportsDir, `${date}-content-summary.txt`);
  const latestPath = join(reportsDir, "latest-content-summary.txt");

  writeFileSync(reportPath, report, "utf8");
  writeFileSync(latestPath, report, "utf8");

  console.log(report);
  console.log("");
  console.log(`Saved report: ${reportPath}`);

  if (errorCount > 0) {
    process.exitCode = 1;
    return;
  }

  if (warningCount > 0) {
    process.exitCode = 0;
  }
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && currentFilePath === process.argv[1]) {
  main();
}
