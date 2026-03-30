import type { Top5Item } from "@/lib/types/geopolitics";

export function DetailCard({ item }: { item?: Top5Item }) {
  if (!item) return null;

  return (
    <section className="panel" style={{ position: "absolute", right: 18, top: 18, width: 420, borderRadius: 24, padding: 18, zIndex: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#93c5fd", marginBottom: 8 }}>{item.category}</div>
      <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.1 }}>{item.title}</h2>
      <p style={{ marginTop: 12, marginBottom: 16, color: "rgba(255,255,255,0.78)", lineHeight: 1.55 }}>{item.explanation}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div className="badge">Confidenza {(item.confidence * 100).toFixed(0)}%</div>
        <div className="badge">Paesi {item.countries.join(", ") || "n/d"}</div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#7dd3fc", marginBottom: 8 }}>Fattori</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {item.factors.map((factor) => (
            <span className="badge" key={factor}>{factor}</span>
          ))}
        </div>
      </div>
      {item.historicalParallel ? (
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#7dd3fc", marginBottom: 8 }}>Parallelo storico</div>
          <div style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>{item.historicalParallel}</div>
        </div>
      ) : null}
    </section>
  );
}
