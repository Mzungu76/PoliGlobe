export type SignalType =
  | "conflict"
  | "energy"
  | "trade"
  | "macro"
  | "logistics"
  | "news";

export type Signal = {
  id: string;
  type: SignalType;
  title: string;
  summary: string;
  countries: string[];
  location?: {
    lat: number;
    lon: number;
    radiusKm?: number;
    label?: string;
  };
  severity: number; // 0-100 normalized
  recencyHours: number;
  trend: "up" | "down" | "flat";
  source: {
    id: string;
    name: string;
    updatedAt?: string;
    status: "live" | "fallback" | "unavailable";
    url?: string;
  };
  raw?: Record<string, unknown>;
  tags?: string[];
};

export type SourceStatus = {
  id: string;
  name: string;
  status: "used" | "missing" | "failed";
  recordCount: number;
  detail: string;
  lastSuccessAt?: string;
};

export type Top5Category =
  | "tensions"
  | "fragilities"
  | "influence"
  | "correlations"
  | "watchlist";

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
