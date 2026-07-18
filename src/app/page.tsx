import { getDiaries } from "@/lib/actions";
import Calendar from "@/components/Calendar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const diaries = await getDiaries();

  return (
    <main className="mx-auto flex max-w-6xl flex-col px-5 py-6 md:px-8 md:py-10 lg:min-h-[calc(100vh-4rem)] lg:justify-center">
      <Calendar diaries={diaries} />
    </main>
  );
}
