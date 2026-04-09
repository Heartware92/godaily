import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getDiary } from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function DiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diary = await getDiary(id);

  return (
    <div className="flex h-full flex-col items-center bg-background">
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        {/* 헤더 */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <p className="text-sm text-muted">
            {format(new Date(diary.created_at), "yyyy년 M월 d일 EEEE", {
              locale: ko,
            })}
          </p>
          <div className="flex gap-1">
            <Link
              href={`/diary/${id}/edit`}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
          </div>
        </header>

        {/* 내용 */}
        <main className="flex-1 overflow-y-auto px-5 pb-24 hide-scrollbar">
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                기록
              </h2>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
                {diary.content || "(내용 없음)"}
              </p>
            </div>
          </section>

          {diary.reflections?.length > 0 && diary.reflections.some((r: string) => r.trim()) && (
            <>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted">느낀점 정리</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <section>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
                    {diary.reflections.join("\n")}
                  </p>
                </div>
              </section>
            </>
          )}
        </main>

        {/* 하단 삭제 */}
        <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-background/80 px-5 py-4 backdrop-blur-xl">
          <DeleteButton id={id} />
        </div>
      </div>
    </div>
  );
}
