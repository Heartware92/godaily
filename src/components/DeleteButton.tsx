"use client";

import { useRouter } from "next/navigation";
import { deleteDiary } from "@/lib/actions";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("정말 삭제할까요?")) return;
    setDeleting(true);
    try {
      await deleteDiary(id);
      router.push("/");
    } catch {
      alert("삭제에 실패했습니다");
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="w-full rounded-xl border border-red-500/20 bg-red-500/10 py-3.5 text-sm font-semibold text-red-400 transition-transform active:scale-[0.98] disabled:opacity-50"
    >
      {deleting ? "삭제 중..." : "삭제하기"}
    </button>
  );
}
