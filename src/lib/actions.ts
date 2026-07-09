"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DiaryBlock } from "@/types/diary";

export async function createDiary(
  content: string,
  reflections: string[],
  date?: string,
  blocks?: DiaryBlock[]
) {
  const supabase = await createClient();
  const insertData: Record<string, unknown> = blocks
    ? { content: "", reflections: [], blocks }
    : { content, reflections };
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
  reflections: string[],
  blocks?: DiaryBlock[]
) {
  const supabase = await createClient();
  const updateData: Record<string, unknown> = blocks
    ? { content: "", reflections: [], blocks }
    : { content, reflections };
  const { error } = await supabase
    .from("diaries")
    .update(updateData)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath(`/diary/${id}`);
}

export async function createFreeDiary(content: string, date?: string) {
  const supabase = await createClient();
  const insertData: Record<string, unknown> = {
    content,
    reflections: [],
    entry_type: "free",
  };
  if (date) {
    insertData.created_at = new Date(date + "T12:00:00").toISOString();
  }
  const { error } = await supabase.from("diaries").insert(insertData);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/journal");
}

export async function updateFreeDiary(id: string, content: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("diaries")
    .update({ content })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/journal");
  revalidatePath(`/diary/${id}`);
}

export async function deleteDiary(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("diaries").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/journal");
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

export async function getFreeDiaries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diaries")
    .select("id, content, created_at")
    .eq("entry_type", "free")
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

export interface SearchHit {
  field: "content" | "reflection" | "free";
  index: number | null;
  snippet: string;
}

export interface SearchMatch {
  diary: {
    id: string;
    created_at: string;
    entry_type: "video" | "free";
  };
  hits: SearchHit[];
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
  return terms.every((t) => new RegExp(escapeRegex(t), "i").test(text));
}

export async function searchDiaries(query: string): Promise<SearchMatch[]> {
  const q = query.trim();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diaries")
    .select("id, content, reflections, blocks, entry_type, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const results: SearchMatch[] = [];
  for (const row of data ?? []) {
    const hits: SearchHit[] = [];

    const blocks: DiaryBlock[] | null = Array.isArray(row.blocks)
      ? (row.blocks as DiaryBlock[])
      : null;

    if (row.entry_type === "free") {
      const content: string = row.content ?? "";
      if (matchesAll(content, terms)) {
        const snip = makeSnippet(content, terms);
        if (snip) hits.push({ field: "free", index: null, snippet: snip });
      }
    } else if (blocks && blocks.length > 0) {
      blocks.forEach((b, i) => {
        const c = typeof b?.content === "string" ? b.content : "";
        const r = typeof b?.reflection === "string" ? b.reflection : "";
        if (matchesAll(c, terms)) {
          const snip = makeSnippet(c, terms);
          if (snip) hits.push({ field: "content", index: i, snippet: snip });
        }
        if (matchesAll(r, terms)) {
          const snip = makeSnippet(r, terms);
          if (snip) hits.push({ field: "reflection", index: i, snippet: snip });
        }
      });
    } else {
      const content: string = row.content ?? "";
      const reflections: string[] = Array.isArray(row.reflections)
        ? row.reflections.filter((r): r is string => typeof r === "string")
        : [];
      const reflectionsText = reflections.join("\n");

      if (matchesAll(content, terms)) {
        const snip = makeSnippet(content, terms);
        if (snip) hits.push({ field: "content", index: null, snippet: snip });
      }
      if (matchesAll(reflectionsText, terms)) {
        const snip = makeSnippet(reflectionsText, terms);
        if (snip)
          hits.push({ field: "reflection", index: null, snippet: snip });
      }
    }

    if (hits.length === 0) continue;

    results.push({
      diary: {
        id: row.id,
        created_at: row.created_at,
        entry_type: row.entry_type === "free" ? "free" : "video",
      },
      hits,
      terms,
    });
  }
  return results;
}
