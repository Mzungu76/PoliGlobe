import { fetchAcledSignals } from "@/lib/sources/acled";
import { fetchWorldBankSignals } from "@/lib/sources/worldbank";
import { fetchComtradeSignals } from "@/lib/sources/uncomtrade";
import { fetchGdeltSignals } from "@/lib/sources/gdelt";
import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

export async function fetchAllSignals(): Promise<{ signals: Signal[]; sources: SourceStatus[] }> {
  const results = await Promise.all([
    fetchAcledSignals(),
    fetchWorldBankSignals(),
    fetchComtradeSignals(),
    fetchGdeltSignals()
  ]);

  return {
    signals: results.flatMap((r) => r.signals),
    sources: results.map((r) => r.status)
  };
}
