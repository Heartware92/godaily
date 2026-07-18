import Link from "next/link";
import { getFreeDiaries } from "@/lib/actions";
import JournalList from "@/components/JournalList";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const diaries = await getFreeDiaries();

  return (
    <main className="animate-fade-in-up mx-auto max-w-2xl px-5 py-6 md:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
          일기
        </h1>
        <Link
          href="/write?type=free"
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          새 일기
        </Link>
      </div>

      <JournalList diaries={diaries} />
    </main>
  );
}
