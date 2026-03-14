"use client";

import { FormEvent, useEffect, useState } from "react";
import { primeFactorizationContent } from "@/lib/content/primeFactorization";
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

const STORAGE_KEY = "suji-math-ai:middle-1-prime-factorization:tutor-session";
const UNIT_PROGRESS_KEY = "/middle-1/prime-factorization";

const stateUi = {
  diagnose: {
    badge: "문제 이해 단계",
    title: "무엇을 구해야 하는지 먼저 잡는 중",
    tone: "bg-sky-100 text-sky-700",
    tips: [
      "문제에서 구해야 하는 말만 먼저 찾아보기",
      "숫자를 바로 계산하지 말고, 무엇을 묻는지 확인하기",
      "잘 모르겠으면 문제를 네 말로 바꿔 말해보기",
    ],
  },
  concept_intro: {
    badge: "개념 연결 단계",
    title: "비유로 개념 감각을 만드는 중",
    tone: "bg-violet-100 text-violet-700",
    tips: [
      "웹툰이나 이야기 장면으로 먼저 상상해보기",
      "비유와 수학 개념이 어떻게 이어지는지 보기",
      "용어보다 이미지가 먼저 떠오르는지 확인하기",
    ],
  },
  guided_practice: {
    badge: "직접 시도 단계",
    title: "수지가 첫 단계를 스스로 밟는 중",
    tone: "bg-emerald-100 text-emerald-700",
    tips: [
      "완벽한 답보다 첫 줄을 시작하는 데 집중하기",
      "어떤 개념을 써야 할지 한 가지만 고르기",
      "맞는 방향인지 말로 먼저 설명해보기",
    ],
  },
  hint_1: {
    badge: "힌트 1단계",
    title: "개념 연결 힌트를 받는 중",
    tone: "bg-amber-100 text-amber-700",
    tips: [
      "정답보다 비슷한 상황을 떠올려보기",
      "예전에 본 개념과 닮은 점 찾기",
      "힌트에서 나온 단어 하나만 붙잡기",
    ],
  },
  hint_2: {
    badge: "힌트 2단계",
    title: "첫 줄을 같이 여는 중",
    tone: "bg-orange-100 text-orange-700",
    tips: [
      "이제는 전체 답이 아니라 첫 줄만 따라가기",
      "첫 단계가 왜 필요한지 함께 보기",
      "다음 줄은 스스로 이어 보려고 해보기",
    ],
  },
  reflection: {
    badge: "정리 단계",
    title: "쓴 개념을 자기 말로 묶는 중",
    tone: "bg-fuchsia-100 text-fuchsia-700",
    tips: [
      "오늘 쓴 개념 이름을 직접 말해보기",
      "왜 그 개념이 필요했는지 한 문장으로 정리하기",
      "다음에도 같은 문제에서 쓸 수 있을지 떠올려보기",
    ],
  },
  recover: {
    badge: "회복 단계",
    title: "더 쉬운 비유와 문제로 다시 올라오는 중",
    tone: "bg-rose-100 text-rose-700",
    tips: [
      "모르겠다고 말한 건 괜찮아, 그게 중요한 정보야",
      "더 쉬운 숫자나 이야기로 다시 시작해도 괜찮아",
      "지금은 맞히기보다 이해의 출발점을 찾는 단계야",
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
  const hintCard = primeFactorizationContent.hintCards[stateCardIndex[state]];
  const exampleProblem =
    state === "recover"
      ? primeFactorizationContent.generatedProblems[0]
      : state === "hint_2" || state === "reflection"
        ? primeFactorizationContent.generatedProblems[2]
        : primeFactorizationContent.generatedProblems[1];

  if (state === "recover") {
    return {
      title: "더 쉬운 숫자 카드",
      description: "막히면 더 쉬운 예시로 감각부터 다시 잡아보자.",
      body: `${exampleProblem.prompt} 힌트: ${exampleProblem.firstHint}`,
      prompt: `더 쉬운 문제부터 같이 가고 싶어. ${exampleProblem.prompt}`,
      action: "dont_know" as const,
    };
  }

  if (state === "reflection") {
    return {
      title: "한 문장 정리 카드",
      description: "방금 쓴 개념을 네 말로 묶어보는 카드야.",
      body: `${hintCard.text} 이걸 바탕으로 소인수분해가 뭔지 한 문장으로 정리해봐.`,
      prompt: "내가 소인수분해를 한 문장으로 정리해 볼게. 맞는지 봐줘.",
      action: "answer_check" as const,
    };
  }

  if (state === "hint_2") {
    return {
      title: "첫 줄 시작 카드",
      description: "전체 답 말고 첫 줄만 같이 여는 카드야.",
      body: `${exampleProblem.prompt} 두 번째 힌트: ${exampleProblem.secondHint}`,
      prompt: `첫 줄 다음에는 뭘 봐야 하는지만 알려줘. ${exampleProblem.prompt}`,
      action: "hint_request" as const,
    };
  }

  if (state === "hint_1") {
    return {
      title: hintCard.title,
      description: "비슷한 감각으로 현재 문제를 다시 연결해보는 카드야.",
      body: hintCard.text,
      prompt: `지금 힌트를 한 단계만 더 받아보고 싶어. ${hintCard.text}`,
      action: "hint_request" as const,
    };
  }

  if (state === "concept_intro") {
    return {
      title: hintCard.title,
      description: "비유로 개념 감각을 만드는 카드야.",
      body: hintCard.text,
      prompt: "같은 개념을 다른 웹툰 비유로 다시 설명해줘.",
      action: "re_explain" as const,
    };
  }

  return {
    title: "직접 시도 카드",
    description: "지금은 완벽한 답보다 첫 단계만 시작하면 돼.",
    body: `${exampleProblem.prompt} 첫 힌트: ${exampleProblem.firstHint}`,
    prompt: `이 문제를 내가 어떻게 시작하면 좋을지 같이 봐줘. ${exampleProblem.prompt}`,
    action: "default" as const,
  };
}

const initialReply: StructuredTutorReply = {
  encouragement: "안녕 수지.",
  explanation: `${primeFactorizationContent.overview.description} 오늘은 ${primeFactorizationContent.generatedProblems[0].prompt}처럼 숫자를 차근차근 쪼개 보는 감각을 같이 익혀보자.`,
  question:
    "12를 보면 어떤 수들끼리 곱해서 만들 수 있는지 먼저 떠오르는 것부터 말해볼래?",
  state: "diagnose",
  display:
    "안녕 수지. 오늘은 큰 수를 기본 블록까지 쪼개 보는 감각을 같이 익혀보자. 12를 보면 어떤 수들끼리 곱해서 만들 수 있는지 먼저 떠오르는 것부터 말해볼래?",
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
      // Ignore corrupted localStorage data and keep the current session defaults.
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
    const recoveredOnce = messages.some(
      (message) => message.reply?.state === "recover"
    );
    const reachedReflection = messages.some(
      (message) => message.reply?.state === "reflection"
    );
    const summaryAttempted = messages.some(
      (message) =>
        message.role === "user" &&
        /한 문장|정리|소인수분해는|내 말로|배운 걸/i.test(message.content)
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
          lesson: "middle-1-prime-factorization",
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
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: data.reply!.display,
            reply: data.reply,
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              AI 튜터 대화
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">
              소인수분해 수업 시작
            </h1>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            콘텐츠 팩 연결 완료
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
                  <p className="font-semibold text-amber-700">
                    {message.reply.encouragement}
                  </p>
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
              수학쌤이 소인수분해 콘텐츠 팩 안에서 지금 단계에 맞는 힌트를 고르는 중이야...
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="예: 12는 3이랑 4를 곱해도 되고, 2랑 6을 곱해도 돼."
            className="min-h-28 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-400"
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
                submitMessage("모르겠어. 더 쉬운 비유로 다시 설명해줘.", "dont_know")
              }
            >
              모르겠어
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed"
              onClick={() => submitMessage("힌트를 한 단계만 줘.", "hint_request")}
            >
              힌트 줘
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed"
              onClick={() =>
                submitMessage("같은 뜻을 다른 웹툰 비유로 다시 설명해줘.", "re_explain")
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

        <div className="mt-6 rounded-[1.5rem] bg-amber-50 p-5 text-sm leading-6 text-slate-700">
          <p className="font-bold text-slate-900">{activeSupportCard.title}</p>
          <p className="mt-2 text-slate-600">{activeSupportCard.description}</p>
          <p className="mt-3">{activeSupportCard.body}</p>
          <button
            type="button"
            disabled={isLoading}
            className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            onClick={() =>
              submitMessage(activeSupportCard.prompt, activeSupportCard.action)
            }
          >
            이 카드로 이어서 질문하기
          </button>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-amber-50 p-5 text-sm leading-6 text-slate-700">
          <p className="font-bold text-slate-900">새로 만든 문제 예시</p>
          <ul className="mt-3 space-y-2">
            {primeFactorizationContent.generatedProblems.map((problem) => (
              <li key={problem.id}>{problem.prompt}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-amber-50 p-5 text-sm leading-6 text-slate-700">
          <p className="font-bold text-slate-900">현재 lesson context 힌트</p>
          <p className="mt-2">
            힌트 단계는 <span className="font-semibold">{hintLevel}</span> 이고,
            현재 튜터 상태는{" "}
            <span className="font-semibold">{latestAssistantReply.state}</span> 야.
          </p>
          <p className="mt-2">
            지금 보이는 카드와 예시 문제는 모두 소인수분해 콘텐츠 팩에서
            가져온 새 콘텐츠야.
          </p>
        </div>
      </aside>
    </div>
  );
}
