"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { writeUnitMastery, writeUnitProgress } from "@/lib/progress";
import { primeFactorizationContent } from "@/lib/content/primeFactorization";

const UNIT_KEY = "/middle-1/prime-factorization";
const questions = primeFactorizationContent.diagnosticQuiz;

export function QuizClient() {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      return total + (selected[question.id] === question.answer ? 1 : 0);
    }, 0);
  }, [selected]);

  function handleSubmit() {
    const percentage = Math.round((score / questions.length) * 100);

    writeUnitMastery(window.localStorage, UNIT_KEY, {
      quizCompleted: true,
      quizScore: percentage,
    });

    writeUnitProgress(window.localStorage, UNIT_KEY, Math.max(percentage * 0.5, 15));
    setSubmitted(true);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)]">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
          진단 퀴즈
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">
          소인수분해 감각 체크
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          지금 어디까지 알고 있는지 짧게 확인해보자. 여기 있는 문항은 앱용으로
          새롭게 만든 진단 문항이야.
        </p>
      </section>

      {questions.map((question) => (
        <section
          key={question.id}
          className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.22)]"
        >
          <p className="text-sm font-semibold text-slate-400">{question.id}번</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{question.prompt}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const isSelected = selected[question.id] === option;
              const isCorrect = submitted && option === question.answer;
              const isWrongSelected = submitted && isSelected && !isCorrect;

              return (
                <button
                  key={option}
                  type="button"
                  className={`rounded-[1.25rem] border px-4 py-4 text-left text-sm font-semibold transition ${
                    isCorrect
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : isWrongSelected
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : isSelected
                          ? "border-amber-400 bg-amber-50 text-slate-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-amber-300"
                  }`}
                  onClick={() =>
                    setSelected((current) => ({ ...current, [question.id]: option }))
                  }
                >
                  {option}
                </button>
              );
            })}
          </div>
          {submitted ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">{question.explanation}</p>
          ) : null}
        </section>
      ))}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.22)]">
        {!submitted ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              onClick={handleSubmit}
            >
              결과 확인하기
            </button>
            <Link
              href="/middle-1/prime-factorization/tutor"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              바로 튜터로 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              결과
            </p>
            <h2 className="text-3xl font-black text-slate-900">
              {Math.round((score / questions.length) * 100)}점
            </h2>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              지금 점수는 출발점이야. 이어서 AI 튜터와 대화하면 막힌 개념을 더
              천천히 연결해볼 수 있어.
            </p>
            <div className="rounded-[1.5rem] bg-amber-50 p-5 text-sm leading-6 text-slate-700">
              <p className="font-bold text-slate-900">다음에 풀어볼 새 문제 예시</p>
              <ul className="mt-3 space-y-2">
                {primeFactorizationContent.generatedProblems.slice(0, 2).map((problem) => (
                  <li key={problem.id}>{problem.prompt}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/middle-1/prime-factorization/tutor"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                AI 튜터 이어서 하기
              </Link>
              <Link
                href="/middle-1"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
              >
                단원 목록으로 돌아가기
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
