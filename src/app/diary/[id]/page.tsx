import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getDiary } from "@/lib/actions";
import DeleteButton from "@/components/DeleteButton";
import type { DiaryBlock } from "@/types/diary";

export const dynamic = "force-dynamic";

export default async function DiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diary = await getDiary(id);

  const blocks: DiaryBlock[] | null =
    Array.isArray(diary.blocks) && diary.blocks.length > 0
      ? (diary.blocks as DiaryBlock[])
      : null;

  return (
    <main className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      {/* 상단: 날짜 + 수정 */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <span
            className={`mb-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              diary.entry_type === "free"
                ? "bg-primary/15 text-primary"
                : "bg-blue-400/15 text-blue-400"
            }`}
          >
            {diary.entry_type === "free" ? "일기" : "영상 기록"}
          </span>
          <p className="text-sm text-foreground md:text-base">
            {format(new Date(diary.created_at), "yyyy년 M월 d일 EEEE", {
              locale: ko,
            })}
          </p>
        </div>
        <Link
          href={`/diary/${id}/edit`}
          className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors active:bg-background"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          수정
        </Link>
      </div>

      {/* 내용 */}
      <article>
        {diary.entry_type === "free" ? (
          <>
            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                  일기
                </h2>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground md:text-base md:leading-8">
                  {diary.content || "(아직 일기를 정리하지 않았어요)"}
                </p>
              </div>
            </section>

            {diary.memo?.trim() && (
              <>
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted">일기를 위한 기록</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <section>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground md:text-base md:leading-8">
                      {diary.memo}
                    </p>
                  </div>
                </section>
              </>
            )}
          </>
        ) : blocks ? (
          blocks.map((block, i) => (
            <div key={i} className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                  기록 {i + 1}
                </h2>
              </div>
              {block.content && (
                <div className="mb-3 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                  <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground md:text-base md:leading-8">
                    {block.content}
                  </p>
                </div>
              )}
              {block.reflection && (
                <>
                  <div className="mb-2 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] text-muted">느낀점</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                    <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground md:text-base md:leading-8">
                      {block.reflection}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <>
            <section className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                  기록
                </h2>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground md:text-base md:leading-8">
                  {diary.content || "(내용 없음)"}
                </p>
              </div>
            </section>

            {diary.reflections?.length > 0 &&
              diary.reflections.some((r: string) => r.trim()) && (
                <>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted">느낀점 정리</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <section>
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
                      <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground md:text-base md:leading-8">
                        {diary.reflections.join("\n")}
                      </p>
                    </div>
                  </section>
                </>
              )}
          </>
        )}
      </article>

      {/* 삭제 */}
      <div className="mt-10 border-t border-border pt-6">
        <div className="max-w-xs">
          <DeleteButton id={id} />
        </div>
      </div>
    </main>
  );
}
