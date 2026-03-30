import { env } from "@/lib/config/env";
import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

const commodityCodes = ["27"]; // mineral fuels

export async function fetchTradeSignals(): Promise<{ signals: Signal[]; status: SourceStatus }> {
  if (!env.UNCOMTRADE_API_KEY) {
    return {
      signals: [],
      status: {
        id: "uncomtrade",
        name: "UN Comtrade",
        status: "missing",
        recordCount: 0,
        detail: "UN Comtrade API key missing in environment."
      }
    };
  }

  const results: Signal[] = [];

  for (const code of commodityCodes) {
    const url = new URL("https://comtradeapi.worldbank.org/data/v1/get/C/A/HS");
    url.searchParams.set("cmdCode", code);
    url.searchParams.set("flowCode", "M,X");
    url.searchParams.set("period", String(new Date().getFullYear() - 1));
    url.searchParams.set("maxRecords", "100");
    url.searchParams.set("subscription-key", env.UNCOMTRADE_API_KEY);

    const response = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!response.ok) continue;
    const json = await response.json();
    const rows: Array<Record<string, unknown>> = json?.data ?? [];

    for (const row of rows) {
      const reporter = String(row.reporterISO ?? row.reporterCode ?? "UNK");
      const partner = String(row.partnerISO ?? row.partnerCode ?? "WLD");
      const value = Number(row.primaryValue ?? 0);
      if (!Number.isFinite(value) || value <= 0) continue;
      results.push({
        id: `trade-${reporter}-${partner}-${code}`,
        type: "trade",
        title: "Fuels trade flow",
        summary: `${reporter} ↔ ${partner} fuel trade flow valued at ${value}.`,
        countries: [reporter, partner],
        severity: Math.min(100, Math.log10(value + 1) * 12),
        recencyHours: 24 * 30,
        trend: "flat",
        source: {
          id: "uncomtrade",
          name: "UN Comtrade",
          status: "live",
          updatedAt: new Date().toISOString(),
          url: "https://comtrade.un.org/"
        },
        raw: row,
        tags: ["fuel", "trade-flow"]
      });
    }
  }

  return {
    signals: results,
    status: {
      id: "uncomtrade",
      name: "UN Comtrade",
      status: results.length ? "used" : "failed",
      recordCount: results.length,
      detail: results.length ? "Fuel trade flows fetched." : "UN Comtrade returned no usable rows.",
      lastSuccessAt: results.length ? new Date().toISOString() : undefined
    }
  };
}
