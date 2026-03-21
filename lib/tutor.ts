import { basicGeometryContent } from "./content/basicGeometry.ts";
import { coordinatePlaneContent } from "./content/coordinatePlane.ts";
import { dataInterpretationContent } from "./content/dataInterpretation.ts";
import { literalExpressionsContent } from "./content/literalExpressions.ts";
import { integersRationalContent } from "./content/integersRational.ts";
import { planeFiguresContent } from "./content/planeFigures.ts";
import { primeFactorizationContent } from "./content/primeFactorization.ts";
import { solidFiguresContent } from "./content/solidFigures.ts";

export type TutorRole = "assistant" | "user";

export type TutorMessage = {
  role: TutorRole;
  content: string;
};

export type TutorAction =
  | "default"
  | "ask_question"
  | "hint_request"
  | "dont_know"
  | "re_explain"
  | "answer_check"
  | "emotion_support";

export type TutorState =
  | "diagnose"
  | "concept_intro"
  | "guided_practice"
  | "hint_1"
  | "hint_2"
  | "reflection"
  | "recover";

export type EmotionState =
  | "neutral"
  | "confused"
  | "frustrated"
  | "tired"
  | "engaged";

export type ConfidenceLevel = "low" | "medium" | "high";

export type LessonContext = {
  student_profile: {
    name: string;
    grade: string;
    weaknesses: string[];
    interests: string[];
    emotion_state: EmotionState;
  };
  learning_context: {
    phase: string;
    unit: string;
    subunit: string;
    goal_concept: string;
    problem_type: string;
  };
  session_state: {
    tutor_state: TutorState;
    hint_level: number;
    action: TutorAction;
    recent_misconception: string;
    confidence_level: ConfidenceLevel;
  };
  conversation_context: {
    student_last_message: string;
    student_attempt_summary: string;
    tutor_last_goal: string;
  };
  content_support: {
    misconceptions: string[];
    hint_cards: { title: string; text: string }[];
    generated_problem_prompts: string[];
  };
  response_contract: {
    max_sentences: number;
    question_count: number;
    use_analogy_first: boolean;
    require_encouragement_first: boolean;
    require_next_step: boolean;
  };
};

export type StructuredTutorReply = {
  encouragement: string;
  explanation: string;
  question: string;
  state: TutorState;
  display: string;
};

export const SUJI_SYSTEM_PROMPT = `너는 중학교 2학년 학생 수지의 수학 코치형 튜터다.

수지는 중1 수학 기초가 불안정하고, 개념을 따로따로는 알아도 함께 연결해 쓰는 데 어려움을 느낀다.
너의 역할은 정답을 대신 말하는 사람이 아니라, 수지가 스스로 생각의 순서를 세우도록 돕는 것이다.

항상 아래 규칙을 지켜라.

[톤과 태도]
- 항상 친근한 반말을 사용한다.
- 부드럽고 차분한 말투를 유지한다.
- 학생이 틀리거나 막혀도 먼저 격려한다.
- 비교하거나 위축시키는 표현은 사용하지 않는다.

[설명 방식]
- 추상적인 수학 용어부터 시작하지 않는다.
- 먼저 웹툰, 글쓰기, 이동, 위치 같은 쉬운 비유나 감각으로 설명한다.
- lesson context 안의 content_support를 우선 참고해 현재 단원에 맞는 설명을 고른다.
- 한 번에 하나의 개념만 다룬다.
- 설명은 짧고 분명하게 유지한다.

[문제 대화 방식]
- 정답을 바로 주지 않는다.
- 먼저 무엇을 구해야 하는지 확인한다.
- 그 다음 연결 개념을 떠올리게 한다.
- 학생이 막히면 비유 기반 힌트를 준다.
- 그래도 막히면 첫 줄 또는 첫 단계만 제시한다.
- 마무리에서는 학생이 자기 말로 개념을 설명하게 돕는다.

[피드백 규칙]
- 정답 여부와 관계없이 방향이 맞으면 구체적으로 칭찬한다.
- 틀렸다고 단정하지 말고, 어디서 생각이 흔들렸는지 질문한다.
- 필요하면 더 쉬운 숫자나 더 쉬운 상황으로 낮춰서 다시 설명한다.

[운영 규칙]
- 질문은 가능하면 한 번에 하나만 한다.
- 응답은 2~5문장 안에서 유지한다.
- 마지막 문장은 다음 행동을 유도하는 문장으로 끝낸다.
- 학생이 "모르겠어"라고 하면 난이도를 한 단계 낮춘다.
- 학생이 "힌트 줘"라고 하면 현재 단계에서 한 단계만 더 도와준다.
- 학생이 "다시 설명해줘"라고 하면 다른 비유로 다시 설명한다.

[안전 규칙]
- "틀렸어", "이건 쉬운 건데", "왜 이것도 모르지?" 같은 표현은 절대 쓰지 않는다.
- 현재 단원과 무관한 이야기는 짧게 답하고 다시 학습 목표로 돌아온다.

[출력 규칙]
- 반드시 JSON 객체 하나만 출력한다.
- 키는 encouragement, explanation, question, state, display 다섯 개만 사용한다.
- encouragement는 짧은 격려 한 문장이다.
- explanation은 현재 단계 설명 1~2문장이다.
- question은 학생에게 던지는 한 문장 질문이다.
- state는 diagnose, concept_intro, guided_practice, hint_1, hint_2, reflection, recover 중 하나다.
- display는 encouragement, explanation, question을 자연스럽게 이어 붙인 사용자 표시용 문장이다.
- 마크다운 코드블록은 사용하지 않는다.`;

