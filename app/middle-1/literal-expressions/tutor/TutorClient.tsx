"use client";

import { FormEvent, useEffect, useState } from "react";
import { literalExpressionsContent } from "@/lib/content/literalExpressions";
import { writeUnitMastery, writeUnitProgress } from "@/lib/progress";
import type { StructuredTutorReply, TutorAction } from "@/lib/tutor";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  reply?: StructuredTutorReply;
};

type SavedTutorSession = {
  messages: ChatMessage[];
  hintLevel: number;
  inputDraft: string;
  savedAt: string;
};

const STORAGE_KEY = "suji-math-ai:middle-1-literal-expressions:tutor-session";
const UNIT_PROGRESS_KEY = "/middle-1/literal-expressions";

const stateUi = {
  diagnose: {
    badge: "문제 이해 단계",
    title: "무엇을 문자로 둘지 먼저 잡는 중",
    tone: "bg-sky-100 text-sky-700",
    tips: [
      "문장에서 아직 정해지지 않은 수가 무엇인지 먼저 찾기",
      "바로 계산하지 말고 어떤 수를 문자로 둘지 정하기",
      "문장을 짧은 식으로 바꾼다고 생각하기",
    ],
  },
  concept_intro: {
    badge: "개념 연결 단계",
    title: "문자를 이름표처럼 받아들이는 중",
    tone: "bg-violet-100 text-violet-700",
    tips: [
      "문자는 빈자리에 붙이는 이름표라고 생각하기",
      "2x를 두 묶음의 x로 떠올리기",
      "문장과 식을 서로 번역하는 감각 만들기",
    ],
  },
  guided_practice: {
    badge: "직접 시도 단계",
    title: "문장을 식으로 옮기는 첫 시도를 하는 중",
    tone: "bg-emerald-100 text-emerald-700",
    tips: [
      "어떤 수를 먼저 x로 정해 보기",
      "그다음 더한 것인지, 곱한 것인지 차례대로 붙이기",
      "완성된 식을 다시 말로 읽어 보기",
    ],
  },
  hint_1: {
    badge: "힌트 1단계",
    title: "문장 속 관계를 다시 읽는 중",
    tone: "bg-amber-100 text-amber-700",
    tips: [
      "'어떤 수'를 먼저 문자로 잡기",
      "'3 큰 수', '2배' 같은 표현을 따로 떼어 읽기",
      "문장을 두 조각으로 나눠 식에 붙이기",
    ],
  },
  hint_2: {
    badge: "힌트 2단계",
    title: "첫 식을 같이 세워 보는 중",
    tone: "bg-orange-100 text-orange-700",
    tips: [
      "x를 먼저 두고 그 옆에 연산을 붙여 보기",
      "2x는 x + x라는 뜻으로 다시 확인하기",
      "전체 답보다 시작 줄을 정확히 적기",
    ],
  },
  reflection: {
    badge: "정리 단계",
    title: "문자와 식의 뜻을 네 말로 묶는 중",
    tone: "bg-fuchsia-100 text-fuchsia-700",
    tips: [
      "문자가 왜 필요한지 한 문장으로 정리하기",
      "식을 다시 말로 읽어 보기",
      "다음에도 쓸 번역 규칙 하나 고르기",
    ],
  },
  recover: {
    badge: "회복 단계",
    title: "더 쉬운 문장으로 다시 들어오는 중",
    tone: "bg-rose-100 text-rose-700",
    tips: [
      "긴 문장 대신 짧은 표현부터 식으로 바꿔 보기",
      "먼저 x를 정하면 나머지는 훨씬 쉬워져",
      "지금은 맞히기보다 뜻을 읽는 게 더 중요해",
    ],
  },
} as const;

const stateCardIndex = {
  diagnose: 0,
  concept_intro: 0,
  guided_practice: 1,
  hint_1: 1,
  hint_2: 2,
  reflection: 2,
  recover: 0,
} as const;

