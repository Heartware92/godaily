import DiaryForm from "@/components/DiaryForm";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  return <DiaryForm date={date} />;
}
