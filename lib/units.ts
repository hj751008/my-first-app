import { basicGeometryContent } from "@/lib/content/basicGeometry";
import { coordinatePlaneContent } from "@/lib/content/coordinatePlane";
import { integersRationalContent } from "@/lib/content/integersRational";
import { literalExpressionsContent } from "@/lib/content/literalExpressions";
import { planeFiguresContent } from "@/lib/content/planeFigures";
import { primeFactorizationContent } from "@/lib/content/primeFactorization";
import { solidFiguresContent } from "@/lib/content/solidFigures";
import type { LearningUnitContent } from "@/lib/content/types";
import type { StructuredTutorReply, TutorAction, TutorState } from "@/lib/tutor";

type TutorStateUiConfig = {
  badge: string;
  title: string;
  tone: string;
  tips: string[];
};

type TutorStateUiMap = Record<TutorState, TutorStateUiConfig>;

export type UnitTheme = {
  pageGradient: string;
  border: string;
  lightBg: string;
  accentText: string;
  chipBg: string;
  hoverBorder: string;
};

export type UnitDefinition = {
  lessonKey: string;
  unitKey: string;
  unitNumber: number;
  basePath: string;
  content: LearningUnitContent;
  theme: UnitTheme;
  quizTitle: string;
  quizDescription: string;
  resultDescription: string;
  tutorTitle: string;
  tutorLoadingMessage: string;
  textareaPlaceholder: string;
  buttons: {
    dontKnow: string;
    hint: string;
    reExplain: string;
  };
  initialReply: StructuredTutorReply;
  stateUi: TutorStateUiMap;
  summaryPattern: RegExp;
};

const createTheme = (
  pageGradient: string,
  border: string,
  lightBg: string,
  accentText: string,
  chipBg: string,
  hoverBorder: string
): UnitTheme => ({
  pageGradient,
  border,
  lightBg,
  accentText,
  chipBg,
  hoverBorder,
});

