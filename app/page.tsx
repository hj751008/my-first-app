import Link from "next/link";

const grades = [
  { label: "중등 1학년", href: "/middle-1" },
  { label: "중등 2학년", href: "/middle-2" },
  { label: "중등 3학년", href: "/middle-3" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="w-full max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-bold">수학 학습 도우미</h1>
        <p className="text-gray-600">학년을 선택해서 시작해보세요.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {grades.map((grade) => (
            <Link
              key={grade.href}
              href={grade.href}
              className="rounded-2xl border px-6 py-4 shadow-sm hover:shadow-md"
            >
              {grade.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
