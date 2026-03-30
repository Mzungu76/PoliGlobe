import { env } from "@/lib/config/env";
import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

export async function fetchComtradeSignals(): Promise<{ signals: Signal[]; status: SourceStatus }> {
  if (!env.UNCOMTRADE_API_KEY) {
    return {
      signals: [],
      status: { id: "uncomtrade", name: "UN Comtrade", status: "missing", recordCount: 0, detail: "API key UN Comtrade assente." }
    };
  }

  try {
    const url = "https://comtradeapi.worldbank.org/data/v1/get/C/A/HS?reporterCode=all&partnerCode=0&cmdCode=27&flowCode=M&period=2024&maxRecords=100";
    const res = await fetch(url, {
      headers: { "subscription-key": env.UNCOMTRADE_API_KEY },
      next: { revalidate: 86400 }
    });
    if (!res.ok) {
      return {
        signals: [],
        status: { id: "uncomtrade", name: "UN Comtrade", status: "failed", recordCount: 0, detail: `HTTP ${res.status} da UN Comtrade.` }
      };
    }
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    const signals: Signal[] = rows.slice(0, 100).map((row: Record<string, unknown>, idx: number) => ({
      id: `comtrade-${idx}-${String(row.reporterCode ?? "xx")}`,
      type: "trade",
      title: `${String(row.reporterDesc ?? "Unknown")} energy imports`,
      summary: `Partner world aggregate, commodity code ${String(row.cmdCode ?? "27")}, trade value ${String(row.primaryValue ?? "n/a")}.`,
      countries: [String(row.reporterISO ?? row.reporterCode ?? "UNK")],
      severity: 25,
      recencyHours: 24 * 45,
      trend: "stable",
      source: { id: "uncomtrade", name: "UN Comtrade", url: "https://uncomtrade.org/docs/api/" },
      tags: ["energy-trade", String(row.flowDesc ?? "trade")],
      raw: row
    }));

    return {
      signals,
      status: {
        id: "uncomtrade",
        name: "UN Comtrade",
        status: signals.length ? "used" : "partial",
        recordCount: signals.length,
        detail: signals.length ? "Flussi commerciali energetici acquisiti." : "Nessun flusso energetico disponibile.",
        lastSuccessAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      signals: [],
      status: { id: "uncomtrade", name: "UN Comtrade", status: "failed", recordCount: 0, detail: error instanceof Error ? error.message : "Errore UN Comtrade." }
    };
  }
}
