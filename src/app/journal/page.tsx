import Link from "next/link";
import { getFreeDiaries } from "@/lib/actions";
import JournalList from "@/components/JournalList";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const diaries = await getFreeDiaries();

  return (
    <div className="flex h-full flex-col items-center bg-background">
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        {/* 헤더 */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <Link
            href="/"
            aria-label="뒤로"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors active:bg-background"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-foreground">일기</h1>
          <Link
            href="/write?type=free"
            aria-label="일기 쓰기"
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
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-8 hide-scrollbar">
          <JournalList diaries={diaries} />
        </main>
      </div>
    </div>
  );
}
