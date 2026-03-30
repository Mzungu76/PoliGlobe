import { env } from "@/lib/config/env";
import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

const indicators = [
  "EG.IMP.CONS.ZS", // energy imports, net % of energy use
  "EG.USE.PCAP.KG.OE", // energy use per capita
  "NY.GDP.MKTP.CD" // gdp current usd
];

export async function fetchWorldBankSignals(): Promise<{ signals: Signal[]; status: SourceStatus }> {
  const allSignals: Signal[] = [];

  for (const indicator of indicators) {
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&per_page=200&source=${env.WORLD_BANK_SOURCE_ID}`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) {
      continue;
    }
    const json = (await response.json()) as [unknown, Array<Record<string, unknown>>];
    const rows = Array.isArray(json?.[1]) ? json[1] : [];

    for (const row of rows.slice(0, 120)) {
      if (row.value == null || row.countryiso3code == null) continue;
      const country = String(row.countryiso3code);
      allSignals.push({
        id: `wb-${indicator}-${country}-${String(row.date)}`,
        type: indicator.startsWith("EG.") ? "energy" : "macro",
        title: String(row.indicator?.value ?? indicator),
        summary: `${country} ${indicator} at ${row.value} (${row.date}).`,
        countries: [country],
        severity: indicator === "EG.IMP.CONS.ZS" ? Math.min(100, Number(row.value)) : 20,
        recencyHours: 24 * 30,
        trend: "flat",
        source: {
          id: "worldbank",
          name: "World Bank",
          status: "live",
          updatedAt: new Date().toISOString(),
          url: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation"
        },
        raw: row
      });
    }
  }

  return {
    signals: allSignals,
    status: {
      id: "worldbank",
      name: "World Bank",
      status: allSignals.length ? "used" : "failed",
      recordCount: allSignals.length,
      detail: allSignals.length ? "Macro and energy indicators fetched." : "World Bank returned no usable rows.",
      lastSuccessAt: allSignals.length ? new Date().toISOString() : undefined
    }
  };
}
