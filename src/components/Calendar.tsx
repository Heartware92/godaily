"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";

interface DiaryBlock {
  content: string;
  reflection: string;
}

interface DiaryEntry {
  id: string;
  content: string;
  reflections: string[];
  blocks: DiaryBlock[] | null;
  entry_type: "video" | "free";
  memo: string;
  created_at: string;
}

function getPreview(d: DiaryEntry): { main: string; sub: string } {
  if (d.entry_type === "free") {
    const content = d.content?.trim();
    const memo = d.memo?.trim();
    return {
      main: content || memo || "(내용 없음)",
      sub: content && memo ? memo : "",
    };
  }
  if (Array.isArray(d.blocks) && d.blocks.length > 0) {
    const first = d.blocks.find((b) => b.content?.trim() || b.reflection?.trim());
    return {
      main: first?.content?.trim() || first?.reflection?.trim() || "(내용 없음)",
      sub:
        d.blocks.length > 1
          ? `기록 ${d.blocks.length}개`
          : (first?.content?.trim() && first?.reflection?.trim()) || "",
    };
  }
  return {
    main: d.content || "(내용 없음)",
    sub:
      d.reflections?.length > 0 && d.reflections.some((r) => r.trim())
        ? d.reflections.join("\n")
        : "",
  };
}

export default function Calendar({ diaries }: { diaries: DiaryEntry[] }) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const diaryDates = new Set(
    diaries.map((d) => format(new Date(d.created_at), "yyyy-MM-dd"))
  );

  const selectedDiaries = diaries.filter(
    (d) =>
      format(new Date(d.created_at), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="animate-fade-in-up w-full lg:grid lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:items-start lg:gap-10">
      {/* 캘린더 */}
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm md:p-6">
        {/* 월 네비게이션 */}
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-background active:bg-background md:h-9 md:w-9"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-foreground md:text-base">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-background active:bg-background md:h-9 md:w-9"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className="mb-1 grid grid-cols-7">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={`py-1 text-center text-[11px] font-medium md:text-xs ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div
          key={format(currentMonth, "yyyy-MM")}
          className="animate-fade-in grid grid-cols-7"
        >
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const hasDiary = diaryDates.has(dateStr);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = isSameDay(day, selectedDate);
            const today = isToday(day);
            const dayOfWeek = day.getDay();

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(day)}
                className={`relative flex flex-col items-center py-1.5 transition-colors md:py-2 ${
                  !isCurrentMonth ? "opacity-20" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] transition-all duration-200 md:h-11 md:w-11 md:text-[15px] ${
                    isSelected
                      ? "animate-pop bg-brand font-bold text-brand-foreground shadow-md shadow-brand/30"
                      : today
                        ? "font-bold text-brand ring-1 ring-inset ring-brand/40"
                        : dayOfWeek === 0
                          ? "text-red-400 hover:bg-background"
                          : dayOfWeek === 6
                            ? "text-blue-400 hover:bg-background"
                            : "text-foreground hover:bg-background"
                  }`}
                >
                  {format(day, "d")}
                </div>
                {hasDiary && isCurrentMonth && (
                  <div
                    className={`absolute bottom-0 h-1 w-1 rounded-full transition-colors ${
                      isSelected ? "bg-brand" : "bg-brand/60"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜 */}
      <div className="mt-6 lg:mt-0">
        <div className="mb-3 flex items-center justify-between md:mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted md:text-sm">
            {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                router.push(
                  `/write?date=${format(selectedDate, "yyyy-MM-dd")}&type=free`
                )
              }
              className="flex items-center gap-1 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-brand-foreground shadow-sm transition-all hover:opacity-90 active:scale-95"
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
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              일기
            </button>
            <button
              onClick={() =>
                router.push(`/write?date=${format(selectedDate, "yyyy-MM-dd")}`)
              }
              className="flex items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-all hover:border-foreground/30 active:scale-95"
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
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              영상 기록
            </button>
          </div>
        </div>

        {selectedDiaries.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center lg:min-h-[360px]">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-3 text-muted/50"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <p className="text-sm text-muted">이 날의 기록이 없어요</p>
            <p className="mt-1 text-xs text-muted/70">
              위 버튼으로 새 기록을 남겨보세요
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDiaries.map((diary, i) => {
              const preview = getPreview(diary);
              return (
                <Link
                  key={diary.id}
                  href={`/diary/${diary.id}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="stagger block rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md active:bg-background"
                >
                  <span
                    className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      diary.entry_type === "free"
                        ? "bg-brand-soft text-brand"
                        : "bg-blue-400/15 text-blue-400"
                    }`}
                  >
                    {diary.entry_type === "free" ? "일기" : "영상 기록"}
                  </span>
                  <p className="line-clamp-3 text-[15px] leading-7 text-foreground">
                    {preview.main}
                  </p>
                  {preview.sub && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
                      {preview.sub}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted">
                    {format(new Date(diary.created_at), "a h:mm", { locale: ko })}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