function getSupportCard(state: StructuredTutorReply["state"]) {
  const hintCard = literalExpressionsContent.hintCards[stateCardIndex[state]];
  const exampleProblem =
    state === "recover"
      ? literalExpressionsContent.generatedProblems[0]
      : state === "hint_2" || state === "reflection"
        ? literalExpressionsContent.generatedProblems[2]
        : literalExpressionsContent.generatedProblems[1];

  if (state === "recover") {
    return {
      title: "더 쉬운 번역 카드",
      description: "짧은 문장부터 식으로 바꾸면 부담이 줄어들어.",
      body: `${exampleProblem.prompt} 힌트: ${exampleProblem.firstHint}`,
      prompt: `더 쉬운 문제부터 같이 가고 싶어. ${exampleProblem.prompt}`,
      action: "dont_know" as const,
    };
  }

  if (state === "reflection") {
    return {
      title: "한 문장 정리 카드",
      description: "방금 배운 문자의 뜻을 네 말로 묶어 보는 카드야.",
      body: `${hintCard.text} 이걸 바탕으로 문자와 식이 왜 필요한지 한 문장으로 정리해 봐.`,
      prompt: "내 말로 한 문장 정리해 볼게. 맞는지 봐줘.",
      action: "answer_check" as const,
    };
  }

  if (state === "hint_2") {
    return {
      title: "첫 식 시작 카드",
      description: "전체 식 말고 첫 출발만 같이 잡는 카드야.",
      body: `${exampleProblem.prompt} 두 번째 힌트: ${exampleProblem.secondHint}`,
      prompt: `첫 식만 같이 세워 보고 싶어. ${exampleProblem.prompt}`,
      action: "hint_request" as const,
    };
  }

  if (state === "hint_1") {
    return {
      title: hintCard.title,
      description: "문장을 식으로 읽는 감각을 다시 붙이는 카드야.",
      body: hintCard.text,
      prompt: `지금 힌트를 한 단계만 더 받고 싶어. ${hintCard.text}`,
      action: "hint_request" as const,
    };
  }

  if (state === "concept_intro") {
    return {
      title: hintCard.title,
      description: "같은 개념을 다른 비유로 보는 카드야.",
      body: hintCard.text,
      prompt: "같은 개념을 더 쉬운 글쓰기 비유로 다시 설명해줘.",
      action: "re_explain" as const,
    };
  }

  return {
    title: "직접 시도 카드",
    description: "지금은 x를 먼저 정하는 것만 해도 충분해.",
    body: `${exampleProblem.prompt} 첫 힌트: ${exampleProblem.firstHint}`,
    prompt: `이 문제를 어떻게 시작하면 좋을지 같이 봐줘. ${exampleProblem.prompt}`,
    action: "default" as const,
  };
}

const initialReply: StructuredTutorReply = {
  encouragement: "안녕 수지.",
  explanation: `${literalExpressionsContent.overview.description} 오늘은 ${literalExpressionsContent.generatedProblems[0].prompt}처럼 문장을 식으로 바꾸는 첫 감각부터 같이 잡아 보자.`,
  question: "'어떤 수'를 만나면 먼저 무엇을 문자로 두면 좋을지 말해볼래?",
  state: "diagnose",
  display:
    "안녕 수지. 오늘은 문자와 식을 숫자 이야기처럼 읽는 연습을 같이 해 보자. '어떤 수'를 만나면 먼저 무엇을 문자로 두면 좋을지 말해볼래?",
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    content: initialReply.display,
    reply: initialReply,
  },
];

