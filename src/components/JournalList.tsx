"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { deleteDiary } from "@/lib/actions";

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const parts = useMemo(() => {
    if (!text || terms.length === 0) return [{ t: text, hit: false }];
    const pattern = terms.map(escapeRegex).join("|");
    const regex = new RegExp(`(${pattern})`, "gi");
    return text.split(regex).map((t, i) => ({ t, hit: i % 2 === 1 }));
  }, [text, terms]);

  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark
            key={i}
            className="rounded bg-primary/25 px-0.5 text-foreground"
          >
            {p.t}
          </mark>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </>
  );
}

export default function JournalList({ diaries }: { diaries: JournalEntry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const terms = useMemo(
    () => query.trim().split(/\s+/).filter(Boolean),
    [query]
  );

  const filtered = useMemo(() => {
    if (terms.length === 0) return diaries;
    return diaries.filter((d) =>
      terms.every((t) => new RegExp(escapeRegex(t), "i").test(d.content))
    );
  }, [diaries, terms]);

  const grouped = useMemo(() => {
    const acc: Record<string, JournalEntry[]> = {};
    for (const diary of filtered) {
      const dateKey = format(new Date(diary.created_at), "yyyy-MM-dd");
      (acc[dateKey] ??= []).push(diary);
    }
    return acc;
  }, [filtered]);

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

  return (
    <div>
      {/* 검색 */}
      <div className="relative mb-5">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="일기 내용 검색 (단어를 띄어쓰면 AND)"
          className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="지우기"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted active:bg-background"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {diaries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">아직 작성한 일기가 없어요</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          검색 결과가 없어요
        </p>
      ) : (
        <div className="space-y-6">
          {query.trim() && (
            <p className="text-xs text-muted">{filtered.length}건</p>
          )}
          {Object.entries(grouped).map(([dateKey, items]) => (
            <div key={dateKey}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                {format(new Date(dateKey), "yyyy년 M월 d일 EEEE", {
                  locale: ko,
                })}
              </p>
              <div className="space-y-3">
                {items.map((diary) => (
                  <div
                    key={diary.id}
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <Link href={`/diary/${diary.id}`} className="block">
                      <p className="line-clamp-4 whitespace-pre-wrap text-[15px] leading-7 text-foreground">
                        <Highlight text={diary.content} terms={terms} />
                      </p>
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
      )}
    </div>
  );
}
