import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getDiaries } from "@/lib/actions";
import DiaryList from "@/components/DiaryList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const diaries = await getDiaries();
  const today = format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko });

  return (
    <div className="flex h-full flex-col items-center bg-background">
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        {/* 헤더 */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Godaily
            </h1>
            <p className="mt-0.5 text-sm text-muted">{today}</p>
          </div>
          <Link
            href="/write"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-md transition-transform active:scale-95"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-background"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </header>

        {/* 일기 목록 */}
        <main className="flex-1 overflow-y-auto px-5 pb-8 hide-scrollbar">
          {diaries.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center pt-32 text-center">
              <div className="mb-4 text-5xl">📝</div>
              <p className="text-lg font-medium text-foreground">
                아직 일기가 없어요
              </p>
              <p className="mt-1 text-sm text-muted">
                오른쪽 상단 + 버튼으로 첫 일기를 써보세요
              </p>
            </div>
          ) : (
            <DiaryList diaries={diaries} />
          )}
        </main>
      </div>
    </div>
  );
}
