import { promises as fs } from "fs";
import path from "path";
import type { Top5Response } from "@/lib/types/geopolitics";

const cachePath = path.join(process.cwd(), "data", "latest-top5.json");

export async function readCachedTop5(): Promise<Top5Response | null> {
  try {
    const raw = await fs.readFile(cachePath, "utf8");
    return JSON.parse(raw) as Top5Response;
  } catch {
    return null;
  }
}

export async function writeCachedTop5(payload: Top5Response): Promise<void> {
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, JSON.stringify(payload, null, 2), "utf8");
}
