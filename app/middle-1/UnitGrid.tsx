"use client";

import Link from "next/link";
import { useState } from "react";
import { middle1Units } from "@/lib/curriculum";
import {
  getUnitMastery,
  getUnitProgress,
  readUnitMasteryMap,
  readUnitProgressMap,
} from "@/lib/progress";

const statusLabel = {
  ready: "바로 시작 가능",
  planned: "곧 열릴 예정",
  locked: "선행 단원 필요",
} as const;

const statusStyle = {
  ready: "bg-emerald-100 text-emerald-700",
  planned: "bg-sky-100 text-sky-700",
  locked: "bg-slate-100 text-slate-500",
} as const;

export function UnitGrid() {
  const [progressMap] = useState<Record<string, number>>(() =>
    typeof window === "undefined" ? {} : readUnitProgressMap(window.localStorage)
  );
  const [masteryMap] = useState(() =>
    typeof window === "undefined" ? {} : readUnitMasteryMap(window.localStorage)
  );

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {middle1Units.map((unit) => {
        const progress = unit.href
          ? getUnitProgress(progressMap, unit.href, unit.progress)
          : unit.progress;
        const mastery = unit.href
          ? getUnitMastery(masteryMap, unit.href)
          : {
              reachedGuidedPractice: false,
              usedHint: false,
              recoveredOnce: false,
              reachedReflection: false,
              summaryAttempted: false,
              quizCompleted: false,
              quizScore: 0,
              lastState: "diagnose",
            };

        const masteryBadges = [
          mastery.reachedGuidedPractice ? "직접 시도함" : null,
          mastery.usedHint ? "힌트 사용함" : null,
          mastery.recoveredOnce ? "쉬운 단계 복귀" : null,
          mastery.reachedReflection ? "정리 단계 도달" : null,
          mastery.summaryAttempted ? "자기 말 설명 시도" : null,
          mastery.quizCompleted ? `진단 퀴즈 ${mastery.quizScore}점` : null,
        ].filter(Boolean);

        const card = (
          <article className="flex h-full flex-col rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.35)] transition hover:-translate-y-1">
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-400">{unit.id}단원</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[unit.status]}`}
              >
                {statusLabel[unit.status]}
              </span>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">{unit.title}</h2>
              <p className="min-h-18 text-sm leading-6 text-slate-600">{unit.description}</p>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>학습 진행률</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {masteryBadges.length > 0 ? (
                masteryBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                  >
                    {badge}
                  </span>
                ))
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  아직 학습 기록 없음
                </span>
              )}
            </div>
            <div className="mt-6 min-h-10 text-sm leading-6 text-slate-500">
              {unit.prerequisite
                ? `먼저 ${unit.prerequisite}을 마치면 더 자연스럽게 이어서 배울 수 있어.`
                : "가장 먼저 시작하는 단원이라 바로 들어가도 괜찮아."}
            </div>
            <div className="mt-6 text-sm font-semibold text-slate-900">
              {unit.status === "ready" ? "학습 시작하기" : "준비 중"}
            </div>
          </article>
        );

        if (unit.href) {
          return (
            <Link key={unit.id} href={unit.href} className="block">
              {card}
            </Link>
          );
        }

        return (
          <div key={unit.id} className="cursor-not-allowed opacity-85">
            {card}
          </div>
        );
      })}
    </div>
  );
}
