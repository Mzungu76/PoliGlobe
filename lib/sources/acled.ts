import { env } from "@/lib/config/env";
import type { Signal, SourceStatus } from "@/lib/types/geopolitics";

const ACLED_ENDPOINT = "https://acleddata.com/api/acled/read";

export async function fetchAcledSignals(): Promise<{ signals: Signal[]; status: SourceStatus }> {
  if (!env.ACLED_API_KEY || !env.ACLED_EMAIL) {
    return {
      signals: [],
      status: { id: "acled", name: "ACLED", status: "missing", recordCount: 0, detail: "Credenziali ACLED assenti." }
    };
  }

  try {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10);
    const url = new URL(ACLED_ENDPOINT);
    url.searchParams.set("key", env.ACLED_API_KEY);
    url.searchParams.set("email", env.ACLED_EMAIL);
    url.searchParams.set("event_date", since);
    url.searchParams.set("event_date_where", ">=");
    url.searchParams.set("limit", "100");

    const res = await fetch(url.toString(), { next: { revalidate: 900 } });
    if (!res.ok) {
      return {
        signals: [],
        status: { id: "acled", name: "ACLED", status: "failed", recordCount: 0, detail: `HTTP ${res.status} da ACLED.` }
      };
    }
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    const signals: Signal[] = rows.flatMap((row: Record<string, unknown>, idx: number) => {
      const lat = Number(row.latitude);
      const lon = Number(row.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];
      const iso = String(row.iso ?? row.iso3 ?? "UNK");
      const eventDate = String(row.event_date ?? since);
      const recencyHours = Math.max(1, Math.round((Date.now() - new Date(eventDate).getTime()) / 36e5));
      const fatalities = Number(row.fatalities ?? 0);
      return [{
        id: `acled-${idx}-${eventDate}-${iso}`,
        type: "conflict",
        title: String(row.event_type ?? "Conflict event"),
        summary: String(row.notes ?? row.sub_event_type ?? "No description available."),
        countries: [iso],
        location: { lat, lon, radiusKm: 90, label: String(row.location ?? iso) },
        severity: Math.min(100, 35 + fatalities * 8),
        recencyHours,
        trend: "up",
        source: { id: "acled", name: "ACLED", url: "https://acleddata.com/api-documentation/getting-started" },
        tags: [String(row.disorder_type ?? "disorder"), String(row.event_type ?? "event")],
        raw: row
      }];
    });

    return {
      signals,
      status: {
        id: "acled",
        name: "ACLED",
        status: signals.length ? "used" : "partial",
        recordCount: signals.length,
        detail: signals.length ? "Eventi di conflitto recenti acquisiti." : "Nessun evento geolocalizzato nel periodo.",
        lastSuccessAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      signals: [],
      status: { id: "acled", name: "ACLED", status: "failed", recordCount: 0, detail: error instanceof Error ? error.message : "Errore sconosciuto ACLED." }
    };
  }
}
