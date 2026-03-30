import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

const indicators = [
  "EG.USE.PCAP.KG.OE",
  "EG.ELC.ACCS.ZS",
  "NY.GDP.MKTP.CD",
  "NE.IMP.GNFS.ZS"
];

export async function fetchWorldBankSignals(): Promise<{ signals: Signal[]; status: SourceStatus }> {
  try {
    const requests = indicators.map((indicator) =>
      fetch(`https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json&per_page=80&mrv=1`, {
        next: { revalidate: 86400 }
      }).then((r) => r.json())
    );

    const responses = await Promise.all(requests);
    const signals: Signal[] = [];

    for (const [i, payload] of responses.entries()) {
      const rows = Array.isArray(payload?.[1]) ? payload[1] : [];
      for (const row of rows.slice(0, 20)) {
        if (row?.value == null || !row?.countryiso3code) continue;
        signals.push({
          id: `wb-${indicators[i]}-${row.countryiso3code}`,
          type: "macro",
          title: `${row.indicator?.value ?? indicators[i]} · ${row.country?.value ?? row.countryiso3code}`,
          summary: `Valore ultimo disponibile: ${row.value}`,
          countries: [String(row.countryiso3code)],
          severity: 20,
          recencyHours: 24 * 30,
          trend: "stable",
          source: { id: "worldbank", name: "World Bank", url: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation" },
          tags: [indicators[i], String(row.country?.value ?? row.countryiso3code)],
          raw: row
        });
      }
    }

    return {
      signals,
      status: {
        id: "worldbank",
        name: "World Bank",
        status: signals.length ? "used" : "partial",
        recordCount: signals.length,
        detail: signals.length ? "Indicatori macro e energetici caricati." : "Nessun indicatore utile restituito.",
        lastSuccessAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      signals: [],
      status: { id: "worldbank", name: "World Bank", status: "failed", recordCount: 0, detail: error instanceof Error ? error.message : "Errore World Bank." }
    };
  }
}
