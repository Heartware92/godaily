import { getDiary } from "@/lib/actions";
import DiaryForm from "@/components/DiaryForm";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const diary = await getDiary(id);

  return <DiaryForm diary={diary} />;
}
