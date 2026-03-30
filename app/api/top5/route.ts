import { NextResponse } from "next/server";
import { analyzeTop5 } from "@/lib/ai/analyze";
import { clusterSignals } from "@/lib/pipeline/cluster";
import { fetchAllSignals } from "@/lib/pipeline/fetchAll";

export const revalidate = 600;

export async function GET() {
  const { signals, sources } = await fetchAllSignals();
  const clusters = clusterSignals(signals);
  const top5 = await analyzeTop5(clusters, sources);
  return NextResponse.json(top5);
}
