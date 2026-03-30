import OpenAI from "openai";
import { z } from "zod";
import { env } from "@/lib/config/env";
import type { SourceStatus, Top5Response } from "@/lib/types/geopolitics";
import type { SignalCluster } from "@/lib/pipeline/cluster";

const outputSchema = z.object({
  items: z.array(
    z.object({
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
    })
  ).length(5)
});

function buildFallback(clusters: SignalCluster[], sources: SourceStatus[]): Top5Response {
  const items = clusters.slice(0, 5).map((cluster, index) => ({
    id: `fallback-${index}`,
    category: ["fragilities", "tensions", "watchlist", "correlations", "influence"][index] as Top5Response["items"][number]["category"],
    title: `Signal concentration around ${cluster.countries.slice(0, 3).join(", ") || cluster.id}`,
    explanation: `Fallback ranking generated because OpenAI is not configured. Cluster score ${cluster.score.toFixed(1)} based on severity, recency and source overlap.`,
    confidence: 0.35,
    historicalParallel: "Historical comparison unavailable in fallback mode.",
    countries: cluster.countries,
    coordinates: [{ lat: cluster.centroid.lat, lon: cluster.centroid.lon, weight: 1 }],
    factors: [...new Set(cluster.signals.map((s) => `${s.type}:${s.source.name}`))].slice(0, 5),
    sourceSignalIds: cluster.signals.map((s) => s.id).slice(0, 12)
  }));

  return {
    generatedAt: new Date().toISOString(),
    mode: "fallback",
    sources,
    items
  };
}

export async function analyzeTop5(clusters: SignalCluster[], sources: SourceStatus[]): Promise<Top5Response> {
  if (!env.OPENAI_API_KEY) return buildFallback(clusters, sources);

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const clusterPayload = clusters.slice(0, 20).map((cluster) => ({
    id: cluster.id,
    centroid: cluster.centroid,
    countries: cluster.countries,
    score: cluster.score,
    signalCount: cluster.signals.length,
    signals: cluster.signals.slice(0, 12).map((signal) => ({
      id: signal.id,
      type: signal.type,
      title: signal.title,
      summary: signal.summary,
      countries: signal.countries,
      severity: signal.severity,
      recencyHours: signal.recencyHours,
      trend: signal.trend,
      source: signal.source.name,
      location: signal.location,
      tags: signal.tags
    }))
  }));

  const response = await client.responses.create({
    model: env.OPENAI_MODEL,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are the analytical core of a geopolitics application for journalists and analysts. Use only the supplied signals. Return exactly 5 items. Prioritize structural interpretation, cross-signal causality, chokepoints, energy exposure, shifts in influence, and emerging fragility. Do not invent external facts. If evidence is weak, lower confidence."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Sources:\n${JSON.stringify(sources, null, 2)}\n\nClusters:\n${JSON.stringify(clusterPayload, null, 2)}\n\nReturn JSON matching the schema.`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "top5_geopolitics",
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

  const rawText = response.output_text;
  const parsed = outputSchema.parse(JSON.parse(rawText));

  return {
    generatedAt: new Date().toISOString(),
    mode: "live",
    sources,
    items: parsed.items
  };
}
