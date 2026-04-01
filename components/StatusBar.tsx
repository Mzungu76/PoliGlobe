import type { SourceStatus } from "@/lib/types/geopolitics";

export function StatusBar({ generatedAt, mode, sources, hotspotCount }: { generatedAt: string; mode: string; sources: SourceStatus[]; hotspotCount: number }) {
  return (
    <div className="panel" style={{ position: "absolute", left: 18, bottom: 18, right: 18, zIndex: 20, borderRadius: 18, padding: 12, display: "flex", alignItems: "center", gap: 12, overflowX: "auto" }}>
      <div className="badge">{mode.toUpperCase()}</div>
      <div className="badge">Hotspot paese {hotspotCount}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>{new Date(generatedAt).toLocaleString()}</div>
      {sources.map((source) => (
        <div key={source.id} className="badge" title={source.detail}>{source.name}: {source.status} · {source.recordCount}</div>
      ))}
    </div>
  );
}
