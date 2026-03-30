export type SourceStatus = {
  id: string;
  name: string;
  status: "used" | "missing" | "failed" | "partial";
  recordCount: number;
  detail: string;
  lastSuccessAt?: string;
};

export type SignalType = "conflict" | "energy" | "trade" | "media" | "macro";

export type Signal = {
  id: string;
  type: SignalType;
  title: string;
  summary: string;
  countries: string[];
  location?: { lat: number; lon: number; radiusKm?: number; label?: string };
  severity: number;
  recencyHours: number;
  trend: "up" | "down" | "stable";
  source: { id: string; name: string; url?: string };
  tags: string[];
  raw?: unknown;
};

export type Top5Category = "tensions" | "fragilities" | "influence" | "correlations" | "watchlist";

export type Top5Item = {
  id: string;
  category: Top5Category;
  title: string;
  explanation: string;
  confidence: number;
  historicalParallel?: string;
  countries: string[];
  coordinates: Array<{ lat: number; lon: number; weight?: number }>;
  factors: string[];
  sourceSignalIds: string[];
};

export type Top5Response = {
  generatedAt: string;
  mode: "live" | "fallback";
  sources: SourceStatus[];
  items: Top5Item[];
};
