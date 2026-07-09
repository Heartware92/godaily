import DiaryForm from "@/components/DiaryForm";
import FreeDiaryForm from "@/components/FreeDiaryForm";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; type?: string }>;
}) {
  const { date, type } = await searchParams;
  if (type === "free") {
    return <FreeDiaryForm date={date} />;
  }
  return <DiaryForm date={date} />;
}
