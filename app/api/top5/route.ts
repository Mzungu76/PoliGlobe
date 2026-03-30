import { NextResponse } from "next/server";
import { buildTop5 } from "@/lib/pipeline/run";

export const revalidate = 600;

export async function GET() {
  const data = await buildTop5(false);
  return NextResponse.json(data);
}
