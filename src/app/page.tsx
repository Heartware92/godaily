import { getDiaries } from "@/lib/actions";
import Calendar from "@/components/Calendar";

export const dynamic = "force-dynamic";

export default async function Home() {
  const diaries = await getDiaries();

  return (
    <main className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-10">
      <Calendar diaries={diaries} />
    </main>
  );
}
