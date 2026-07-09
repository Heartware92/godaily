import { getDiary } from "@/lib/actions";
import DiaryForm from "@/components/DiaryForm";
import FreeDiaryForm from "@/components/FreeDiaryForm";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diary = await getDiary(id);

  if (diary.entry_type === "free") {
    return <FreeDiaryForm diary={diary} />;
  }
  return <DiaryForm diary={diary} />;
}
