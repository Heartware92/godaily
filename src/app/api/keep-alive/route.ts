import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 무료 Supabase 프로젝트가 1주 미사용 시 자동 정지되는 것을 막기 위한
// 가벼운 헬스체크. vercel.json에 등록된 크론이 매일 이 엔드포인트를 호출한다.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    // 실제로 DB를 한 번 건드려야 "활동"으로 집계되어 자동 정지 타이머가 리셋됨
    const { count, error } = await supabase
      .from("diaries")
      .select("id", { count: "exact", head: true });
    if (error) throw error;
    return NextResponse.json({
      ok: true,
      count: count ?? 0,
      ts: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
