import type { Top5Item, CountryHotspot, CountryConnection } from "@/lib/types/geopolitics";

const COUNTRY_META: Record<string, { name: string; lat: number; lon: number }> = {
  USA: { name: "Stati Uniti", lat: 39.8, lon: -98.6 },
  CAN: { name: "Canada", lat: 56.1, lon: -106.3 },
  MEX: { name: "Messico", lat: 23.6, lon: -102.5 },
  BRA: { name: "Brasile", lat: -14.2, lon: -51.9 },
  ARG: { name: "Argentina", lat: -38.4, lon: -63.6 },
  CHL: { name: "Cile", lat: -35.7, lon: -71.5 },
  COL: { name: "Colombia", lat: 4.6, lon: -74.1 },
  GBR: { name: "Regno Unito", lat: 54.5, lon: -2.5 },
  IRL: { name: "Irlanda", lat: 53.2, lon: -8.2 },
  FRA: { name: "Francia", lat: 46.2, lon: 2.2 },
  DEU: { name: "Germania", lat: 51.2, lon: 10.4 },
  ITA: { name: "Italia", lat: 42.8, lon: 12.8 },
  ESP: { name: "Spagna", lat: 40.4, lon: -3.7 },
  PRT: { name: "Portogallo", lat: 39.6, lon: -8.0 },
  NLD: { name: "Paesi Bassi", lat: 52.2, lon: 5.3 },
  BEL: { name: "Belgio", lat: 50.8, lon: 4.4 },
  POL: { name: "Polonia", lat: 52.1, lon: 19.1 },
  UKR: { name: "Ucraina", lat: 49.0, lon: 31.3 },
  RUS: { name: "Russia", lat: 61.5, lon: 105.3 },
  TUR: { name: "Turchia", lat: 39.0, lon: 35.2 },
  IRN: { name: "Iran", lat: 32.0, lon: 53.7 },
  IRQ: { name: "Iraq", lat: 33.2, lon: 43.7 },
  ISR: { name: "Israele", lat: 31.0, lon: 35.0 },
  PSE: { name: "Territori Palestinesi", lat: 31.9, lon: 35.2 },
  SAU: { name: "Arabia Saudita", lat: 24.0, lon: 45.0 },
  ARE: { name: "Emirati Arabi Uniti", lat: 24.3, lon: 54.3 },
  QAT: { name: "Qatar", lat: 25.3, lon: 51.2 },
  EGY: { name: "Egitto", lat: 26.8, lon: 30.8 },
  ETH: { name: "Etiopia", lat: 9.1, lon: 40.5 },
  SDN: { name: "Sudan", lat: 15.6, lon: 32.5 },
  SSD: { name: "Sud Sudan", lat: 7.3, lon: 30.0 },
  MLI: { name: "Mali", lat: 17.6, lon: -3.9 },
  NER: { name: "Niger", lat: 17.6, lon: 8.1 },
  NGA: { name: "Nigeria", lat: 9.1, lon: 8.7 },
  ZAF: { name: "Sudafrica", lat: -30.6, lon: 22.9 },
  IND: { name: "India", lat: 22.6, lon: 79.0 },
  PAK: { name: "Pakistan", lat: 30.4, lon: 69.4 },
  CHN: { name: "Cina", lat: 35.9, lon: 104.2 },
  JPN: { name: "Giappone", lat: 36.2, lon: 138.3 },
  KOR: { name: "Corea del Sud", lat: 36.5, lon: 127.9 },
  PRK: { name: "Corea del Nord", lat: 40.1, lon: 127.5 },
  AUS: { name: "Australia", lat: -25.3, lon: 133.8 },
  NZL: { name: "Nuova Zelanda", lat: -41.5, lon: 172.8 },
  IDN: { name: "Indonesia", lat: -2.4, lon: 117.0 },
  VNM: { name: "Vietnam", lat: 14.1, lon: 108.3 }
};

const CATEGORY_LABEL: Record<Top5Item["category"], string> = {
  tensions: "Tensione",
  fragilities: "Fragilità",
  influence: "Influenza",
  correlations: "Correlazione",
  watchlist: "Da monitorare"
};

function averageCoordinates(item: Top5Item): { lat: number; lon: number } | null {
  if (!item.coordinates.length) return null;
  const lat = item.coordinates.reduce((sum, c) => sum + c.lat, 0) / item.coordinates.length;
  const lon = item.coordinates.reduce((sum, c) => sum + c.lon, 0) / item.coordinates.length;
  return { lat, lon };
}

export function deriveCountryHotspots(items: Top5Item[]): { countryHotspots: CountryHotspot[]; connections: CountryConnection[] } {
  const hotspots = new Map<string, CountryHotspot>();
  const connectionMap = new Map<string, CountryConnection>();

  items.forEach((item, index) => {
    const itemWeight = Math.max(1, 6 - index) * (0.4 + item.confidence);
    const fallbackCoord = averageCoordinates(item);
    const countries = item.countries.length ? item.countries : [];

    countries.forEach((countryCode) => {
      const meta = COUNTRY_META[countryCode] ?? {
        name: countryCode,
        lat: fallbackCoord?.lat ?? 0,
        lon: fallbackCoord?.lon ?? 0,
      };

      const existing = hotspots.get(countryCode);
      const nextScore = (existing?.score ?? 0) + itemWeight;
      const relatedCountries = Array.from(new Set([...(existing?.relatedCountries ?? []), ...countries.filter((c) => c !== countryCode)]));
      const relatedItemIds = Array.from(new Set([...(existing?.relatedItemIds ?? []), item.id]));
      const factors = Array.from(new Set([...(existing?.factors ?? []), ...item.factors])).slice(0, 6);

      const shouldReplaceDominant = !existing || itemWeight > existing.dominantWeight;

      hotspots.set(countryCode, {
        countryCode,
        countryName: meta.name,
        centroid: { lat: meta.lat, lon: meta.lon },
        score: nextScore,
        dominantTitle: shouldReplaceDominant ? item.title : existing.dominantTitle,
        dominantExplanation: shouldReplaceDominant ? item.explanation : existing.dominantExplanation,
        category: shouldReplaceDominant ? item.category : existing.category,
        categoryLabel: shouldReplaceDominant ? CATEGORY_LABEL[item.category] : existing.categoryLabel,
        confidence: shouldReplaceDominant ? item.confidence : existing.confidence,
        factors,
        relatedCountries,
        relatedItemIds,
        dominantWeight: shouldReplaceDominant ? itemWeight : existing.dominantWeight,
      });
    });

    if (countries.length > 1) {
      for (let i = 0; i < countries.length; i += 1) {
        for (let j = i + 1; j < countries.length; j += 1) {
          const a = countries[i];
          const b = countries[j];
          const key = [a, b].sort().join("__");
          const existing = connectionMap.get(key);
          connectionMap.set(key, {
            fromCountry: a,
            toCountry: b,
            strength: Math.min(100, (existing?.strength ?? 0) + itemWeight * 12),
            label: item.title,
          });
        }
      }
    }
  });

  const countryHotspots = Array.from(hotspots.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .map((hotspot) => ({ ...hotspot, score: Math.round(hotspot.score * 10) / 10 }));

  const visibleCodes = new Set(countryHotspots.map((h) => h.countryCode));
  const connections = Array.from(connectionMap.values())
    .filter((c) => visibleCodes.has(c.fromCountry) && visibleCodes.has(c.toCountry))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 20)
    .map((c) => ({ ...c, strength: Math.round(c.strength) }));

  return { countryHotspots, connections };
}
