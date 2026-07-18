"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { searchDiaries, type SearchMatch } from "@/lib/actions";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const parts = useMemo(() => {
    if (!text || terms.length === 0) return [{ t: text, hit: false }];
    const pattern = terms.map(escapeRegex).join("|");
    const regex = new RegExp(`(${pattern})`, "gi");
    const split = text.split(regex);
    return split.map((t, i) => ({ t, hit: i % 2 === 1 }));
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

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    const handle = setTimeout(() => {
      startTransition(async () => {
        const data = await searchDiaries(q);
        setResults(data);
        setSearched(true);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <main className="animate-fade-in-up mx-auto max-w-2xl px-5 py-6 md:py-10">
      <div>
        {/* 검색 입력 */}
        <div className="mb-6">
          <div className="relative flex-1">
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
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="일기 검색 (단어를 띄어쓰면 AND)"
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
        </div>

        {/* 결과 */}
        <div>
          {!query.trim() && (
            <p className="mt-10 text-center text-sm text-muted">
              본문과 느낀점에서 검색해요
            </p>
          )}

          {query.trim() && searched && !isPending && results.length === 0 && (
            <p className="mt-10 text-center text-sm text-muted">
              검색 결과가 없어요
            </p>
          )}

          {results.length > 0 && (
            <>
              <p className="mb-3 text-xs text-muted">
                {isPending ? "검색 중…" : `${results.length}건`}
              </p>
              <div className="space-y-3">
                {results.map((r, i) => (
                  <Link
                    key={r.diary.id}
                    href={`/diary/${r.diary.id}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                    className="stagger block rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md active:bg-background"
                  >
                    <p className="mb-2 text-xs text-muted">
                      {format(
                        new Date(r.diary.created_at),
                        "yyyy년 M월 d일 EEEE",
                        { locale: ko }
                      )}
                    </p>

                    <div className="space-y-2">
                      {r.hits.map((hit, i) => {
                        const isFree = hit.field === "free";
                        const isMemo = hit.field === "memo";
                        const isContent = hit.field === "content";
                        const label = isFree
                          ? "일기"
                          : isMemo
                            ? "메모"
                            : isContent
                              ? "본문"
                              : "느낀점";
                        const numbered =
                          hit.index !== null ? `${label} ${hit.index + 1}` : label;
                        return (
                          <div key={i}>
                            <span
                              className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                isFree || isContent
                                  ? "bg-brand-soft text-brand"
                                  : "bg-blue-400/15 text-blue-400"
                              }`}
                            >
                              {numbered}
                            </span>
                            <span className="text-[14px] leading-6 text-foreground">
                              <Highlight text={hit.snippet} terms={r.terms} />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
