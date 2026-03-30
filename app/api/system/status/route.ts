import { NextResponse } from "next/server";
import { readCachedTop5 } from "@/lib/cache/store";

export async function GET() {
  const cached = await readCachedTop5();
  return NextResponse.json({
    ok: true,
    hasSnapshot: Boolean(cached),
    generatedAt: cached?.generatedAt ?? null,
    mode: cached?.mode ?? null,
    sources: cached?.sources ?? []
  });
}
