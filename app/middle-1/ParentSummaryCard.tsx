"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { middle1Units } from "@/lib/curriculum";
import {
  getUnitMastery,
  getUnitProgress,
  readUnitMasteryMap,
  readUnitProgressMap,
} from "@/lib/progress";

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function createParentNarrative(params: {
  activeUnits: number;
  totalUnits: number;
  averageProgress: number;
  reflectionCount: number;
  strongestUnit: { title: string; progress: number } | null;
  focusUnit: { title: string; progress: number } | null;
}) {
  const {
    activeUnits,
    totalUnits,
    averageProgress,
    reflectionCount,
    strongestUnit,
    focusUnit,
  } = params;

  if (activeUnits === 0) {
    return "아직 누적된 학습 기록이 많지 않아요. 먼저 1단원이나 현재 가장 필요한 단원부터 짧게 시작해서 학습 흐름을 만드는 것이 좋아요.";
  }

  if (focusUnit && strongestUnit && focusUnit.title !== strongestUnit.title) {
    return `${strongestUnit.title}에서는 비교적 안정적으로 학습이 이어졌고, ${focusUnit.title}에서는 추가 힌트나 재시도가 더 필요했어요. 다음에는 ${focusUnit.title}를 짧게 다시 보며 자기 말로 정리하는 연습을 붙이면 좋아요.`;
  }

  if (reflectionCount >= Math.max(1, Math.floor(totalUnits / 2))) {
    return "여러 단원에서 정리 단계까지 도달했어요. 단순히 문제를 푸는 것을 넘어서 배운 개념을 자기 말로 묶는 힘이 자라고 있는 흐름이에요.";
  }

  return `현재 ${activeUnits}개 단원에서 학습 기록이 쌓였고, 평균 진행률은 ${averageProgress}%예요. 퀴즈와 튜터를 함께 이어가면 이해가 더 안정적으로 굳어질 가능성이 커요.`;
}

