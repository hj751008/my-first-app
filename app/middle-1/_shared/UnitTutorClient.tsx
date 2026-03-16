"use client";

import { FormEvent, useEffect, useState } from "react";
import { writeUnitMastery, writeUnitProgress } from "@/lib/progress";
import type { StructuredTutorReply, TutorAction } from "@/lib/tutor";
import { getSupportCard, type UnitDefinition } from "@/lib/units";

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

export function UnitTutorClient({ unit }: { unit: UnitDefinition }) {
  const storageKey = `suji-math-ai:${unit.lessonKey}:tutor-session`;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: unit.initialReply.display,
      reply: unit.initialReply,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const latestAssistantReply =
    [...messages].reverse().find((message) => message.role === "assistant")?.reply ??
    unit.initialReply;
  const activeState = unit.stateUi[latestAssistantReply.state];
  const activeSupportCard = getSupportCard(unit, latestAssistantReply.state);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);

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
      // Ignore corrupted localStorage data.
    } finally {
      setIsHydrated(true);
    }
  }, [storageKey]);

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

    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    setLastSavedAt(payload.savedAt);
  }, [hintLevel, input, isHydrated, messages, storageKey]);

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
      (message) => message.role === "user" && unit.summaryPattern.test(message.content)
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

    writeUnitProgress(window.localStorage, unit.unitKey, progress);
    writeUnitMastery(window.localStorage, unit.unitKey, {
      reachedGuidedPractice,
      usedHint,
      recoveredOnce,
      reachedReflection,
      summaryAttempted,
      lastState: latestAssistantReply.state,
    });
  }, [hintLevel, isHydrated, latestAssistantReply.state, messages, unit]);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson: unit.lessonKey,
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
        submitError instanceof Error ? submitError.message : "잠깐 문제가 생겼어. 다시 시도해보자."
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
            <p
              className={`text-sm font-semibold uppercase tracking-[0.2em] ${unit.theme.accentText}`}
            >
              AI 튜터 대화
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">{unit.tutorTitle}</h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${unit.theme.chipBg} ${unit.theme.accentText}`}
          >
            단원 콘텐츠 연결 완료
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
                  <p className={`font-semibold ${unit.theme.accentText}`}>
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
              {unit.tutorLoadingMessage}
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={unit.textareaPlaceholder}
            className="min-h-28 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
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
              onClick={() => submitMessage(unit.buttons.dontKnow, "dont_know")}
            >
              모르겠어
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed"
              onClick={() => submitMessage(unit.buttons.hint, "hint_request")}
            >
              힌트 줘
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed"
              onClick={() => submitMessage(unit.buttons.reExplain, "re_explain")}
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

        <div className={`mt-6 rounded-[1.5rem] p-5 text-sm leading-6 text-slate-700 ${unit.theme.lightBg}`}>
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

        <div className={`mt-6 rounded-[1.5rem] p-5 text-sm leading-6 text-slate-700 ${unit.theme.lightBg}`}>
          <p className="font-bold text-slate-900">새로 만든 문제 예시</p>
          <ul className="mt-3 space-y-2">
            {unit.content.generatedProblems.map((problem) => (
              <li key={problem.id}>{problem.prompt}</li>
            ))}
          </ul>
        </div>

        <div className={`mt-6 rounded-[1.5rem] p-5 text-sm leading-6 text-slate-700 ${unit.theme.lightBg}`}>
          <p className="font-bold text-slate-900">현재 lesson context 힌트</p>
          <p className="mt-2">
            힌트 단계는 <span className="font-semibold">{hintLevel}</span>이고, 현재 튜터 상태는{" "}
            <span className="font-semibold">{latestAssistantReply.state}</span>야.
          </p>
          <p className="mt-2">
            지금 보이는 카드와 문제 예시는 모두 이 단원 콘텐츠 팩에서 가져온 프로젝트 전용 자료야.
          </p>
        </div>
      </aside>
    </div>
  );
}
