import { fetchAcledSignals } from "@/lib/sources/acled";
import { fetchGdeltSignals } from "@/lib/sources/gdelt";
import { fetchTradeSignals } from "@/lib/sources/uncomtrade";
import { fetchWorldBankSignals } from "@/lib/sources/worldbank";
import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

export async function fetchAllSignals(): Promise<{ signals: Signal[]; sources: SourceStatus[] }> {
  const settled = await Promise.allSettled([
    fetchAcledSignals(),
    fetchWorldBankSignals(),
    fetchTradeSignals(),
    fetchGdeltSignals()
  ]);

  const signals: Signal[] = [];
  const sources: SourceStatus[] = [];

  for (const item of settled) {
    if (item.status === "fulfilled") {
      signals.push(...item.value.signals);
      sources.push(item.value.status);
    } else {
      sources.push({
        id: `source-${sources.length}`,
        name: "Unknown source",
        status: "failed",
        recordCount: 0,
        detail: item.reason instanceof Error ? item.reason.message : "Unexpected pipeline failure."
      });
    }
  }

  return { signals, sources };
}
