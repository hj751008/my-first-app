import Link from "next/link";
import { UnitGrid } from "./UnitGrid";

export default function Middle1Page() {
  return (
    <main className="min-h-screen bg-[#fffdf7] px-6 py-10 text-slate-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-amber-200 bg-[linear-gradient(135deg,#fff8dd_0%,#ffffff_60%,#eef6ff_100%)] p-8 shadow-[0_18px_60px_-35px_rgba(15,23,42,0.4)]">
          <Link href="/" className="text-sm font-semibold text-slate-500">
            ← 홈으로
          </Link>
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              중등 1학년 커리큘럼
            </p>
            <h1 className="text-3xl font-black sm:text-5xl">
              수지의 기초를 다시 세우는 8개 단원
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">
              먼저 1단원 소인수분해부터 시작해요. 튜터 화면에서 학습을 이어가면
              진행률이 자동으로 저장되고, 이 단원 목록에도 바로 반영돼요.
            </p>
          </div>
        </div>

        <UnitGrid />
      </section>
    </main>
  );
}
