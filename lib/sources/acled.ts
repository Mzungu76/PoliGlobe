import { env } from "@/lib/config/env";
import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

const ACLED_ENDPOINT = "https://acleddata.com/api/acled/read";

export async function fetchAcledSignals(): Promise<{ signals: Signal[]; status: SourceStatus }> {
  if (!env.ACLED_API_KEY || !env.ACLED_EMAIL) {
    return {
      signals: [],
      status: {
        id: "acled",
        name: "ACLED",
        status: "missing",
        recordCount: 0,
        detail: "ACLED credentials missing in environment."
      }
    };
  }

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10);
  const url = new URL(ACLED_ENDPOINT);
  url.searchParams.set("key", env.ACLED_API_KEY);
  url.searchParams.set("email", env.ACLED_EMAIL);
  url.searchParams.set("event_date", since);
  url.searchParams.set("event_date_where", ">=");
  url.searchParams.set("limit", "100");

  const response = await fetch(url.toString(), { next: { revalidate: 900 } });
  if (!response.ok) {
    return {
      signals: [],
      status: {
        id: "acled",
        name: "ACLED",
        status: "failed",
        recordCount: 0,
        detail: `ACLED request failed with ${response.status}.`
      }
    };
  }

  const json = await response.json();
  const rows: Array<Record<string, unknown>> = json?.data ?? [];

  const signals: Signal[] = rows.map((row, index) => {
    const lat = Number(row.latitude ?? 0);
    const lon = Number(row.longitude ?? 0);
    const iso = String(row.iso ?? row.iso3 ?? "UNK");
    const eventDate = String(row.event_date ?? since);
    const recencyHours = Math.max(1, Math.round((Date.now() - new Date(eventDate).getTime()) / 36e5));
    const fatalities = Number(row.fatalities ?? 0);

    return {
      id: `acled-${index}-${eventDate}-${iso}`,
      type: "conflict",
      title: String(row.event_type ?? "Conflict event"),
      summary: String(row.notes ?? row.sub_event_type ?? "No description available."),
      countries: [iso],
      location: Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon, radiusKm: 80, label: String(row.location ?? iso) } : undefined,
      severity: Math.min(100, 35 + fatalities * 10),
      recencyHours,
      trend: "up",
      source: {
        id: "acled",
        name: "ACLED",
        status: "live",
        updatedAt: new Date().toISOString(),
        url: "https://acleddata.com/acled-api-documentation"
      },
      tags: [String(row.disorder_type ?? "disorder"), String(row.event_type ?? "event")],
      raw: row
    };
  });

  return {
    signals,
    status: {
      id: "acled",
      name: "ACLED",
      status: "used",
      recordCount: signals.length,
      detail: signals.length ? "Conflict events ingested successfully." : "No recent conflict rows returned.",
      lastSuccessAt: new Date().toISOString()
    }
  };
}
