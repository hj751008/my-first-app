import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildLessonContext,
  createFallbackReply,
  formatConversation,
  formatLessonContext,
  parseStructuredTutorReply,
  type StructuredTutorReply,
  type TutorAction,
  type TutorState,
} from "../../lib/tutor.ts";

type Issue = {
  severity: "error" | "warning";
  message: string;
};

type Scenario = {
  label: string;
  lesson: string;
  action: TutorAction;
  hintLevel: number;
  studentMessage: string;
  expectedState: TutorState;
};

const scenarios: Scenario[] = [
  {
    label: "default-guided-practice",
    lesson: "middle-1-prime-factorization",
    action: "default",
    hintLevel: 0,
    studentMessage: "12는 3이랑 4로도 만들 수 있어.",
    expectedState: "guided_practice",
  },
  {
    label: "hint-level-1",
    lesson: "middle-1-integers-and-rational-numbers",
    action: "hint_request",
    hintLevel: 1,
    studentMessage: "힌트 줘",
    expectedState: "hint_1",
  },
  {
    label: "hint-level-2",
    lesson: "middle-1-coordinate-plane-and-graphs",
    action: "hint_request",
    hintLevel: 2,
    studentMessage: "한 단계만 더 힌트 줘",
    expectedState: "hint_2",
  },
  {
    label: "dont-know-recover",
    lesson: "middle-1-literal-expressions",
    action: "dont_know",
    hintLevel: 0,
    studentMessage: "모르겠어",
    expectedState: "recover",
  },
  {
    label: "re-explain-concept",
    lesson: "middle-1-basic-geometry",
    action: "re_explain",
    hintLevel: 0,
    studentMessage: "다른 비유로 다시 설명해줘",
    expectedState: "concept_intro",
  },
  {
    label: "answer-check-reflection",
    lesson: "middle-1-data-interpretation",
    action: "answer_check",
    hintLevel: 0,
    studentMessage: "표를 보고 가장 큰 값을 말하면 되는 것 같아.",
    expectedState: "reflection",
  },
];

function getReportDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date());
}

function isNonEmptyText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function countQuestionMarks(text: string) {
  return (text.match(/\?/g) ?? []).length;
}

function validateReplyContract(label: string, reply: StructuredTutorReply) {
  const issues: Issue[] = [];

  if (!isNonEmptyText(reply.encouragement)) {
    issues.push({ severity: "error", message: `${label}: encouragement is empty.` });
  }
  if (!isNonEmptyText(reply.explanation)) {
    issues.push({ severity: "error", message: `${label}: explanation is empty.` });
  }
  if (!isNonEmptyText(reply.question)) {
    issues.push({ severity: "error", message: `${label}: question is empty.` });
  }
  if (!isNonEmptyText(reply.display)) {
    issues.push({ severity: "error", message: `${label}: display is empty.` });
  }

  if (!reply.display.includes(reply.encouragement)) {
    issues.push({ severity: "warning", message: `${label}: display does not include encouragement.` });
  }
  if (!reply.display.includes(reply.explanation)) {
    issues.push({ severity: "warning", message: `${label}: display does not include explanation.` });
  }
  if (!reply.display.includes(reply.question)) {
    issues.push({ severity: "warning", message: `${label}: display does not include question.` });
  }

  if (countQuestionMarks(reply.question) > 1) {
    issues.push({ severity: "warning", message: `${label}: question contains more than one question mark.` });
  }

  return issues;
}

export function createTutorScenarioReport() {
  const lines: string[] = ["[tutor harness]"];
  let errorCount = 0;
  let warningCount = 0;

  scenarios.forEach((scenario) => {
    const context = buildLessonContext({
      lesson: scenario.lesson,
      action: scenario.action,
      hintLevel: scenario.hintLevel,
      messages: [{ role: "user", content: scenario.studentMessage }],
    });

    const issues: Issue[] = [];

    if (context.session_state.tutor_state !== scenario.expectedState) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: expected state ${scenario.expectedState} but got ${context.session_state.tutor_state}.`,
      });
    }

    if (context.conversation_context.student_last_message !== scenario.studentMessage) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: student_last_message was not preserved.`,
      });
    }

    if (context.response_contract.max_sentences > 4) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: max_sentences should stay at 4 or fewer.`,
      });
    }

    if (context.response_contract.question_count !== 1) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: question_count should stay at 1.`,
      });
    }

    if (!context.response_contract.require_encouragement_first) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: require_encouragement_first should remain enabled.`,
      });
    }

    if (context.content_support.hint_cards.length < 3) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: hint_cards should contain at least 3 items.`,
      });
    }

    if (context.content_support.generated_problem_prompts.length < 3) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: generated_problem_prompts should contain at least 3 items.`,
      });
    }

    const fallback = createFallbackReply(context.session_state.tutor_state);
    issues.push(...validateReplyContract(scenario.label, fallback));

    const parsedValid = parseStructuredTutorReply(JSON.stringify(fallback));
    if (!parsedValid) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: parseStructuredTutorReply should accept a valid structured reply.`,
      });
    }

    const parsedInvalid = parseStructuredTutorReply('{"encouragement":"ok"}');
    if (parsedInvalid) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: parseStructuredTutorReply should reject incomplete payloads.`,
      });
    }

    const conversation = formatConversation([
      { role: "user", content: scenario.studentMessage },
      { role: "assistant", content: fallback.display },
    ]);
    if (!isNonEmptyText(conversation)) {
      issues.push({
        severity: "error",
        message: `${scenario.label}: formatConversation returned empty output.`,
      });
    }

    const lessonContextText = formatLessonContext(context);
    if (!lessonContextText.includes('"student_last_message"')) {
      issues.push({
        severity: "warning",
        message: `${scenario.label}: formatted lesson context is missing student_last_message text.`,
      });
    }

    const errors = issues.filter((issue) => issue.severity === "error");
    const warnings = issues.filter((issue) => issue.severity === "warning");
    errorCount += errors.length;
    warningCount += warnings.length;

    if (issues.length === 0) {
      lines.push(`- ${scenario.label}: pass`);
      return;
    }

    lines.push(`- ${scenario.label}: ${errors.length > 0 ? "fail" : "warning"}`);
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
  const { report, errorCount } = createTutorScenarioReport();
  const reportsDir = join(process.cwd(), "harness", "reports");
  mkdirSync(reportsDir, { recursive: true });

  const date = getReportDate();
  const reportPath = join(reportsDir, `${date}-tutor-summary.txt`);
  const latestPath = join(reportsDir, "latest-tutor-summary.txt");

  writeFileSync(reportPath, report, "utf8");
  writeFileSync(latestPath, report, "utf8");

  console.log(report);
  console.log("");
  console.log(`Saved report: ${reportPath}`);

  if (errorCount > 0) {
    process.exitCode = 1;
  }
}

main();
