"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { createDiary, updateDiary } from "@/lib/actions";
import { isBlocksMode, type DiaryBlock } from "@/types/diary";

interface DiaryFormProps {
  diary?: {
    id: string;
    content: string;
    reflections: string[];
    blocks: DiaryBlock[] | null;
    created_at: string;
  };
  date?: string;
}

export default function DiaryForm({ diary, date }: DiaryFormProps) {
  const router = useRouter();

  const targetDate =
    diary
      ? format(new Date(diary.created_at), "yyyy-MM-dd")
      : date ?? format(new Date(), "yyyy-MM-dd");

  // 폼 모드 결정: 기존 일기는 자기 스키마를, 신규는 날짜로 결정
  const useBlocks = diary
    ? Array.isArray(diary.blocks) && diary.blocks.length > 0
    : isBlocksMode(targetDate);

  if (useBlocks) {
    return (
      <BlocksForm
        diaryId={diary?.id}
        date={diary ? undefined : date}
        initialBlocks={
          diary?.blocks && diary.blocks.length > 0
            ? diary.blocks
            : [{ content: "", reflection: "" }]
        }
        headerDateLabel={
          diary
            ? null
            : date
              ? format(new Date(date + "T12:00:00"), "M월 d일 EEEE", {
                  locale: ko,
                })
              : null
        }
        onBack={() => router.back()}
        afterSave={() => router.push("/")}
        isEdit={Boolean(diary)}
      />
    );
  }

  return (
    <LegacyForm
      diary={diary}
      date={date}
      onBack={() => router.back()}
      afterSave={() => router.push("/")}
    />
  );
}

function LegacyForm({
  diary,
  date,
  onBack,
  afterSave,
}: {
  diary?: { id: string; content: string; reflections: string[] };
  date?: string;
  onBack: () => void;
  afterSave: () => void;
}) {
  const [content, setContent] = useState(diary?.content ?? "");
  const [reflection, setReflection] = useState(
    diary?.reflections?.join("\n") ?? ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim() && !reflection.trim()) return;
    setSaving(true);
    try {
      const reflections = reflection.trim() ? [reflection.trim()] : [];
      if (diary) {
        await updateDiary(diary.id, content, reflections);
      } else {
        await createDiary(content, reflections, date);
      }
      afterSave();
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
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">
              {diary ? "수정하기" : "새 일기"}
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
                오늘의 기록
              </h2>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 하루를 자유롭게 기록하세요..."
                className="w-full min-h-[200px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60"
              />
            </div>
          </section>

          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">느낀점 정리</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <section>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="느낀점을 자유롭게 정리하세요..."
                className="w-full min-h-[120px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60"
              />
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-background/80 px-5 py-4 backdrop-blur-xl">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-background transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "저장 중..." : diary ? "수정 완료" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BlocksForm({
  diaryId,
  date,
  initialBlocks,
  headerDateLabel,
  onBack,
  afterSave,
  isEdit,
}: {
  diaryId?: string;
  date?: string;
  initialBlocks: DiaryBlock[];
  headerDateLabel: string | null;
  onBack: () => void;
  afterSave: () => void;
  isEdit: boolean;
}) {
  const [blocks, setBlocks] = useState<DiaryBlock[]>(initialBlocks);
  const [saving, setSaving] = useState(false);

  const updateBlock = (i: number, patch: Partial<DiaryBlock>) => {
    setBlocks((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b))
    );
  };

  const addBlock = () => {
    setBlocks((prev) => [...prev, { content: "", reflection: "" }]);
  };

  const removeBlock = (i: number) => {
    setBlocks((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  };

  const handleSave = async () => {
    const cleaned: DiaryBlock[] = blocks
      .map((b) => ({
        content: b.content.trim(),
        reflection: b.reflection.trim(),
      }))
      .filter((b) => b.content || b.reflection);

    if (cleaned.length === 0) return;
    setSaving(true);
    try {
      if (diaryId) {
        await updateDiary(diaryId, "", [], cleaned);
      } else {
        await createDiary("", [], date, cleaned);
      }
      afterSave();
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
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">
              {isEdit ? "수정하기" : "새 일기"}
            </h1>
            {headerDateLabel && (
              <p className="text-xs text-muted">{headerDateLabel}</p>
            )}
          </div>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-32 hide-scrollbar">
          {blocks.map((block, i) => (
            <div key={i} className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
                    기록 {i + 1}
                  </h2>
                </div>
                {blocks.length > 1 && (
                  <button
                    onClick={() => removeBlock(i)}
                    className="rounded-lg px-2 py-1 text-[11px] text-red-400 active:bg-red-500/10"
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(i, { content: e.target.value })}
                  placeholder="내용을 적어보세요..."
                  className="w-full min-h-[140px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60"
                />
              </div>

              <div className="mb-2 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted">느낀점</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <textarea
                  value={block.reflection}
                  onChange={(e) =>
                    updateBlock(i, { reflection: e.target.value })
                  }
                  placeholder="이 내용에 대한 느낀점..."
                  className="w-full min-h-[90px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addBlock}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm font-medium text-muted active:bg-card"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            기록 추가
          </button>
        </main>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-background/80 px-5 py-4 backdrop-blur-xl">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-background transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "저장 중..." : isEdit ? "수정 완료" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
