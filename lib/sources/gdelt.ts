import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

const queries = [
  { q: '(energy OR oil OR gas OR pipeline) sourcelang:english', label: 'Energy disruption media pulse' },
  { q: '(strait OR chokepoint OR shipping OR red sea OR hormuz) sourcelang:english', label: 'Chokepoint media pulse' }
];

export async function fetchGdeltSignals(): Promise<{ signals: Signal[]; status: SourceStatus }> {
  try {
    const signals: Signal[] = [];
    for (let i = 0; i < queries.length; i += 1) {
      const query = queries[i];
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query.q)}&mode=artlist&maxrecords=25&format=json`;
      const res = await fetch(url, { next: { revalidate: 900 } });
      if (!res.ok) continue;
      const json = await res.json();
      const articles = Array.isArray(json?.articles) ? json.articles : [];
      articles.forEach((article: Record<string, unknown>, idx: number) => {
        const tone = Math.abs(Number(article.seendate ?? 0));
        signals.push({
          id: `gdelt-${i}-${idx}`,
          type: "media",
          title: String(article.title ?? query.label),
          summary: String(article.domain ?? "GDELT article signal"),
          countries: [],
          severity: Math.min(100, 15 + tone),
          recencyHours: 12,
          trend: "up",
          source: { id: "gdelt", name: "GDELT", url: "https://www.gdeltproject.org/" },
          tags: [query.label],
          raw: article
        });
      });
    }

    return {
      signals,
      status: {
        id: "gdelt",
        name: "GDELT",
        status: signals.length ? "used" : "partial",
        recordCount: signals.length,
        detail: signals.length ? "Segnali mediatici ad alta frequenza caricati." : "Nessun segnale GDELT disponibile.",
        lastSuccessAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      signals: [],
      status: { id: "gdelt", name: "GDELT", status: "failed", recordCount: 0, detail: error instanceof Error ? error.message : "Errore GDELT." }
    };
  }
}
