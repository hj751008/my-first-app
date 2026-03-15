import Link from "next/link";
import { TutorClient } from "./TutorClient";

export default function BasicGeometryTutorPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf7_0%,#fff4ef_45%,#f8fbff_100%)] px-6 py-10 text-slate-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link href="/middle-1/basic-geometry" className="text-sm font-semibold text-slate-500">
          기본 도형 소개로
        </Link>
        <TutorClient />
      </section>
    </main>
  );
}
