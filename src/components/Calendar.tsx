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

interface DiaryEntry {
  id: string;
  content: string;
  reflections: string[];
  created_at: string;
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
    <div>
      {/* 캘린더 */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        {/* 월 네비게이션 */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors active:bg-background"
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
          <h2 className="text-sm font-semibold text-foreground">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors active:bg-background"
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
              className={`py-1 text-center text-[11px] font-medium ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-muted"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7">
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
                className={`relative flex flex-col items-center py-1.5 transition-colors ${
                  !isCurrentMonth ? "opacity-20" : ""
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] ${
                    isSelected
                      ? "bg-primary font-bold text-background"
                      : today
                        ? "font-bold text-primary"
                        : dayOfWeek === 0
                          ? "text-red-400"
                          : dayOfWeek === 6
                            ? "text-blue-400"
                            : "text-foreground"
                  }`}
                >
                  {format(day, "d")}
                </div>
                {hasDiary && isCurrentMonth && (
                  <div
                    className={`absolute bottom-0.5 h-1 w-1 rounded-full ${
                      isSelected ? "bg-background" : "bg-primary"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 날짜 */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
          </p>
          <button
            onClick={() =>
              router.push(`/write?date=${format(selectedDate, "yyyy-MM-dd")}`)
            }
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-background transition-transform active:scale-95"
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            일기 쓰기
          </button>
        </div>

        {selectedDiaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted">이 날의 일기가 없어요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDiaries.map((diary) => (
              <Link
                key={diary.id}
                href={`/diary/${diary.id}`}
                className="block rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors active:bg-background"
              >
                <p className="line-clamp-3 text-[15px] leading-7 text-foreground">
                  {diary.content || "(내용 없음)"}
                </p>
                {diary.reflections?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {diary.reflections.slice(0, 3).map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-xs text-muted"
                      >
                        <span className="font-bold text-primary">{i + 1}</span>
                        <span className="max-w-[120px] truncate">{r}</span>
                      </span>
                    ))}
                    {diary.reflections.length > 3 && (
                      <span className="inline-flex items-center rounded-full bg-background px-2.5 py-1 text-xs text-muted">
                        +{diary.reflections.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted">
                  {format(new Date(diary.created_at), "a h:mm", { locale: ko })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
