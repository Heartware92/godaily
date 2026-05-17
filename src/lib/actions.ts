"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDiary(
  content: string,
  reflections: string[],
  date?: string
) {
  const supabase = await createClient();
  const insertData: Record<string, unknown> = { content, reflections };
  if (date) {
    insertData.created_at = new Date(date + "T12:00:00").toISOString();
  }
  const { error } = await supabase.from("diaries").insert(insertData);
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

export interface SearchMatch {
  diary: {
    id: string;
    content: string;
    reflections: string[];
    created_at: string;
  };
  contentMatched: boolean;
  reflectionMatched: boolean;
  contentSnippet: string | null;
  reflectionSnippet: string | null;
  terms: string[];
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makeSnippet(
  text: string,
  terms: string[],
  radius = 40
): string | null {
  if (!text) return null;
  const pattern = terms.map(escapeRegex).join("|");
  const regex = new RegExp(pattern, "i");
  const m = regex.exec(text);
  if (!m) return null;
  const start = Math.max(0, m.index - radius);
  const end = Math.min(text.length, m.index + m[0].length + radius);
  let snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < text.length) snippet = snippet + "…";
  return snippet;
}

function matchesAll(text: string, terms: string[]): boolean {
  if (!text) return false;
  return terms.every((t) =>
    new RegExp(escapeRegex(t), "i").test(text)
  );
}

export async function searchDiaries(query: string): Promise<SearchMatch[]> {
  const q = query.trim();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diaries")
    .select("id, content, reflections, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const results: SearchMatch[] = [];
  for (const row of data ?? []) {
    const content: string = row.content ?? "";
    const reflections: string[] = Array.isArray(row.reflections)
      ? row.reflections.filter((r): r is string => typeof r === "string")
      : [];
    const reflectionsText = reflections.join("\n");

    const contentMatched = matchesAll(content, terms);
    const reflectionMatched = matchesAll(reflectionsText, terms);

    if (!contentMatched && !reflectionMatched) continue;

    results.push({
      diary: {
        id: row.id,
        content,
        reflections,
        created_at: row.created_at,
      },
      contentMatched,
      reflectionMatched,
      contentSnippet: contentMatched ? makeSnippet(content, terms) : null,
      reflectionSnippet: reflectionMatched
        ? makeSnippet(reflectionsText, terms)
        : null,
      terms,
    });
  }
  return results;
}
