import Link from "next/link";
import { getDiaries } from "@/lib/actions";
import Calendar from "@/components/Calendar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const diaries = await getDiaries();

  return (
    <div className="flex h-full flex-col items-center bg-background">
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        {/* 헤더 */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Godaily
          </h1>
          <Link
            href="/search"
            aria-label="검색"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors active:bg-background"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </Link>
        </header>

        {/* 캘린더 */}
        <main className="flex-1 overflow-y-auto px-5 pb-8 hide-scrollbar">
          <Calendar diaries={diaries} />
        </main>
      </div>
    </div>
  );
}
