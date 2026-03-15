import Link from "next/link";
import { TutorClient } from "./TutorClient";

export default function SolidFiguresPropertiesTutorPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf7_0%,#eff6ff_45%,#f8fbff_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          href="/middle-1/solid-figures-properties"
          className="text-sm font-semibold text-slate-500"
        >
          입체도형의 성질 소개로
        </Link>
        <TutorClient />
      </section>
    </main>
  );
}
