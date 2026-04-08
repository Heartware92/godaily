"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function Home() {
  const today = new Date();
  const [content, setContent] = useState("");
  const [reflections, setReflections] = useState<string[]>([""]);

  const addReflection = () => {
    setReflections([...reflections, ""]);
  };

  const updateReflection = (index: number, value: string) => {
    const updated = [...reflections];
    updated[index] = value;
    setReflections(updated);
  };

  const removeReflection = (index: number) => {
    if (reflections.length <= 1) return;
    setReflections(reflections.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-full flex-col items-center bg-background">
      {/* 모바일 9:16 컨테이너 */}
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        {/* 헤더 */}
        <header className="flex items-center justify-between px-5 pt-12 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Godaily
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {format(today, "yyyy년 M월 d일 EEEE", { locale: ko })}
            </p>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border transition-colors active:bg-border">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted"
            >
              <path d="M12 8V12L15 15" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
        </header>

        {/* 메인 콘텐츠 - 스크롤 영역 */}
        <main className="flex-1 overflow-y-auto px-5 pb-24 hide-scrollbar">
          {/* 상단: 자유 기록 */}
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

          {/* 구분선 */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">느낀점 정리</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* 하단: 느낀점 목록 */}
          <section className="space-y-3">
            {reflections.map((reflection, index) => (
              <div
                key={index}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-background">
                  {index + 1}
                </span>
                <textarea
                  value={reflection}
                  onChange={(e) => updateReflection(index, e.target.value)}
                  placeholder="느낀점을 정리하세요..."
                  rows={2}
                  className="flex-1 bg-transparent text-[15px] leading-7 text-foreground placeholder:text-muted/60"
                />
                {reflections.length > 1 && (
                  <button
                    onClick={() => removeReflection(index)}
                    className="shrink-0 pt-0.5 text-muted opacity-0 transition-opacity group-hover:opacity-100 active:opacity-100"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}

            {/* 느낀점 추가 버튼 */}
            <button
              onClick={addReflection}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted transition-colors active:bg-card"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              느낀점 추가
            </button>
          </section>
        </main>

        {/* 하단 고정 저장 버튼 */}
        <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-background/80 px-5 py-4 backdrop-blur-xl">
          <button className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-background transition-transform active:scale-[0.98]">
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
