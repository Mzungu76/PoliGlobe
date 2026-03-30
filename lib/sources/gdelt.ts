import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

export async function fetchGdeltSignals(): Promise<{ signals: Signal[]; status: SourceStatus }> {
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", '("energy" OR "oil" OR "gas") AND ("conflict" OR "sanctions" OR "pipeline" OR "shipping")');
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("format", "json");
  url.searchParams.set("maxrecords", "50");
  url.searchParams.set("timespan", "7d");
  url.searchParams.set("sort", "datedesc");

  const response = await fetch(url.toString(), { next: { revalidate: 900 } });
  if (!response.ok) {
    return {
      signals: [],
      status: {
        id: "gdelt",
        name: "GDELT",
        status: "failed",
        recordCount: 0,
        detail: `GDELT request failed with ${response.status}.`
      }
    };
  }

  const json = await response.json();
  const rows: Array<Record<string, unknown>> = json?.articles ?? [];
  const signals: Signal[] = rows.map((row, index) => ({
    id: `gdelt-${index}`,
    type: "news",
    title: String(row.title ?? "Energy-related coverage"),
    summary: String(row.seendate ?? "") + " · " + String(row.sourcecountry ?? "") + " · " + String(row.domain ?? ""),
    countries: row.sourcecountry ? [String(row.sourcecountry)] : [],
    severity: 25,
    recencyHours: 12,
    trend: "up",
    source: {
      id: "gdelt",
      name: "GDELT",
      status: "live",
      updatedAt: new Date().toISOString(),
      url: "https://www.gdeltproject.org/data.html"
    },
    raw: row,
    tags: ["media", "energy"]
  }));

  return {
    signals,
    status: {
      id: "gdelt",
      name: "GDELT",
      status: "used",
      recordCount: signals.length,
      detail: signals.length ? "Near-real-time global coverage fetched." : "No recent GDELT coverage found.",
      lastSuccessAt: new Date().toISOString()
    }
  };
}
