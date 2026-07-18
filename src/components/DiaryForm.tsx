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

  const targetDate = diary
    ? format(new Date(diary.created_at), "yyyy-MM-dd")
    : date ?? format(new Date(), "yyyy-MM-dd");

  // 폼 모드 결정: 기존 일기는 자기 스키마를, 신규는 날짜로 결정
  const useBlocks = diary
    ? Array.isArray(diary.blocks) && diary.blocks.length > 0
    : isBlocksMode(targetDate);

  const headerDateLabel =
    diary
      ? format(new Date(diary.created_at), "yyyy년 M월 d일 EEEE", { locale: ko })
      : date
        ? format(new Date(date + "T12:00:00"), "yyyy년 M월 d일 EEEE", {
            locale: ko,
          })
        : null;

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
        headerDateLabel={headerDateLabel}
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
      headerDateLabel={headerDateLabel}
      onBack={() => router.back()}
      afterSave={() => router.push("/")}
    />
  );
}

/* 하단 고정 저장 바 */
function SaveBar({
  saving,
  disabled,
  onSave,
  onBack,
  saveLabel,
  maxWidth = "max-w-2xl",
}: {
  saving: boolean;
  disabled: boolean;
  onSave: () => void;
  onBack: () => void;
  saveLabel: string;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/80 px-5 py-3.5 backdrop-blur-xl">
      <div className={`mx-auto flex ${maxWidth} items-center gap-3`}>
        <button
          onClick={onBack}
          className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-muted transition-colors active:bg-background"
        >
          취소
        </button>
        <button
          onClick={onSave}
          disabled={saving || disabled}
          className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-brand-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 md:ml-auto md:min-w-[200px] md:flex-none"
        >
          {saving ? "저장 중..." : saveLabel}
        </button>
      </div>
    </div>
  );
}

function FormHeader({
  title,
  dateLabel,
}: {
  title: string;
  dateLabel: string | null;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
        {title}
      </h1>
      {dateLabel && <p className="mt-1 text-sm text-muted">{dateLabel}</p>}
    </div>
  );
}

function LegacyForm({
  diary,
  date,
  headerDateLabel,
  onBack,
  afterSave,
}: {
  diary?: { id: string; content: string; reflections: string[] };
  date?: string;
  headerDateLabel: string | null;
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
    <>
      <main className="animate-fade-in-up mx-auto max-w-2xl px-5 py-6 pb-28 md:py-10">
        <FormHeader
          title={diary ? "영상 기록 수정" : "영상 기록"}
          dateLabel={headerDateLabel}
        />

        <section className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
              오늘의 기록
            </h2>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="오늘 하루를 자유롭게 기록하세요..."
              className="w-full min-h-[200px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60 md:min-h-[240px] md:text-base"
            />
          </div>
        </section>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">느낀점 정리</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <section>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="느낀점을 자유롭게 정리하세요..."
              className="w-full min-h-[120px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60 md:min-h-[160px] md:text-base"
            />
          </div>
        </section>
      </main>

      <SaveBar
        saving={saving}
        disabled={!content.trim() && !reflection.trim()}
        onSave={handleSave}
        onBack={onBack}
        saveLabel={diary ? "수정 완료" : "저장하기"}
      />
    </>
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
    setBlocks((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)
    );
  };

  const cleaned = blocks
    .map((b) => ({ content: b.content.trim(), reflection: b.reflection.trim() }))
    .filter((b) => b.content || b.reflection);

  const handleSave = async () => {
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
    <>
      <main className="animate-fade-in-up mx-auto max-w-2xl px-5 py-6 pb-28 md:py-10">
        <FormHeader
          title={isEdit ? "영상 기록 수정" : "영상 기록"}
          dateLabel={headerDateLabel}
        />

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

            <div className="mb-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(i, { content: e.target.value })}
                placeholder="내용을 적어보세요..."
                className="w-full min-h-[140px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60 md:text-base"
              />
            </div>

            <div className="mb-2 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] text-muted">느낀점</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
              <textarea
                value={block.reflection}
                onChange={(e) => updateBlock(i, { reflection: e.target.value })}
                placeholder="이 내용에 대한 느낀점..."
                className="w-full min-h-[90px] bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60 md:text-base"
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

      <SaveBar
        saving={saving}
        disabled={cleaned.length === 0}
        onSave={handleSave}
        onBack={onBack}
        saveLabel={isEdit ? "수정 완료" : "저장하기"}
      />
    </>
  );
}