export function ParentSummaryCard() {
  const [progressMap] = useState<Record<string, number>>(() =>
    typeof window === "undefined" ? {} : readUnitProgressMap(window.localStorage)
  );
  const [masteryMap] = useState(() =>
    typeof window === "undefined" ? {} : readUnitMasteryMap(window.localStorage)
  );
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const readyUnits = middle1Units.filter((unit) => unit.status === "ready" && unit.href);

  const summary = useMemo(() => {
    const units = readyUnits.map((unit) => {
      const progress = getUnitProgress(progressMap, unit.href!, unit.progress);
      const mastery = getUnitMastery(masteryMap, unit.href!);

      return {
        title: unit.title,
        progress,
        quizScore: mastery.quizScore,
        quizCompleted: mastery.quizCompleted,
        reachedReflection: mastery.reachedReflection,
        usedHint: mastery.usedHint,
        summaryAttempted: mastery.summaryAttempted,
      };
    });

    const activeUnits = units.filter((unit) => unit.progress > 0);
    const quizUnits = units.filter((unit) => unit.quizCompleted);
    const reflectionUnits = units.filter((unit) => unit.reachedReflection);
    const hintHeavyUnits = units.filter((unit) => unit.usedHint && unit.progress >= 20);

    const strongestUnit =
      [...units]
        .sort((a, b) => {
          const aScore =
            (a.reachedReflection ? 20 : 0) + (a.summaryAttempted ? 10 : 0) + a.progress;
          const bScore =
            (b.reachedReflection ? 20 : 0) + (b.summaryAttempted ? 10 : 0) + b.progress;

          return bScore - aScore;
        })
        .at(0) ?? null;

    const focusUnit =
      [...hintHeavyUnits].sort((a, b) => b.progress - a.progress).at(0) ??
      [...activeUnits].sort((a, b) => a.progress - b.progress).at(0) ??
      null;

    const averageProgress = average(activeUnits.map((unit) => unit.progress));
    const averageQuizScore = average(quizUnits.map((unit) => unit.quizScore));
    const reflectionCount = reflectionUnits.length;

    return {
      totalUnits: units.length,
      activeUnits: activeUnits.length,
      averageProgress,
      averageQuizScore,
      reflectionCount,
      strongestUnit,
      focusUnit,
      parentNarrative: createParentNarrative({
        activeUnits: activeUnits.length,
        totalUnits: units.length,
        averageProgress,
        reflectionCount,
        strongestUnit,
        focusUnit,
      }),
    };
  }, [masteryMap, progressMap, readyUnits]);

  const parentReport = useMemo(() => {
    return [
      "[수지 중1 수학 학습 요약]",
      `- 활동 단원: ${summary.activeUnits}/${summary.totalUnits}`,
      `- 평균 진행률: ${summary.averageProgress}%`,
      `- 평균 진단 퀴즈 점수: ${summary.averageQuizScore}점`,
      `- 정리 단계 도달 단원 수: ${summary.reflectionCount}개`,
      `- 가장 안정적인 단원: ${summary.strongestUnit?.title ?? "아직 데이터 없음"}`,
      `- 다시 보면 좋은 단원: ${summary.focusUnit?.title ?? "지금은 전체 흐름이 비교적 고른 편"}`,
      "",
      "[한 줄 요약]",
      summary.parentNarrative,
      "",
      "[권장 다음 행동]",
      summary.focusUnit
        ? `- ${summary.focusUnit.title}를 10분 정도만 다시 보며, 마지막에 배운 내용을 한 문장으로 말하게 해보면 좋아요.`
        : "- 현재는 퀴즈 후 AI 튜터까지 자연스럽게 이어가며 기록을 더 쌓아보면 좋아요.",
    ].join("\n");
  }, [summary]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(parentReport);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Parent Summary
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">
            부모/교사용 학습 요약 카드
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            중1 전체 흐름에서 수지가 어디까지 해봤는지, 어디에서 조금 더 도움이 필요한지
            빠르게 읽을 수 있게 정리한 카드야.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
          활동 단원 {summary.activeUnits}/{summary.totalUnits}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">평균 진행률</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{summary.averageProgress}%</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">기록이 있는 단원 기준 평균이야.</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">평균 퀴즈 점수</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{summary.averageQuizScore}점</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">진단 퀴즈를 푼 단원 기준이야.</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">정리 단계 도달</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{summary.reflectionCount}개</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            배운 내용을 자기 말로 정리한 단원 수야.
          </p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">가장 안정적인 단원</p>
          <p className="mt-2 text-lg font-black text-slate-900">
            {summary.strongestUnit?.title ?? "아직 없음"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {summary.strongestUnit
              ? `현재 진행률 ${summary.strongestUnit.progress}%`
              : "기록이 더 쌓이면 자동으로 보여줄게."}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#f8fafc_0%,#fff7e6_100%)] p-5">
          <p className="text-sm font-bold text-slate-900">부모가 먼저 읽으면 좋은 해석</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{summary.parentNarrative}</p>
        </div>
        <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] p-5">
          <p className="text-sm font-bold text-slate-900">짧은 관찰 메모</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li>가장 앞선 단원: {summary.strongestUnit?.title ?? "아직 데이터 없음"}</li>
            <li>
              다시 보면 좋은 단원: {summary.focusUnit?.title ?? "지금은 전체 흐름이 비교적 고른 편"}
            </li>
            <li>
              추천 행동:{" "}
              {summary.focusUnit
                ? `${summary.focusUnit.title}를 짧게 복습한 뒤 한 문장 정리까지 이어가기`
                : "퀴즈 후 튜터까지 자연스럽게 이어가며 기록 더 쌓기"}
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">부모용 전달 문구</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              아래 문장을 그대로 복사해서 보호자나 교사에게 전달할 수 있어.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            {copyState === "copied"
              ? "복사 완료"
              : copyState === "failed"
                ? "복사 다시 시도"
                : "요약 문구 복사"}
          </button>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-[1.25rem] bg-white p-4 text-sm leading-6 text-slate-700">
          {parentReport}
        </pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/middle-1/report"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            출력용 레이아웃 보기
          </Link>
        </div>
      </div>
    </section>
  );
}
