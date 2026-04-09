"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { deleteDiary } from "@/lib/actions";
import { useState } from "react";

interface Diary {
  id: string;
  content: string;
  reflections: string[];
  created_at: string;
}

export default function DiaryList({ diaries }: { diaries: Diary[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제할까요?")) return;
    setDeletingId(id);
    try {
      await deleteDiary(id);
      router.refresh();
    } catch {
      alert("삭제에 실패했습니다");
    } finally {
      setDeletingId(null);
    }
  };

  // 날짜별 그룹핑
  const grouped = diaries.reduce<Record<string, Diary[]>>((acc, diary) => {
    const dateKey = format(new Date(diary.created_at), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(diary);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateKey, items]) => (
        <div key={dateKey}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            {format(new Date(dateKey), "M월 d일 EEEE", { locale: ko })}
          </p>
          <div className="space-y-3">
            {items.map((diary) => (
              <div
                key={diary.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors"
              >
                <Link href={`/diary/${diary.id}`}>
                  <p className="line-clamp-3 text-[15px] leading-7 text-foreground">
                    {diary.content || "(내용 없음)"}
                  </p>
                  {diary.reflections?.length > 0 && diary.reflections.some((r) => r.trim()) && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
                      {diary.reflections.join("\n")}
                    </p>
                  )}
                </Link>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted">
                    {format(new Date(diary.created_at), "a h:mm", {
                      locale: ko,
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Link
                      href={`/diary/${diary.id}/edit`}
                      className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors active:bg-background"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(diary.id)}
                      disabled={deletingId === diary.id}
                      className="rounded-lg px-3 py-1.5 text-xs text-red-400 transition-colors active:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingId === diary.id ? "삭제 중..." : "삭제"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