const LESSON_MAP = {
  "middle-1-prime-factorization": {
    phase: "phase_1_foundation_recovery",
    unit: primeFactorizationContent.overview.title,
    subunit: "소인수분해의 의미",
    goalConcept: "수를 가장 작은 소수들의 곱으로 보는 감각",
    problemType: "guided_practice",
    tutorGoal: "숫자를 기본 블록으로 쪼개는 관점을 자연스럽게 익히게 하기",
    misconceptions: [...primeFactorizationContent.misconceptions],
    hintCards: [...primeFactorizationContent.hintCards],
    generatedProblemPrompts: primeFactorizationContent.generatedProblems.map(
      (problem) => problem.prompt
    ),
  },
  "middle-1-integers-and-rational-numbers": {
    phase: "phase_1_foundation_recovery",
    unit: integersRationalContent.overview.title,
    subunit: "정수와 유리수의 위치와 계산",
    goalConcept: "수직선 위 위치와 이동으로 부호 계산을 이해하는 감각",
    problemType: "guided_practice",
    tutorGoal: "양수와 음수를 위치와 이동의 관점으로 연결해 이해시키기",
    misconceptions: [...integersRationalContent.misconceptions],
    hintCards: [...integersRationalContent.hintCards],
    generatedProblemPrompts: integersRationalContent.generatedProblems.map(
      (problem) => problem.prompt
    ),
  },
  "middle-1-literal-expressions": {
    phase: "phase_2_concept_connection",
    unit: literalExpressionsContent.overview.title,
    subunit: "문자를 써서 관계 나타내기",
    goalConcept: "아직 정해지지 않은 수를 문자로 두고 식을 읽는 감각",
    problemType: "guided_practice",
    tutorGoal: "문자를 빈자리 이름표처럼 받아들이고 문장을 식으로 옮기게 하기",
    misconceptions: [...literalExpressionsContent.misconceptions],
    hintCards: [...literalExpressionsContent.hintCards],
    generatedProblemPrompts: literalExpressionsContent.generatedProblems.map(
      (problem) => problem.prompt
    ),
  },
  "middle-1-coordinate-plane-and-graphs": {
    phase: "phase_2_concept_connection",
    unit: coordinatePlaneContent.overview.title,
    subunit: "좌표 읽기와 점의 위치",
    goalConcept: "점의 위치를 가로와 세로 이동으로 읽는 감각",
    problemType: "guided_practice",
    tutorGoal: "좌표를 지도처럼 읽고 x와 y의 순서를 안정적으로 구분하게 하기",
    misconceptions: [...coordinatePlaneContent.misconceptions],
    hintCards: [...coordinatePlaneContent.hintCards],
    generatedProblemPrompts: coordinatePlaneContent.generatedProblems.map(
      (problem) => problem.prompt
    ),
  },
  "middle-1-basic-geometry": {
    phase: "phase_3_visual_intuition",
    unit: basicGeometryContent.overview.title,
    subunit: "점, 선, 각의 기본 관계",
    goalConcept: "점과 선과 각의 차이를 모양과 방향으로 읽는 감각",
    problemType: "guided_practice",
    tutorGoal: "도형 용어를 외우는 대신 길, 끝, 방향의 감각으로 연결하게 하기",
    misconceptions: [...basicGeometryContent.misconceptions],
    hintCards: [...basicGeometryContent.hintCards],
    generatedProblemPrompts: basicGeometryContent.generatedProblems.map(
      (problem) => problem.prompt
    ),
  },
  "middle-1-plane-figures-properties": {
    phase: "phase_3_visual_intuition",
    unit: planeFiguresContent.overview.title,
    subunit: "삼각형과 사각형의 핵심 규칙",
    goalConcept: "도형의 성질을 변과 각의 규칙으로 읽는 감각",
    problemType: "guided_practice",
    tutorGoal: "도형 이름을 외우기보다 평행, 길이, 각의 관계를 규칙으로 연결하게 하기",
    misconceptions: [...planeFiguresContent.misconceptions],
    hintCards: [...planeFiguresContent.hintCards],
    generatedProblemPrompts: planeFiguresContent.generatedProblems.map(
      (problem) => problem.prompt
    ),
  },
  "middle-1-solid-figures-properties": {
    phase: "phase_3_visual_intuition",
    unit: solidFiguresContent.overview.title,
    subunit: "면, 모서리, 꼭짓점과 전개도 읽기",
    goalConcept: "입체도형의 구조를 생활 물건과 연결해서 읽는 감각",
    problemType: "guided_practice",
    tutorGoal:
      "입체도형 이름만 외우기보다 면, 모서리, 꼭짓점과 접히는 구조를 함께 떠올리게 하기",
    misconceptions: [...solidFiguresContent.misconceptions],
    hintCards: [...solidFiguresContent.hintCards],
    generatedProblemPrompts: solidFiguresContent.generatedProblems.map(
      (problem) => problem.prompt
    ),
  },
  "middle-1-data-interpretation": {
    phase: "phase_4_data_storytelling",
    unit: dataInterpretationContent.overview.title,
    subunit: "표와 그래프 읽기",
    goalConcept: "자료를 비교와 차이의 이야기로 읽는 감각",
    problemType: "guided_practice",
    tutorGoal:
      "숫자를 하나씩 읽는 데서 멈추지 않고, 가장 큰 값과 차이와 특징을 문장으로 연결하게 하기",
    misconceptions: [...dataInterpretationContent.misconceptions],
    hintCards: [...dataInterpretationContent.hintCards],
    generatedProblemPrompts: dataInterpretationContent.generatedProblems.map(
      (problem) => problem.prompt
    ),
  },
} satisfies Record<
  string,
  {
    phase: string;
    unit: string;
    subunit: string;
    goalConcept: string;
    problemType: string;
    tutorGoal: string;
    misconceptions: string[];
    hintCards: { title: string; text: string }[];
    generatedProblemPrompts: string[];
  }
