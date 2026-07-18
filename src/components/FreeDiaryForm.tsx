"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { createFreeDiary, updateFreeDiary } from "@/lib/actions";

interface FreeDiaryFormProps {
  diary?: {
    id: string;
    content: string;
    memo: string;
    created_at: string;
  };
  date?: string;
}

export default function FreeDiaryForm({ diary, date }: FreeDiaryFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(diary?.content ?? "");
  const [memo, setMemo] = useState(diary?.memo ?? "");
  const [saving, setSaving] = useState(false);

  const dateLabel = diary
    ? format(new Date(diary.created_at), "yyyy년 M월 d일 EEEE", { locale: ko })
    : date
      ? format(new Date(date + "T12:00:00"), "yyyy년 M월 d일 EEEE", {
          locale: ko,
        })
      : format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko });

  const handleSave = async () => {
    if (!content.trim() && !memo.trim()) return;
    setSaving(true);
    try {
      if (diary) {
        await updateFreeDiary(diary.id, content, memo);
      } else {
        await createFreeDiary(content, memo, date);
      }
      router.push("/");
    } catch (e) {
      alert("저장에 실패했습니다: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <main className="mx-auto max-w-5xl px-5 py-6 pb-28 md:py-10">
        <div className="mb-6">
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            {diary ? "일기 수정" : "일기"}
          </h1>
          <p className="mt-1 text-sm text-muted">{dateLabel}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          {/* 일기 */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                일기
              </h2>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 하루를 자유롭게 적어보세요..."
                autoFocus
                className="w-full min-h-[300px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60 md:text-base md:leading-8 lg:min-h-[440px]"
              />
            </div>
          </section>

          {/* 일기를 위한 기록 (메모) */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-muted" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                일기를 위한 기록
              </h2>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="낮에 있었던 일들을 틈틈이 메모해두세요. 자기 전에 옆에 일기로 정리하면 돼요."
                className="w-full min-h-[180px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60 md:text-base md:leading-8 lg:min-h-[440px]"
              />
            </div>
          </section>
        </div>
      </main>

      {/* 하단 고정 저장 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 px-5 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted transition-colors active:bg-background"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (!content.trim() && !memo.trim())}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-background transition-transform active:scale-[0.99] disabled:opacity-50 md:ml-auto md:min-w-[200px] md:flex-none"
          >
            {saving ? "저장 중..." : diary ? "수정 완료" : "저장하기"}
          </button>
        </div>
      </div>
    </>
  );
}
