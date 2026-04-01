import { analyzeTop5 } from "@/lib/ai/analyze";
import { readCachedTop5, writeCachedTop5 } from "@/lib/cache/store";
import { clusterSignals } from "@/lib/pipeline/cluster";
import { fetchAllSignals } from "@/lib/pipeline/fetchAll";
import { deriveCountryHotspots } from "@/lib/pipeline/hotspots";
import type { Top5Response } from "@/lib/types/geopolitics";

export async function buildTop5(force = false): Promise<Top5Response> {
  if (!force) {
    const cached = await readCachedTop5();
    if (cached) return cached;
  }

  const { signals, sources } = await fetchAllSignals();
  const clusters = clusterSignals(signals);
  const payload = await analyzeTop5(clusters, sources);
  const { countryHotspots, connections } = deriveCountryHotspots(payload.items);
  const enriched: Top5Response = {
    ...payload,
    countryHotspots,
    connections,
  };
  await writeCachedTop5(enriched);
  return enriched;
}