export const unitDefinitions: Record<string, UnitDefinition> = {
  "middle-1-prime-factorization": {
    lessonKey: "middle-1-prime-factorization",
    unitKey: "/middle-1/prime-factorization",
    unitNumber: 1,
    basePath: "/middle-1/prime-factorization",
    content: primeFactorizationContent,
    theme: createTheme(
      "bg-[linear-gradient(180deg,#fffdf7_0%,#fff7e8_45%,#f8fbff_100%)]",
      "border-amber-200",
      "bg-amber-50",
      "text-amber-700",
      "bg-amber-50",
      "hover:border-amber-400"
    ),
    quizTitle: "소인수분해 감각 체크",
    quizDescription:
      "지금 어디까지 알고 있는지 가볍게 확인해 보자. 여기 문항은 앱용으로 새로 만든 진단 문항이야.",
    resultDescription:
      "지금 점수를 출발점으로 삼고 AI 튜터와 대화하면, 숫자를 기본 블록으로 쪼개는 감각을 천천히 다시 연결할 수 있어.",
    tutorTitle: "소인수분해 수업 시작",
    tutorLoadingMessage:
      "소인수분해 콘텐츠를 바탕으로 지금 단계에 맞는 힌트를 고르는 중이야...",
    textareaPlaceholder:
      "예: 12는 3이랑 4를 곱해서도 만들고, 2랑 6을 곱해서도 만들 수 있어.",
    buttons: {
      dontKnow: "모르겠어. 더 쉬운 비유로 다시 설명해줘.",
      hint: "힌트를 한 단계만 더 줘.",
      reExplain: "같은 뜻을 다른 비유로 다시 설명해줘.",
    },
    initialReply: {
      encouragement: "안녕 수지.",
      explanation:
        "오늘은 숫자를 가장 작은 기본 블록까지 쪼개 보는 감각을 같이 잡아 보자.",
      question: "12를 보면 어떤 수끼리 곱해서 만들 수 있는지 먼저 말해볼래?",
      state: "diagnose",
      display:
        "안녕 수지. 오늘은 숫자를 가장 작은 기본 블록까지 쪼개 보는 감각을 같이 잡아 보자. 12를 보면 어떤 수끼리 곱해서 만들 수 있는지 먼저 말해볼래?",
    },
    stateUi: {
      diagnose: {
        badge: "문제 이해 단계",
        title: "무엇을 찾아야 하는지 먼저 잡는 중",
        tone: "bg-sky-100 text-sky-700",
        tips: [
          "문제에서 구해야 하는 말을 먼저 찾기",
          "숫자를 바로 계산하지 말고 어떤 관계인지 보기",
          "문제를 네 말로 짧게 바꿔 말해 보기",
        ],
      },
      concept_intro: {
        badge: "개념 연결 단계",
        title: "비유로 개념 감각을 만드는 중",
        tone: "bg-violet-100 text-violet-700",
        tips: [
          "숫자를 기본 블록으로 본다는 느낌 만들기",
          "소인수분해를 쪼개기 이야기로 떠올리기",
          "용어보다 그림과 감각을 먼저 잡기",
        ],
      },
      guided_practice: {
        badge: "직접 시도 단계",
        title: "첫 단계를 스스로 시작하는 중",
        tone: "bg-emerald-100 text-emerald-700",
        tips: [
          "정답보다 시작 방향을 먼저 잡기",
          "어떤 두 수의 곱으로 볼지 떠올리기",
          "끝까지 쪼개야 하는지 중간 점검하기",
        ],
      },
      hint_1: {
        badge: "힌트 1단계",
        title: "개념 힌트로 다시 연결하는 중",
        tone: "bg-amber-100 text-amber-700",
        tips: [
          "숫자를 쪼개는 첫 관점부터 다시 보기",
          "작은 수의 곱으로 바꾸는 연습하기",
          "한 번에 끝내지 말고 차례로 나누기",
        ],
      },
      hint_2: {
        badge: "힌트 2단계",
        title: "첫 줄을 같이 여는 중",
        tone: "bg-orange-100 text-orange-700",
        tips: [
          "첫 분해만 같이 잡아도 흐름이 보이기 시작해",
          "중간 결과가 소수인지 확인해 보기",
          "다음 줄은 스스로 이어 볼 준비하기",
        ],
      },
      reflection: {
        badge: "정리 단계",
        title: "배운 개념을 네 말로 묶는 중",
        tone: "bg-fuchsia-100 text-fuchsia-700",
        tips: [
          "소인수분해가 무엇인지 한 문장으로 말해 보기",
          "왜 끝까지 쪼개야 하는지 설명해 보기",
          "다음에도 쓸 기준 하나 적어 보기",
        ],
      },
      recover: {
        badge: "회복 단계",
        title: "더 쉬운 숫자로 다시 올라오는 중",
        tone: "bg-rose-100 text-rose-700",
        tips: [
          "작은 수로 먼저 감각을 다시 잡기",
          "막히는 건 당연하니까 시작점을 다시 찾기",
          "지금은 계산보다 흐름을 보는 단계야",
        ],
      },
    },
    summaryPattern: /한 문장|정리|소인수분해|내 말로|배운 것/i,
  },
  "middle-1-integers-and-rational-numbers": {
    lessonKey: "middle-1-integers-and-rational-numbers",
    unitKey: "/middle-1/integers-and-rational-numbers",
    unitNumber: 2,
    basePath: "/middle-1/integers-and-rational-numbers",
    content: integersRationalContent,
    theme: createTheme(
      "bg-[linear-gradient(180deg,#fffdf7_0%,#eef7ff_45%,#f8fbff_100%)]",
      "border-sky-200",
      "bg-sky-50",
      "text-sky-700",
      "bg-sky-50",
      "hover:border-sky-400"
    ),
    quizTitle: "정수와 유리수 감각 체크",
    quizDescription:
      "수직선, 부호, 절댓값 감각이 어느 정도 잡혀 있는지 가볍게 확인해 보자. 이 문항도 앱용으로 새로 만든 진단 문항이야.",
    resultDescription:
      "지금 점수를 출발점으로 삼고 AI 튜터와 같이 해 보면, 헷갈리던 부호 계산을 위치와 이동의 감각으로 다시 연결할 수 있어.",
    tutorTitle: "정수와 유리수 수업 시작",
    tutorLoadingMessage:
      "정수와 유리수 콘텐츠를 바탕으로 지금 단계에 맞는 힌트를 고르는 중이야...",
    textareaPlaceholder: "예: -3에서 5를 더하면 오른쪽으로 가는 것 같아.",
    buttons: {
      dontKnow: "모르겠어. 더 쉬운 숫자로 다시 설명해줘.",
      hint: "힌트를 한 단계만 더 줘.",
      reExplain: "같은 뜻을 다른 이동 비유로 다시 설명해줘.",
    },
    initialReply: {
      encouragement: "안녕 수지.",
      explanation: "오늘은 수직선 감각으로 정수와 유리수를 같이 정리해 보자.",
      question: "0을 기준으로 봤을 때 -2와 3은 어느 쪽에 있는지 먼저 말해볼래?",
      state: "diagnose",
      display:
        "안녕 수지. 오늘은 수직선 감각으로 정수와 유리수를 같이 정리해 보자. 0을 기준으로 봤을 때 -2와 3은 어느 쪽에 있는지 먼저 말해볼래?",
    },
    stateUi: {
      diagnose: {
        badge: "문제 이해 단계",
        title: "무엇을 구하거나 비교하는지 먼저 잡는 중",
        tone: "bg-sky-100 text-sky-700",
        tips: [
          "수직선에서 어디를 보는지 먼저 떠올리기",
          "계산 전에 더 큰 수와 더 작은 수를 구분하기",
          "이동 이야기로 바꿔 생각해 보기",
        ],
      },
      concept_intro: {
        badge: "개념 연결 단계",
        title: "수직선과 이동 비유로 감각을 만드는 중",
        tone: "bg-violet-100 text-violet-700",
        tips: [
          "양수는 오른쪽, 음수는 왼쪽 감각부터 잡기",
          "더하기와 빼기를 이동으로 생각하기",
          "절댓값은 거리라는 뜻으로 보기",
        ],
      },
      guided_practice: {
        badge: "직접 시도 단계",
        title: "수지가 첫 단계를 스스로 시작하는 중",
        tone: "bg-emerald-100 text-emerald-700",
        tips: [
          "시작 위치를 먼저 정하기",
          "어느 쪽으로 몇 칸 움직이는지 말해 보기",
          "식과 수직선을 함께 떠올리기",
        ],
      },
      hint_1: {
        badge: "힌트 1단계",
        title: "개념 힌트로 다시 연결하는 중",
        tone: "bg-amber-100 text-amber-700",
        tips: [
          "부호보다 위치를 먼저 보기",
          "0 기준으로 왼쪽인지 오른쪽인지 보기",
          "이동을 말로 따라가 보기",
        ],
      },
      hint_2: {
        badge: "힌트 2단계",
        title: "첫 줄을 같이 여는 중",
        tone: "bg-orange-100 text-orange-700",
        tips: [
          "시작 위치만 정확히 잡아도 좋아",
          "이동 방향부터 적어 보기",
          "전체 답보다 첫 흐름을 따라가기",
        ],
      },
      reflection: {
        badge: "정리 단계",
        title: "배운 개념을 네 말로 묶는 중",
        tone: "bg-fuchsia-100 text-fuchsia-700",
        tips: [
          "왜 그 수가 더 큰지 설명해 보기",
          "절댓값이 거리라는 말을 바꿔 말해 보기",
          "다음에도 쓸 규칙 하나 떠올리기",
        ],
      },
      recover: {
        badge: "회복 단계",
        title: "더 쉬운 숫자와 비유로 다시 올라오는 중",
        tone: "bg-rose-100 text-rose-700",
        tips: [
          "숫자를 더 쉽게 바꿔도 괜찮아",
          "이동 이야기로 다시 보면 편해져",
          "맞히기보다 흐름을 다시 잡는 단계야",
        ],
      },
    },
    summaryPattern: /한 문장|정리|절댓값|수직선|내 말로|배운 것/i,
  },
  "middle-1-literal-expressions": {
    lessonKey: "middle-1-literal-expressions",
    unitKey: "/middle-1/literal-expressions",
    unitNumber: 3,
    basePath: "/middle-1/literal-expressions",
    content: literalExpressionsContent,
    theme: createTheme(
      "bg-[linear-gradient(180deg,#fffdf7_0%,#f4efff_45%,#f8fbff_100%)]",
      "border-violet-200",
      "bg-violet-50",
      "text-violet-700",
      "bg-violet-50",
      "hover:border-violet-400"
    ),
    quizTitle: "문자와 식 감각 체크",
    quizDescription:
      "문자를 이름표처럼 받아들이는 감각과 식 읽기 흐름이 어느 정도 잡혀 있는지 가볍게 확인해 보자.",
    resultDescription:
      "지금 점수를 출발점으로 삼고 AI 튜터와 같이 해 보면, 문자와 식을 숫자 이야기와 연결하는 감각을 더 자연스럽게 만들 수 있어.",
    tutorTitle: "문자와 식 수업 시작",
    tutorLoadingMessage:
      "문자와 식 콘텐츠를 바탕으로 지금 단계에 맞는 힌트를 고르는 중이야...",
    textareaPlaceholder: "예: 어떤 수를 x로 두고 4를 더하면 x + 4 같아.",
    buttons: {
      dontKnow: "모르겠어. 더 짧은 문장부터 다시 설명해줘.",
      hint: "힌트를 한 단계만 더 줘.",
      reExplain: "같은 뜻을 더 쉬운 비유로 다시 설명해줘.",
    },
    initialReply: {
      encouragement: "안녕 수지.",
      explanation: "오늘은 문자와 식을 숫자 이야기처럼 읽는 연습을 같이 해 보자.",
      question: "'어떤 수'를 만나면 먼저 무엇을 문자로 두면 좋을지 말해볼래?",
      state: "diagnose",
      display:
        "안녕 수지. 오늘은 문자와 식을 숫자 이야기처럼 읽는 연습을 같이 해 보자. '어떤 수'를 만나면 먼저 무엇을 문자로 두면 좋을지 말해볼래?",
    },
    stateUi: {
      diagnose: {
        badge: "문제 이해 단계",
        title: "무엇을 문자로 둘지 먼저 잡는 중",
        tone: "bg-sky-100 text-sky-700",
        tips: [
          "문장에서 아직 정해지지 않은 수를 찾기",
          "바로 계산하지 말고 문자를 먼저 정하기",
          "문장을 짧은 식으로 바꿀 준비하기",
        ],
      },
      concept_intro: {
        badge: "개념 연결 단계",
        title: "문자를 이름표처럼 받아들이는 중",
        tone: "bg-violet-100 text-violet-700",
        tips: [
          "문자는 아직 정해지지 않은 수의 이름표야",
          "2x를 두 묶음의 x로 떠올리기",
          "문장과 식을 서로 번역해 보기",
        ],
      },
      guided_practice: {
        badge: "직접 시도 단계",
        title: "문장을 식으로 옮기는 첫 시도를 하는 중",
        tone: "bg-emerald-100 text-emerald-700",
        tips: [
          "어떤 수를 먼저 x로 두기",
          "더한 것인지 곱한 것인지 붙이기",
          "완성한 식을 다시 말로 읽기",
        ],
      },
      hint_1: {
        badge: "힌트 1단계",
        title: "문장 속 관계를 다시 읽는 중",
        tone: "bg-amber-100 text-amber-700",
        tips: [
          "'어떤 수'를 먼저 문자로 잡기",
          "'3 큰 수', '2배'를 나눠 읽기",
          "문장을 두 조각으로 나눠 식에 붙이기",
        ],
      },
      hint_2: {
        badge: "힌트 2단계",
        title: "첫 식을 같이 세워 보는 중",
        tone: "bg-orange-100 text-orange-700",
        tips: [
          "x를 먼저 두고 식을 붙여 보기",
          "2x는 x + x라는 뜻으로 보기",
          "전체 답보다 첫 식부터 정확히 쓰기",
        ],
      },
      reflection: {
        badge: "정리 단계",
        title: "문자와 식의 뜻을 네 말로 묶는 중",
        tone: "bg-fuchsia-100 text-fuchsia-700",
        tips: [
          "문자가 왜 필요한지 정리해 보기",
          "식을 다시 말로 읽어 보기",
          "다음에도 쓸 번역 규칙 하나 고르기",
        ],
      },
      recover: {
        badge: "회복 단계",
        title: "더 쉬운 문장으로 다시 들어오는 중",
        tone: "bg-rose-100 text-rose-700",
        tips: [
          "짧은 문장부터 식으로 바꿔 보기",
          "먼저 x를 정하면 나머지가 쉬워져",
          "지금은 뜻을 읽는 게 더 중요해",
        ],
      },
    },
    summaryPattern: /한 문장|정리|문자|식|내 말로|배운 것/i,
  },
  "middle-1-coordinate-plane-and-graphs": {
    lessonKey: "middle-1-coordinate-plane-and-graphs",
    unitKey: "/middle-1/coordinate-plane-and-graphs",
    unitNumber: 4,
    basePath: "/middle-1/coordinate-plane-and-graphs",
    content: coordinatePlaneContent,
    theme: createTheme(
      "bg-[linear-gradient(180deg,#fffdf7_0%,#ecfff6_45%,#f8fbff_100%)]",
      "border-emerald-200",
      "bg-emerald-50",
      "text-emerald-700",
      "bg-emerald-50",
      "hover:border-emerald-400"
    ),
    quizTitle: "좌표평면과 그래프 감각 체크",
    quizDescription:
      "좌표를 읽는 순서와 점의 위치 감각이 어느 정도 잡혀 있는지 가볍게 확인해 보자.",
    resultDescription:
      "지금 점수를 출발점으로 삼고 AI 튜터와 같이 해 보면, 좌표를 지도처럼 읽는 감각이 훨씬 자연스러워질 거야.",
    tutorTitle: "좌표평면과 그래프 수업 시작",
    tutorLoadingMessage:
      "좌표평면과 그래프 콘텐츠를 바탕으로 지금 단계에 맞는 힌트를 고르는 중이야...",
    textareaPlaceholder: "예: (2, 3)은 오른쪽으로 2칸, 위로 3칸 간 점 같아.",
    buttons: {
      dontKnow: "모르겠어. 더 쉬운 좌표부터 다시 설명해줘.",
      hint: "힌트를 한 단계만 더 줘.",
      reExplain: "같은 뜻을 지도 비유로 다시 설명해줘.",
    },
    initialReply: {
      encouragement: "안녕 수지.",
      explanation: "오늘은 좌표를 지도처럼 읽는 감각을 같이 잡아 보자.",
      question: "점 (2, 1)을 보면 원점에서 어떻게 움직이면 된다고 생각해?",
      state: "diagnose",
      display:
        "안녕 수지. 오늘은 좌표를 지도처럼 읽는 감각을 같이 잡아 보자. 점 (2, 1)을 보면 원점에서 어떻게 움직이면 된다고 생각해?",
    },
    stateUi: {
      diagnose: {
        badge: "문제 이해 단계",
        title: "점의 위치를 어떻게 읽는지 먼저 잡는 중",
        tone: "bg-sky-100 text-sky-700",
        tips: [
          "좌표가 위치 정보라는 점부터 떠올리기",
          "x와 y를 어떤 순서로 읽는지 확인하기",
          "원점에서의 이동으로 바꿔 생각하기",
        ],
      },
      concept_intro: {
        badge: "개념 연결 단계",
        title: "좌표를 지도와 이동으로 연결하는 중",
        tone: "bg-violet-100 text-violet-700",
        tips: [
          "좌표평면을 보물지도처럼 생각하기",
          "x는 가로, y는 세로라는 감각 붙이기",
          "점 하나를 위치 메모처럼 받아들이기",
        ],
      },
      guided_practice: {
        badge: "직접 시도 단계",
        title: "점의 위치를 말로 풀어내는 중",
        tone: "bg-emerald-100 text-emerald-700",
        tips: [
          "먼저 가로 이동을 말해 보기",
          "그다음 세로 이동을 말해 보기",
          "두 점은 첫 번째 숫자와 두 번째 숫자를 나눠 비교하기",
        ],
      },
      hint_1: {
        badge: "힌트 1단계",
        title: "좌표 읽기 순서를 다시 잡는 중",
        tone: "bg-amber-100 text-amber-700",
        tips: [
          "항상 x 먼저, y 나중을 기억하기",
          "음수면 왼쪽이나 아래쪽을 떠올리기",
          "점을 계산 결과가 아니라 위치라고 보기",
        ],
      },
      hint_2: {
        badge: "힌트 2단계",
        title: "첫 이동을 같이 열어 보는 중",
        tone: "bg-orange-100 text-orange-700",
        tips: [
          "첫 번째 숫자만 먼저 읽어 보기",
          "그다음 두 번째 숫자를 이어 붙이기",
          "같은 x좌표, 같은 y좌표를 따로 비교하기",
        ],
      },
      reflection: {
        badge: "정리 단계",
        title: "좌표의 뜻을 네 말로 묶는 중",
        tone: "bg-fuchsia-100 text-fuchsia-700",
        tips: [
          "좌표를 어떻게 읽는지 한 문장으로 정리하기",
          "x와 y의 역할 차이를 말해 보기",
          "점을 지도처럼 보는 이유를 설명해 보기",
        ],
      },
      recover: {
        badge: "회복 단계",
        title: "더 쉬운 점부터 다시 올라오는 중",
        tone: "bg-rose-100 text-rose-700",
        tips: [
          "양수 좌표부터 다시 잡아도 괜찮아",
          "한 번에 하나의 점만 읽어 보기",
          "지금은 위치 감각을 만드는 단계야",
        ],
      },
    },
    summaryPattern: /한 문장|정리|좌표|그래프|x축|y축|내 말로|배운 것/i,
  },
  "middle-1-basic-geometry": {
    lessonKey: "middle-1-basic-geometry",
    unitKey: "/middle-1/basic-geometry",
    unitNumber: 5,
    basePath: "/middle-1/basic-geometry",
    content: basicGeometryContent,
    theme: createTheme(
      "bg-[linear-gradient(180deg,#fffdf7_0%,#fff4ef_45%,#f8fbff_100%)]",
      "border-rose-200",
      "bg-rose-50",
      "text-rose-700",
      "bg-rose-50",
      "hover:border-rose-400"
    ),
    quizTitle: "기본 도형 감각 체크",
    quizDescription:
      "점, 선, 각의 차이와 관계를 얼마나 잡고 있는지 가볍게 확인해 보자.",
    resultDescription:
      "지금 점수를 출발점으로 삼고 AI 튜터와 같이 해 보면, 도형 용어를 모양과 방향의 감각으로 더 자연스럽게 연결할 수 있어.",
    tutorTitle: "기본 도형 수업 시작",
    tutorLoadingMessage:
      "기본 도형 콘텐츠를 바탕으로 지금 단계에 맞는 힌트를 고르는 중이야...",
    textareaPlaceholder: "예: 반직선은 시작점이 있고 한쪽으로만 계속 가는 선 같아.",
    buttons: {
      dontKnow: "모르겠어. 더 쉬운 모양 비유로 다시 설명해줘.",
      hint: "힌트를 한 단계만 더 줘.",
      reExplain: "같은 뜻을 길과 방향 비유로 다시 설명해줘.",
    },
    initialReply: {
      encouragement: "안녕 수지.",
      explanation: "오늘은 점, 선, 각을 길과 방향의 느낌으로 같이 잡아 보자.",
      question: "양쪽 끝이 있는 선과 한쪽으로만 계속 가는 선은 어떻게 다를까?",
      state: "diagnose",
      display:
        "안녕 수지. 오늘은 점, 선, 각을 길과 방향의 느낌으로 같이 잡아 보자. 양쪽 끝이 있는 선과 한쪽으로만 계속 가는 선은 어떻게 다를까?",
    },
    stateUi: {
      diagnose: {
        badge: "문제 이해 단계",
        title: "점, 선, 각 중 무엇을 보는지 먼저 잡는 중",
        tone: "bg-sky-100 text-sky-700",
        tips: [
          "이름보다 모양이 어떤지 먼저 보기",
          "끝이 있는지, 방향이 있는지 떠올리기",
          "길과 모서리의 차이로 바꿔 생각하기",
        ],
      },
      concept_intro: {
        badge: "개념 연결 단계",
        title: "도형 용어를 길과 방향으로 연결하는 중",
        tone: "bg-violet-100 text-violet-700",
        tips: [
          "점은 위치 표시라고 생각하기",
          "선은 길, 각은 벌어진 방향으로 보기",
          "반직선을 손전등 빛처럼 떠올리기",
        ],
      },
      guided_practice: {
        badge: "직접 시도 단계",
        title: "도형의 차이를 말로 풀어내는 중",
        tone: "bg-emerald-100 text-emerald-700",
        tips: [
          "끝의 개수를 먼저 말해 보기",
          "어디서 만나는지 찾아 보기",
          "각을 방향의 벌어짐으로 설명해 보기",
        ],
      },
      hint_1: {
        badge: "힌트 1단계",
        title: "도형의 핵심 특징을 다시 보는 중",
        tone: "bg-amber-100 text-amber-700",
        tips: [
          "선분은 양쪽 끝이 있다는 점부터 보기",
          "반직선은 시작점이 있다는 점부터 보기",
          "각은 길이가 아니라 벌어짐이라는 점 보기",
        ],
      },
      hint_2: {
        badge: "힌트 2단계",
        title: "첫 특징을 같이 잡아 보는 중",
        tone: "bg-orange-100 text-orange-700",
        tips: [
          "가장 먼저 구분할 특징 하나만 집기",
          "끝이 있는지 없는지를 먼저 말하기",
          "만나는 지점과 방향을 따로 보기",
        ],
      },
      reflection: {
        badge: "정리 단계",
        title: "도형 용어의 뜻을 네 말로 묶는 중",
        tone: "bg-fuchsia-100 text-fuchsia-700",
        tips: [
          "선분, 직선, 반직선 차이를 정리하기",
          "각이 무엇인지 한 문장으로 말하기",
          "꼭짓점과 변의 관계를 설명해 보기",
        ],
      },
      recover: {
        badge: "회복 단계",
        title: "더 쉬운 모양부터 다시 올라오는 중",
        tone: "bg-rose-100 text-rose-700",
        tips: [
          "한 번에 하나의 도형만 보기",
          "길과 끝만 먼저 구분해도 괜찮아",
          "지금은 용어보다 감각을 잡는 단계야",
        ],
      },
    },
    summaryPattern: /한 문장|정리|선분|직선|반직선|각|꼭짓점|변|내 말로|배운 것/i,
  },
  "middle-1-plane-figures-properties": {
    lessonKey: "middle-1-plane-figures-properties",
    unitKey: "/middle-1/plane-figures-properties",
    unitNumber: 6,
    basePath: "/middle-1/plane-figures-properties",
    content: planeFiguresContent,
    theme: createTheme(
      "bg-[linear-gradient(180deg,#fffdf7_0%,#eef9ff_45%,#f8fbff_100%)]",
      "border-cyan-200",
      "bg-cyan-50",
      "text-cyan-700",
      "bg-cyan-50",
      "hover:border-cyan-400"
    ),
    quizTitle: "평면도형의 성질 감각 체크",
    quizDescription:
      "삼각형과 사각형의 규칙을 얼마나 연결해서 보고 있는지 가볍게 확인해 보자.",
    resultDescription:
      "지금 점수를 출발점으로 삼고 AI 튜터와 같이 해 보면, 도형의 이름과 성질을 더 자연스럽게 연결할 수 있어.",
    tutorTitle: "평면도형의 성질 수업 시작",
    tutorLoadingMessage:
      "평면도형의 성질 콘텐츠를 바탕으로 지금 단계에 맞는 힌트를 고르는 중이야...",
    textareaPlaceholder: "예: 정사각형은 네 각이 모두 직각이라서 직사각형으로도 볼 수 있을 것 같아.",
    buttons: {
      dontKnow: "모르겠어. 더 쉬운 모양 예시로 다시 설명해줘.",
      hint: "힌트를 한 단계만 더 줘.",
      reExplain: "같은 뜻을 균형이나 대칭 비유로 다시 설명해줘.",
    },
    initialReply: {
      encouragement: "안녕 수지.",
      explanation: "오늘은 삼각형과 사각형의 규칙을 모양과 균형의 느낌으로 같이 잡아 보자.",
      question: "정사각형을 보면 어떤 성질이 먼저 떠오르는지 하나만 말해볼래?",
      state: "diagnose",
      display:
        "안녕 수지. 오늘은 삼각형과 사각형의 규칙을 모양과 균형의 느낌으로 같이 잡아 보자. 정사각형을 보면 어떤 성질이 먼저 떠오르는지 하나만 말해볼래?",
    },
    stateUi: {
      diagnose: {
        badge: "문제 이해 단계",
        title: "도형의 이름보다 성질을 먼저 잡는 중",
        tone: "bg-sky-100 text-sky-700",
        tips: [
          "도형 이름보다 변과 각을 먼저 보기",
          "나란한 변인지, 같은 길이인지 나눠 보기",
          "모양의 균형을 말로 바꿔 보기",
        ],
      },
      concept_intro: {
        badge: "개념 연결 단계",
        title: "도형 성질을 균형과 규칙으로 연결하는 중",
        tone: "bg-violet-100 text-violet-700",
        tips: [
          "평행은 나란함으로 보기",
          "같은 길이는 균형의 느낌으로 보기",
          "정사각형이 여러 성질을 함께 가진 도형이라는 점 떠올리기",
        ],
      },
      guided_practice: {
        badge: "직접 시도 단계",
        title: "도형의 규칙을 말로 풀어내는 중",
        tone: "bg-emerald-100 text-emerald-700",
        tips: [
          "어떤 변이 같은지 먼저 말해 보기",
          "어떤 변이 나란한지 따로 보기",
          "삼각형은 변의 조건과 각의 관계를 함께 보기",
        ],
      },
      hint_1: {
        badge: "힌트 1단계",
        title: "도형의 핵심 성질을 다시 보는 중",
        tone: "bg-amber-100 text-amber-700",
        tips: [
          "평행과 같은 길이를 구분하기",
          "정사각형은 직사각형과 마름모의 성질을 함께 가진다는 점 보기",
          "이등변삼각형은 같은 변과 같은 각을 연결해 보기",
        ],
      },
      hint_2: {
        badge: "힌트 2단계",
        title: "첫 성질을 같이 잡아 보는 중",
        tone: "bg-orange-100 text-orange-700",
        tips: [
          "도형 하나에서 성질 하나만 먼저 찾기",
          "변 조건을 먼저 보고 각 조건을 이어 보기",
          "같은 점과 다른 점을 나눠 말하기",
        ],
      },
      reflection: {
        badge: "정리 단계",
        title: "도형 성질의 뜻을 네 말로 묶는 중",
        tone: "bg-fuchsia-100 text-fuchsia-700",
        tips: [
          "평행과 같은 길이의 차이를 정리하기",
          "정사각형과 직사각형의 관계를 말해 보기",
          "삼각형 성질 하나를 한 문장으로 묶기",
        ],
      },
      recover: {
        badge: "회복 단계",
        title: "더 쉬운 도형부터 다시 올라오는 중",
        tone: "bg-rose-100 text-rose-700",
        tips: [
          "사각형 하나만 놓고 성질 보기",
          "변부터 보고 각은 나중에 봐도 괜찮아",
          "지금은 이름보다 규칙을 잡는 단계야",
        ],
      },
    },
    summaryPattern: /한 문장|정리|평행|사각형|삼각형|정사각형|직사각형|마름모|밑각|내 말로|배운 것/i,
  },
  "middle-1-solid-figures-properties": {
    lessonKey: "middle-1-solid-figures-properties",
    unitKey: "/middle-1/solid-figures-properties",
    unitNumber: 7,
    basePath: "/middle-1/solid-figures-properties",
    content: solidFiguresContent,
    theme: createTheme(
      "bg-[linear-gradient(180deg,#fffdf7_0%,#eff6ff_45%,#f8fbff_100%)]",
      "border-indigo-200",
      "bg-indigo-50",
      "text-indigo-700",
      "bg-indigo-50",
      "hover:border-indigo-400"
    ),
    quizTitle: "입체도형의 성질 감각 체크",
    quizDescription:
      "면, 모서리, 꼭짓점과 전개도를 얼마나 연결해서 보고 있는지 가볍게 확인해보자.",
    resultDescription:
      "지금 점수를 출발점으로 삼고 AI 튜터와 같이 보면, 입체도형을 물건처럼 떠올리고 전개도까지 이어 읽는 감각이 더 또렷해질 거야.",
    tutorTitle: "입체도형의 성질 수업 시작",
    tutorLoadingMessage:
      "입체도형의 성질 콘텐츠를 바탕으로 지금 단계에 맞는 힌트를 고르는 중이야...",
    textareaPlaceholder:
      "예: 각기둥은 같은 밑면이 두 개 있고, 각뿔은 꼭대기로 모인다는 느낌이 들어.",
    buttons: {
      dontKnow: "모르겠어. 더 쉬운 물건 비유로 다시 설명해줘.",
      hint: "힌트를 한 단계만 더 줘.",
      reExplain: "같은 뜻을 다른 생활 예시로 다시 설명해줘.",
    },
    initialReply: {
      encouragement: "좋은 시작이야.",
      explanation:
        "오늘은 입체도형을 상자나 캔처럼 익숙한 물건과 연결해서 읽는 연습을 같이 해보자.",
      question:
        "주사위를 떠올리면 면, 모서리, 꼭짓점 중에서 하나를 먼저 어떻게 설명하고 싶어?",
      state: "diagnose",
      display:
        "좋은 시작이야. 오늘은 입체도형을 상자나 캔처럼 익숙한 물건과 연결해서 읽는 연습을 같이 해보자. 주사위를 떠올리면 면, 모서리, 꼭짓점 중에서 하나를 먼저 어떻게 설명하고 싶어?",
    },
    stateUi: {
      diagnose: {
        badge: "문제 이해 단계",
        title: "입체도형에서 무엇을 먼저 봐야 하는지 잡는 중",
        tone: "bg-sky-100 text-sky-700",
        tips: [
          "도형 이름보다 면, 선, 점 중 무엇을 묻는지 먼저 보기",
          "실제 물건 하나를 떠올리며 구조를 말해보기",
          "보이는 부분과 숨어 있는 부분을 나눠 생각하기",
        ],
      },
      concept_intro: {
        badge: "개념 연결 단계",
        title: "입체도형을 생활 물건과 연결하는 중",
        tone: "bg-violet-100 text-violet-700",
        tips: [
          "각기둥은 상자, 원기둥은 캔처럼 떠올리기",
          "각뿔은 텐트나 피라미드처럼 꼭대기로 모이는 느낌 붙이기",
          "전개도는 펼친 포장지라고 생각하기",
        ],
      },
      guided_practice: {
        badge: "직접 시도 단계",
        title: "면, 모서리, 꼭짓점 관계를 말로 꺼내는 중",
        tone: "bg-emerald-100 text-emerald-700",
        tips: [
          "면이 만나는 선이 무엇인지 먼저 말하기",
          "선들이 만나는 점을 따로 구분하기",
          "기둥과 뿔의 차이를 밑면 개수로 설명해보기",
        ],
      },
      hint_1: {
        badge: "힌트 1단계",
        title: "입체도형의 핵심 구조를 다시 보는 중",
        tone: "bg-amber-100 text-amber-700",
        tips: [
          "기둥은 같은 밑면이 두 개라는 점 먼저 보기",
          "뿔은 한 꼭짓점으로 모인다는 점 떠올리기",
          "점선은 숨은 모서리라는 사실 다시 떠올리기",
        ],
      },
      hint_2: {
        badge: "힌트 2단계",
        title: "첫 설명을 같이 꺼내 보는 중",
        tone: "bg-orange-100 text-orange-700",
        tips: [
          "면과 모서리 중 하나만 먼저 정확히 말해보기",
          "보이는 부분부터 설명한 뒤 숨은 부분을 덧붙이기",
          "전개도는 접히는 순서를 상상하며 보기",
        ],
      },
      reflection: {
        badge: "정리 단계",
        title: "입체도형의 규칙을 네 말로 묶는 중",
        tone: "bg-fuchsia-100 text-fuchsia-700",
        tips: [
          "기둥과 뿔의 차이를 한 문장으로 정리하기",
          "면, 모서리, 꼭짓점의 뜻을 각각 말해보기",
          "전개도가 왜 입체로 접히는지 다시 설명해보기",
        ],
      },
      recover: {
        badge: "회복 단계",
        title: "더 쉬운 물건 예시로 다시 올라오는 중",
        tone: "bg-rose-100 text-rose-700",
        tips: [
          "주사위나 우유갑처럼 익숙한 상자부터 보기",
          "점선은 뒤에 숨은 선이라고만 먼저 기억하기",
          "지금은 개수보다 구조를 보는 감각이 더 중요해",
        ],
      },
    },
    summaryPattern:
      /한 문장|정리|입체도형|면|모서리|꼭짓점|각기둥|각뿔|전개도|네 말로|배운 것/i,
  },
};

