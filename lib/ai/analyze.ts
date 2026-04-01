import OpenAI from "openai";
import { z } from "zod";
import { env } from "@/lib/config/env";
import type { SourceStatus, Top5Response } from "@/lib/types/geopolitics";
import type { SignalCluster } from "@/lib/pipeline/cluster";

const schema = z.object({
  items: z.array(z.object({
    id: z.string(),
    category: z.enum(["tensions", "fragilities", "influence", "correlations", "watchlist"]),
    title: z.string(),
    explanation: z.string(),
    confidence: z.number().min(0).max(1),
    historicalParallel: z.string().optional(),
    countries: z.array(z.string()),
    coordinates: z.array(z.object({ lat: z.number(), lon: z.number(), weight: z.number().optional() })),
    factors: z.array(z.string()),
    sourceSignalIds: z.array(z.string())
  })).length(5)
});

function fallback(clusters: SignalCluster[], sources: SourceStatus[]): Top5Response {
  const categories = ["fragilities", "tensions", "watchlist", "correlations", "influence"] as const;
  return {
    generatedAt: new Date().toISOString(),
    mode: "fallback",
    sources,
    items: clusters.slice(0, 5).map((cluster, index) => ({
      id: `fallback-${cluster.id}`,
      category: categories[index],
      title: `Pressure around ${cluster.countries[0] ?? cluster.id}`,
      explanation: `Classifica di fallback basata su concentrazione di segnali, recenza e severità. Punteggio cluster ${cluster.score.toFixed(1)}.`,
      confidence: 0.32,
      historicalParallel: "Confronto storico non disponibile in fallback.",
      countries: cluster.countries,
      coordinates: [{ lat: cluster.centroid.lat, lon: cluster.centroid.lon, weight: 1 }],
      factors: [...new Set(cluster.signals.map((s) => `${s.type}:${s.source.name}`))].slice(0, 5),
      sourceSignalIds: cluster.signals.map((s) => s.id).slice(0, 12)
    })),
    countryHotspots: [],
    connections: []
  };
}

export async function analyzeTop5(clusters: SignalCluster[], sources: SourceStatus[]): Promise<Top5Response> {
  if (!env.OPENAI_API_KEY) return fallback(clusters, sources);

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const payload = clusters.slice(0, 12).map((cluster) => ({
    id: cluster.id,
    centroid: cluster.centroid,
    countries: cluster.countries,
    score: cluster.score,
    signals: cluster.signals.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      summary: s.summary,
      countries: s.countries,
      severity: s.severity,
      recencyHours: s.recencyHours,
      trend: s.trend,
      source: s.source.name,
      tags: s.tags
    }))
  }));

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: [{
          type: "input_text",
          text: "You are the analytical core of a geopolitics application for journalists and analysts. Use only the supplied clusters and sources. Produce exactly five ranked findings. Favor energy, chokepoints, systemic fragility, influence shifts, and cross-region causal links. Be specific, concise, and non-generic. Never invent facts outside the payload."
        }]
      },
      {
        role: "user",
        content: [{
          type: "input_text",
          text: `Sources:\n${JSON.stringify(sources, null, 2)}\n\nClusters:\n${JSON.stringify(payload, null, 2)}\n\nReturn JSON only.`
        }]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "geopulse_top5",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            items: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string" },
                  category: { type: "string", enum: ["tensions", "fragilities", "influence", "correlations", "watchlist"] },
                  title: { type: "string" },
                  explanation: { type: "string" },
                  confidence: { type: "number" },
                  historicalParallel: { type: "string" },
                  countries: { type: "array", items: { type: "string" } },
                  coordinates: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        lat: { type: "number" },
                        lon: { type: "number" },
                        weight: { type: "number" }
                      },
                      required: ["lat", "lon"]
                    }
                  },
                  factors: { type: "array", items: { type: "string" } },
                  sourceSignalIds: { type: "array", items: { type: "string" } }
                },
                required: ["id", "category", "title", "explanation", "confidence", "countries", "coordinates", "factors", "sourceSignalIds"]
              }
            }
          },
          required: ["items"]
        }
      }
    }
  });

  const parsed = schema.parse(JSON.parse(response.output_text));
  return { generatedAt: new Date().toISOString(), mode: "live", sources, items: parsed.items, countryHotspots: [], connections: [] };
}
