import type { Signal } from "@/lib/types/geopolitics";

export type SignalCluster = {
  id: string;
  centroid: { lat: number; lon: number };
  countries: string[];
  signals: Signal[];
  score: number;
};

export function clusterSignals(signals: Signal[]): SignalCluster[] {
  const geoSignals = signals.filter((s) => s.location);
  const bins = new Map<string, Signal[]>();

  for (const signal of geoSignals) {
    const latBin = Math.round((signal.location!.lat + 90) / 10);
    const lonBin = Math.round((signal.location!.lon + 180) / 10);
    const key = `${latBin}:${lonBin}`;
    const arr = bins.get(key) ?? [];
    arr.push(signal);
    bins.set(key, arr);
  }

  return Array.from(bins.entries()).map(([id, binSignals]) => {
    const lat = binSignals.reduce((sum, s) => sum + (s.location?.lat ?? 0), 0) / binSignals.length;
    const lon = binSignals.reduce((sum, s) => sum + (s.location?.lon ?? 0), 0) / binSignals.length;
    const score = binSignals.reduce((sum, s) => sum + s.severity * (1 / Math.max(1, s.recencyHours / 24)), 0);
    return {
      id,
      centroid: { lat, lon },
      countries: [...new Set(binSignals.flatMap((s) => s.countries))],
      signals: binSignals,
      score
    };
  }).sort((a, b) => b.score - a.score);
}
