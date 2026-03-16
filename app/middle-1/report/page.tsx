import Link from "next/link";
import { ParentSummaryCard } from "../ParentSummaryCard";
import { PrintButton } from "./PrintButton";

export default function Middle1ReportPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 py-10 text-slate-900 print:bg-white print:px-0 print:py-0">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 print:max-w-none print:gap-0">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_60px_-34px_rgba(15,23,42,0.28)] print:rounded-none print:border-0 print:shadow-none">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/middle-1"
                className="text-sm font-semibold text-slate-500 print:hidden"
              >
                중1 대시보드로
              </Link>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                Parent Report
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-900">
                수지 중1 학습 요약 출력본
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                보호자나 교사가 현재 학습 흐름을 빠르게 읽을 수 있도록 만든 출력용 화면이야.
                브라우저 인쇄 기능에서 PDF 저장을 선택하면 그대로 보관할 수 있어.
              </p>
            </div>
            <PrintButton />
          </div>
        </div>

        <ParentSummaryCard />
      </section>
    </main>
  );
}
