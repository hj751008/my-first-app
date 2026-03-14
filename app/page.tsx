import Link from "next/link";
import { middleSchoolGrades } from "@/lib/curriculum";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff5d6_0%,#fffaf0_38%,#f8fbff_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl flex-col justify-center gap-10">
        <div className="max-w-3xl space-y-5">
          <span className="inline-flex rounded-full border border-amber-300 bg-white/80 px-4 py-1 text-sm font-medium text-amber-700 shadow-sm">
            수지 전용 MVP · OpenAI 버전 설계 시작
          </span>
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Suji Math AI
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              수학을 다시
              <br />
              이해할 수 있다는 감각부터
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              정답을 바로 알려주는 앱이 아니라, 수지가 문제를 읽고
              생각의 순서를 스스로 만들 수 있도록 옆에서 같이 질문해주는
              수학쌤을 만드는 것이 목표예요.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {middleSchoolGrades.map((grade) => (
            <Link
              key={grade.href}
              href={grade.href}
              className="group rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.35)] transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_24px_70px_-32px_rgba(245,158,11,0.45)]"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold">{grade.label}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {grade.badge}
                </span>
              </div>
              <p className="mb-8 text-sm leading-6 text-slate-600">
                {grade.description}
              </p>
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                학습 화면 보기
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