>;

type LessonKey = keyof typeof LESSON_MAP;

function inferEmotionState(message: string): EmotionState {
  if (/모르겠|헷갈|어려워|막혔/i.test(message)) {
    return "confused";
  }
  if (/지쳤|짜증|포기|싫어/i.test(message)) {
    return "frustrated";
  }
  if (/알겠|재밌|이해됐/i.test(message)) {
    return "engaged";
  }
  return "neutral";
}

function inferConfidenceLevel(message: string): ConfidenceLevel {
  if (/모르겠|헷갈|어려워|틀린/i.test(message)) {
    return "low";
  }
  if (/아마|같아|해볼게/i.test(message)) {
    return "medium";
  }
  if (/알겠|확실|이해했/i.test(message)) {
    return "high";
  }
  return "medium";
}

function deriveTutorState(action: TutorAction, hintLevel: number): TutorState {
  if (action === "dont_know") {
    return "recover";
  }
  if (action === "re_explain") {
    return "concept_intro";
  }
  if (action === "hint_request") {
    return hintLevel >= 2 ? "hint_2" : "hint_1";
  }
  if (action === "answer_check") {
    return "reflection";
  }
  return "guided_practice";
}

function summarizeAttempt(message: string, action: TutorAction): string {
  if (action === "dont_know") {
    return "학생이 현재 문제의 시작점을 찾지 못하고 있음";
  }
  if (action === "hint_request") {
    return "학생이 개념 연결 또는 첫 단계 힌트를 요청함";
  }
  if (action === "re_explain") {
    return "학생이 같은 개념을 다른 비유로 다시 설명해 주길 원함";
  }
  return message ? `학생 최근 응답: ${message}` : "학생 최근 응답이 아직 충분하지 않음";
}

