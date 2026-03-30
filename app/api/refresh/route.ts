import { NextResponse } from "next/server";
import { buildTop5 } from "@/lib/pipeline/run";

export async function POST() {
  const data = await buildTop5(true);
  return NextResponse.json({ ok: true, generatedAt: data.generatedAt, mode: data.mode });
}