export function getUnitDefinition(lessonKey: string) {
  return unitDefinitions[lessonKey];
}

export function getSupportCard(
  unit: UnitDefinition,
  state: StructuredTutorReply["state"]
): {
  title: string;
  description: string;
  body: string;
  prompt: string;
  action: TutorAction;
} {
  const stateCardIndex = {
    diagnose: 0,
    concept_intro: 0,
    guided_practice: 1,
    hint_1: 1,
    hint_2: 2,
    reflection: 2,
    recover: 0,
  } as const;

  const hintCard = unit.content.hintCards[stateCardIndex[state]];
  const exampleProblem =
    state === "recover"
      ? unit.content.generatedProblems[0]
      : state === "hint_2" || state === "reflection"
        ? unit.content.generatedProblems[2]
        : unit.content.generatedProblems[1];

  if (state === "recover") {
    return {
      title: "더 쉬운 시작 카드",
      description: "막히면 더 쉬운 예시로 감각부터 다시 잡아도 괜찮아.",
      body: `${exampleProblem.prompt} 힌트: ${exampleProblem.firstHint}`,
      prompt: `더 쉬운 문제부터 같이 가고 싶어. ${exampleProblem.prompt}`,
      action: "dont_know",
    };
  }

  if (state === "reflection") {
    return {
      title: "한 문장 정리 카드",
      description: "방금 배운 개념을 네 말로 묶어 보는 카드야.",
      body: `${hintCard.text} 이걸 바탕으로 오늘 배운 핵심을 한 문장으로 정리해 봐.`,
      prompt: "내 말로 한 문장 정리해 볼게. 맞는지 봐줘.",
      action: "answer_check",
    };
  }

  if (state === "hint_2") {
    return {
      title: "첫 줄 시작 카드",
      description: "전체 답 말고 첫 단계만 같이 보는 카드야.",
      body: `${exampleProblem.prompt} 두 번째 힌트: ${exampleProblem.secondHint}`,
      prompt: `첫 단계만 같이 보고 싶어. ${exampleProblem.prompt}`,
      action: "hint_request",
    };
  }

  if (state === "hint_1") {
    return {
      title: hintCard.title,
      description: "개념 감각을 다시 붙이는 카드야.",
      body: hintCard.text,
      prompt: `지금 힌트를 한 단계만 더 받고 싶어. ${hintCard.text}`,
      action: "hint_request",
    };
  }

  if (state === "concept_intro") {
    return {
      title: hintCard.title,
      description: "같은 개념을 더 쉬운 비유로 다시 보는 카드야.",
      body: hintCard.text,
      prompt: "같은 개념을 다른 비유로 다시 설명해줘.",
      action: "re_explain",
    };
  }

  return {
    title: "직접 시도 카드",
    description: "지금은 첫 생각만 말해 봐도 충분해.",
    body: `${exampleProblem.prompt} 첫 힌트: ${exampleProblem.firstHint}`,
    prompt: `이 문제를 어떻게 시작하면 좋을지 같이 봐줘. ${exampleProblem.prompt}`,
    action: "default",
  };
}
