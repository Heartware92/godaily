import { getDiaries } from "@/lib/actions";
import Calendar from "@/components/Calendar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const diaries = await getDiaries();

  return (
    <div className="flex h-full flex-col items-center bg-background">
      <div className="flex w-full max-w-[430px] flex-1 flex-col">
        {/* 헤더 */}
        <header className="px-5 pt-12 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Godaily
          </h1>
        </header>

        {/* 캘린더 */}
        <main className="flex-1 overflow-y-auto px-5 pb-8 hide-scrollbar">
          <Calendar diaries={diaries} />
        </main>
      </div>
    </div>
  );
}
