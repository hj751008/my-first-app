"use client";

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

export function ParentSummaryCard() {
  const [progressMap] = useState<Record<string, number>>(() =>
    typeof window === "undefined" ? {} : readUnitProgressMap(window.localStorage)
  );
  const [masteryMap] = useState(() =>
    typeof window === "undefined" ? {} : readUnitMasteryMap(window.localStorage)
  );

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
          const aScore = (a.reachedReflection ? 20 : 0) + (a.summaryAttempted ? 10 : 0) + a.progress;
          const bScore = (b.reachedReflection ? 20 : 0) + (b.summaryAttempted ? 10 : 0) + b.progress;

          return bScore - aScore;
        })
        .at(0) ?? null;

    const focusUnit =
      [...hintHeavyUnits].sort((a, b) => b.progress - a.progress).at(0) ??
      [...activeUnits].sort((a, b) => a.progress - b.progress).at(0) ??
      null;

    return {
      totalUnits: units.length,
      activeUnits: activeUnits.length,
      averageProgress: average(activeUnits.map((unit) => unit.progress)),
      averageQuizScore: average(quizUnits.map((unit) => unit.quizScore)),
      reflectionCount: reflectionUnits.length,
      strongestUnit,
      focusUnit,
    };
  }, [masteryMap, progressMap, readyUnits]);

  const summaryMessage =
    summary.activeUnits === 0
      ? "아직 학습 기록이 많지 않아서, 1단원이나 필요한 단원부터 가볍게 시작해보면 좋아요."
      : summary.focusUnit
        ? `${summary.focusUnit.title}에서 힌트 사용이나 중간 멈춤이 보였어요. 이 단원은 짧게 다시 들어가서 스스로 설명하는 연습을 한 번 더 해보면 좋아요.`
        : "전체적으로 흐름이 안정적이에요. 다음에는 각 단원 마지막 정리 문장을 더 자주 남기면 이해가 더 단단해져요.";

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
            중1 전체 흐름에서 수지가 어디까지 해봤고, 어디에서 더 도움이 필요한지 빠르게 볼 수
            있도록 정리한 카드야.
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
          <p className="mt-2 text-sm leading-6 text-slate-600">기록이 있는 단원 기준 평균값이야.</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">평균 퀴즈 점수</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{summary.averageQuizScore}점</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">진단 퀴즈를 푼 단원 기준 평균이야.</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">정리 단계 도달</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{summary.reflectionCount}개</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">배운 내용을 자기 말로 정리한 단원이야.</p>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">가장 앞선 단원</p>
          <p className="mt-2 text-lg font-black text-slate-900">
            {summary.strongestUnit?.title ?? "아직 없음"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {summary.strongestUnit
              ? `진행률 ${summary.strongestUnit.progress}%`
              : "학습이 쌓이면 자동으로 보여줄게."}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#f8fafc_0%,#fff7e6_100%)] p-5">
          <p className="text-sm font-bold text-slate-900">이번 흐름에서 먼저 보면 좋은 포인트</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{summaryMessage}</p>
        </div>
        <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#f8fafc_0%,#eef6ff_100%)] p-5">
          <p className="text-sm font-bold text-slate-900">짧은 관찰 메모</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
            <li>
              가장 앞선 단원: {summary.strongestUnit?.title ?? "아직 데이터 없음"}
            </li>
            <li>
              다시 보면 좋은 단원: {summary.focusUnit?.title ?? "지금은 전체 흐름이 고른 편이야"}
            </li>
            <li>
              추천 행동: {summary.reflectionCount > 0 ? "정리 문장 유지하기" : "퀴즈 후 튜터까지 이어가기"}
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
