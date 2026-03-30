import type { Signal } from "@/lib/types/geopolitics";

export type SignalCluster = {
  id: string;
  centroid: { lat: number; lon: number };
  countries: string[];
  score: number;
  signals: Signal[];
};

const defaultPoints: Record<string, { lat: number; lon: number }> = {
  USA: { lat: 38, lon: -97 }, CHN: { lat: 35, lon: 103 }, RUS: { lat: 61, lon: 105 },
  IRN: { lat: 32, lon: 53 }, SAU: { lat: 24, lon: 45 }, UKR: { lat: 49, lon: 32 },
  DEU: { lat: 51, lon: 10 }, FRA: { lat: 46, lon: 2 }, IND: { lat: 21, lon: 78 }
};

function scoreSignal(signal: Signal): number {
  return signal.severity + Math.max(0, 72 - signal.recencyHours) * 0.4 + signal.tags.length * 2;
}

export function clusterSignals(signals: Signal[]): SignalCluster[] {
  const buckets = new Map<string, Signal[]>();
  for (const signal of signals) {
    const key = signal.countries[0] ?? "GLOBAL";
    const list = buckets.get(key) ?? [];
    list.push(signal);
    buckets.set(key, list);
  }

  return Array.from(buckets.entries()).map(([country, grouped]) => {
    const located = grouped.filter((s) => s.location);
    const lat = located.length ? located.reduce((a, s) => a + (s.location?.lat ?? 0), 0) / located.length : (defaultPoints[country]?.lat ?? 20);
    const lon = located.length ? located.reduce((a, s) => a + (s.location?.lon ?? 0), 0) / located.length : (defaultPoints[country]?.lon ?? 0);
    return {
      id: `cluster-${country}`,
      centroid: { lat, lon },
      countries: country === "GLOBAL" ? [] : [country],
      score: grouped.reduce((a, s) => a + scoreSignal(s), 0),
      signals: grouped.sort((a, b) => scoreSignal(b) - scoreSignal(a)).slice(0, 15)
    };
  }).sort((a, b) => b.score - a.score).slice(0, 20);
}