export function TutorClient() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const latestAssistantReply =
    [...messages].reverse().find((message) => message.role === "assistant")?.reply ??
    initialReply;
  const activeState = stateUi[latestAssistantReply.state];
  const activeSupportCard = getSupportCard(latestAssistantReply.state);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        setIsHydrated(true);
        return;
      }

      const saved = JSON.parse(raw) as Partial<SavedTutorSession>;

      if (Array.isArray(saved.messages) && saved.messages.length > 0) {
        setMessages(saved.messages as ChatMessage[]);
      }

      if (typeof saved.hintLevel === "number") {
        setHintLevel(saved.hintLevel);
      }

      if (typeof saved.inputDraft === "string") {
        setInput(saved.inputDraft);
      }

      if (typeof saved.savedAt === "string") {
        setLastSavedAt(saved.savedAt);
      }
    } catch {
      // Keep defaults if localStorage data is corrupted.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const payload: SavedTutorSession = {
      messages,
      hintLevel,
      inputDraft: input,
      savedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastSavedAt(payload.savedAt);
  }, [hintLevel, input, isHydrated, messages]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const userTurns = messages.filter((message) => message.role === "user").length;
    const assistantTurns = messages.filter((message) => message.role === "assistant").length;
    const reachedGuidedPractice = messages.some(
      (message) => message.reply?.state === "guided_practice"
    );
    const usedHint = hintLevel > 0;
    const recoveredOnce = messages.some((message) => message.reply?.state === "recover");
    const reachedReflection = messages.some(
      (message) => message.reply?.state === "reflection"
    );
    const summaryAttempted = messages.some(
      (message) =>
        message.role === "user" &&
        /한 문장|정리|문자|식|내 말로|배운 것/i.test(message.content)
    );

    const progress = Math.min(
      100,
      10 +
        userTurns * 8 +
        assistantTurns * 3 +
        (reachedGuidedPractice ? 15 : 0) +
        (usedHint ? 8 : 0) +
        (recoveredOnce ? 7 : 0) +
        (reachedReflection ? 20 : 0) +
        (summaryAttempted ? 22 : 0)
    );

    writeUnitProgress(window.localStorage, UNIT_PROGRESS_KEY, progress);
    writeUnitMastery(window.localStorage, UNIT_PROGRESS_KEY, {
      reachedGuidedPractice,
      usedHint,
      recoveredOnce,
      reachedReflection,
      summaryAttempted,
      lastState: latestAssistantReply.state,
    });
  }, [hintLevel, isHydrated, latestAssistantReply.state, messages]);

  async function submitMessage(customInput?: string, action: TutorAction = "default") {
    const messageToSend = (customInput ?? input).trim();

    if (!messageToSend || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: "user" as const, content: messageToSend }];
    const nextHintLevel = action === "hint_request" ? Math.min(hintLevel + 1, 2) : hintLevel;

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson: "middle-1-literal-expressions",
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          action,
          hintLevel: nextHintLevel,
        }),
      });

      const data = (await response.json()) as {
        reply?: StructuredTutorReply;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "응답을 불러오지 못했어.");
      }

      setHintLevel(nextHintLevel);

      if (data.reply) {
        const reply = data.reply;

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: reply.display,
            reply,
          },
        ]);
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "잠깐 문제가 생겼어. 다시 시도해보자."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitMessage(input, "default");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.35)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
              AI 튜터 대화
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">
              문자와 식 수업 시작
            </h1>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
            콘텐츠 연결 완료
          </span>
        </div>

        <div className="mb-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${activeState.tone}`}>
              {activeState.badge}
            </span>
            <p className="text-sm font-semibold text-slate-700">{activeState.title}</p>
            <span className="text-xs text-slate-400">
              {lastSavedAt
                ? `자동 저장됨 · ${new Date(lastSavedAt).toLocaleTimeString("ko-KR")}`
                : "자동 저장 준비 중"}
            </span>
          </div>
        </div>

        <div className="flex min-h-[28rem] flex-col gap-4 rounded-[1.5rem] bg-slate-50 p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 shadow-sm ${
                message.role === "assistant"
                  ? "bg-white text-slate-800"
                  : "ml-auto bg-slate-900 text-white"
              }`}
            >
              {message.reply ? (
                <div className="space-y-2">
                  <p className="font-semibold text-violet-700">{message.reply.encouragement}</p>
                  <p>{message.reply.explanation}</p>
                  <p className="font-medium">{message.reply.question}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    state · {message.reply.state}
                  </p>
                </div>
              ) : (
                message.content
              )}
            </div>
          ))}

          {isLoading ? (
            <div className="max-w-[85%] rounded-[1.5rem] bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              문자와 식 콘텐츠를 바탕으로 지금 단계에 맞는 힌트를 고르는 중이야...
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="예: 어떤 수를 x로 두고 4를 더하면 x + 4 같아."
            className="min-h-28 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-violet-400"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isLoading ? "생각 중..." : "보내기"}
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed"
              onClick={() =>
                submitMessage("모르겠어. 더 짧은 문장부터 다시 설명해줘.", "dont_know")
              }
            >
              모르겠어
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed"
              onClick={() => submitMessage("힌트를 한 단계만 더 줘.", "hint_request")}
            >
              힌트 줘
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed"
              onClick={() =>
                submitMessage("같은 뜻을 더 쉬운 비유로 다시 설명해줘.", "re_explain")
              }
            >
              다시 설명해줘
            </button>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </form>
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            지금 추천하는 생각법
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{activeState.title}</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            {activeState.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-violet-50 p-5 text-sm leading-6 text-slate-700">
          <p className="font-bold text-slate-900">{activeSupportCard.title}</p>
          <p className="mt-2 text-slate-600">{activeSupportCard.description}</p>
          <p className="mt-3">{activeSupportCard.body}</p>
          <button
            type="button"
            disabled={isLoading}
            className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={() => submitMessage(activeSupportCard.prompt, activeSupportCard.action)}
          >
            이 카드로 이어서 질문하기
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-violet-50 p-5 text-sm leading-6 text-slate-700">
          <p className="font-bold text-slate-900">새로 만든 문제 예시</p>
          <ul className="mt-3 space-y-2">
            {literalExpressionsContent.generatedProblems.map((problem) => (
              <li key={problem.id}>{problem.prompt}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-violet-50 p-5 text-sm leading-6 text-slate-700">
          <p className="font-bold text-slate-900">현재 lesson context 힌트</p>
          <p className="mt-2">
            힌트 단계는 <span className="font-semibold">{hintLevel}</span> 이고, 현재 튜터
            상태는 <span className="font-semibold">{latestAssistantReply.state}</span> 야.
          </p>
          <p className="mt-2">
            지금 보이는 카드와 예시 문제는 모두 문자와 식 콘텐츠 팩에서 가져온 앱용
            콘텐츠야.
          </p>
        </div>
      </aside>
    </div>
  );
}
