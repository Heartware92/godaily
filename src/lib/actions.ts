"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDiary(content: string, reflections: string[]) {
  const supabase = await createClient();
  const { error } = await supabase.from("diaries").insert({
    content,
    reflections,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateDiary(
  id: string,
  content: string,
  reflections: string[]
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("diaries")
    .update({ content, reflections })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/diary/${id}`);
}

export async function deleteDiary(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("diaries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function getDiaries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getDiary(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
