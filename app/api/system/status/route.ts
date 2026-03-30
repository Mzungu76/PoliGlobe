import { NextResponse } from "next/server";
import { fetchAllSignals } from "@/lib/pipeline/fetchAll";

export const revalidate = 300;

export async function GET() {
  const { signals, sources } = await fetchAllSignals();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    signalCount: signals.length,
    sources
  });
}
