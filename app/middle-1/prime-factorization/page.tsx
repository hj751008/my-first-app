import Link from "next/link";
import { primeFactorizationContent } from "@/lib/content/primeFactorization";

export default function PrimeFactorizationPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf7_0%,#fff7e8_45%,#f8fbff_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Link href="/middle-1" className="text-sm font-semibold text-slate-500">
          ← 중1 단원 목록으로
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] border border-amber-200 bg-white/90 p-8 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              1단원 · {primeFactorizationContent.overview.title}
            </p>
            <h1 className="mt-4 text-3xl font-black sm:text-5xl">
              {primeFactorizationContent.overview.subtitle}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              {primeFactorizationContent.overview.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {primeFactorizationContent.overview.checkpoints.map((checkpoint) => (
                <div
                  key={checkpoint}
                  className="rounded-[1.5rem] bg-amber-50 p-4 text-sm leading-6 text-slate-700"
                >
                  {checkpoint}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/middle-1/prime-factorization/tutor"
                className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                AI 튜터 시작하기
              </Link>
              <Link
                href="/middle-1/prime-factorization/quiz"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-amber-400 hover:text-slate-900"
              >
                진단 퀴즈 먼저 해보기
              </Link>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)]">
            <h2 className="text-2xl font-bold">새로 만든 학습 포인트</h2>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
              {primeFactorizationContent.misconceptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="mt-8 rounded-[1.5rem] bg-slate-950 p-5 text-sm leading-6 text-slate-100">
              <p className="font-bold">저작권 대응 원칙</p>
              <p className="mt-2 text-slate-300">
                외부 자료는 내부 참고만 하고, 앱에 들어가는 문제와 설명은 수지
                프로젝트용으로 새로 구성한 콘텐츠만 사용해.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
