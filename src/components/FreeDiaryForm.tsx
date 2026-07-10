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
  };
  date?: string;
}

export default function FreeDiaryForm({ diary, date }: FreeDiaryFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(diary?.content ?? "");
  const [memo, setMemo] = useState(diary?.memo ?? "");
  const [saving, setSaving] = useState(false);

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
    <div className="flex h-full flex-col items-center bg-background">
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">
              {diary ? "일기 수정" : "일기"}
            </h1>
            {date && !diary && (
              <p className="text-xs text-muted">
                {format(new Date(date + "T12:00:00"), "M월 d일 EEEE", {
                  locale: ko,
                })}
              </p>
            )}
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-24 hide-scrollbar">
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                일기
              </h2>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 하루를 자유롭게 적어보세요..."
                autoFocus
                className="w-full min-h-[280px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60"
              />
            </div>
          </section>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">일기를 위한 기록</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <section>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="낮에 있었던 일들을 틈틈이 메모해두세요. 자기 전에 위에 일기로 정리하면 돼요."
                className="w-full min-h-[160px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60"
              />
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-background/80 px-5 py-4 backdrop-blur-xl">
          <button
            onClick={handleSave}
            disabled={saving || (!content.trim() && !memo.trim())}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-background transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "저장 중..." : diary ? "수정 완료" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
