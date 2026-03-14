import Link from "next/link";
import { QuizClient } from "./QuizClient";

export default function IntegersAndRationalNumbersQuizPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf7_0%,#eef7ff_45%,#f8fbff_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link
          href="/middle-1/integers-and-rational-numbers"
          className="text-sm font-semibold text-slate-500"
        >
          정수와 유리수 소개로
        </Link>
        <QuizClient />
      </section>
    </main>
  );
}