function inferMisconception(message: string, misconceptions: string[]) {
  const normalized = message.replace(/\s+/g, "").toLowerCase();

  if (normalized.includes("절댓값") || normalized.includes("절대값")) {
    return misconceptions[3] ?? "";
  }

  if (
    normalized.includes("-3-2") ||
    normalized.includes("-4+6") ||
    normalized.includes("부호")
  ) {
    return misconceptions[1] ?? "";
  }

  if (
    normalized.includes("1은소수") ||
    normalized.includes("2x6") ||
    normalized.includes("3x4")
  ) {
    return misconceptions[0] ?? "";
  }

  return "";
}

export function buildLessonContext(params: {
  lesson?: string;
  messages: TutorMessage[];
  action?: TutorAction;
  hintLevel?: number;
}): LessonContext {
  const lesson =
    (params.lesson as LessonKey | undefined) ?? "middle-1-prime-factorization";
  const lessonMeta =
    LESSON_MAP[lesson] ?? LESSON_MAP["middle-1-prime-factorization"];
  const action = params.action ?? "default";
  const hintLevel = Math.max(0, Math.min(params.hintLevel ?? 0, 2));
  const lastUserMessage =
    [...params.messages].reverse().find((message) => message.role === "user")?.content ?? "";

  return {
    student_profile: {
      name: "수지",
      grade: "middle_school_2",
      weaknesses: [
        "concept_connection",
        "problem_interpretation",
        "strategy_planning",
      ],
      interests: ["webtoon", "writing"],
      emotion_state: inferEmotionState(lastUserMessage),
    },
    learning_context: {
      phase: lessonMeta.phase,
      unit: lessonMeta.unit,
      subunit: lessonMeta.subunit,
      goal_concept: lessonMeta.goalConcept,
      problem_type: lessonMeta.problemType,
    },
    session_state: {
      tutor_state: deriveTutorState(action, hintLevel),
      hint_level: hintLevel,
      action,
      recent_misconception: inferMisconception(
        lastUserMessage,
        lessonMeta.misconceptions
      ),
      confidence_level: inferConfidenceLevel(lastUserMessage),
    },
    conversation_context: {
      student_last_message: lastUserMessage,
      student_attempt_summary: summarizeAttempt(lastUserMessage, action),
      tutor_last_goal: lessonMeta.tutorGoal,
    },
    content_support: {
      misconceptions: lessonMeta.misconceptions,
      hint_cards: lessonMeta.hintCards,
      generated_problem_prompts: lessonMeta.generatedProblemPrompts,
    },
    response_contract: {
      max_sentences: 4,
      question_count: 1,
      use_analogy_first: true,
      require_encouragement_first: true,
      require_next_step: true,
    },
  };
}

export function formatLessonContext(context: LessonContext): string {
  return JSON.stringify(context, null, 2);
}

export function formatConversation(messages: TutorMessage[]): string {
  return messages
    .map((message) => `${message.role === "assistant" ? "튜터" : "수지"}: ${message.content}`)
    .join("\n");
}

export function parseStructuredTutorReply(raw: string | undefined): StructuredTutorReply | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StructuredTutorReply>;

    if (
      typeof parsed.encouragement !== "string" ||
      typeof parsed.explanation !== "string" ||
      typeof parsed.question !== "string" ||
      typeof parsed.state !== "string" ||
      typeof parsed.display !== "string"
    ) {
      return null;
    }

    return {
      encouragement: parsed.encouragement,
      explanation: parsed.explanation,
      question: parsed.question,
      state: parsed.state as TutorState,
      display: parsed.display,
    };
  } catch {
    return null;
  }
}

export function createFallbackReply(state: TutorState): StructuredTutorReply {
  const encouragement = "좋은 시도야.";
  const explanation =
    "지금은 정답보다 이 문제에서 우리가 먼저 찾아야 하는 게 무엇인지 잡는 게 더 중요해.";
  const question = "우리가 지금 구해야 하는 걸 네 말로 먼저 말해볼래?";

  return {
    encouragement,
    explanation,
    question,
    state,
    display: `${encouragement} ${explanation} ${question}`,
  };
}
