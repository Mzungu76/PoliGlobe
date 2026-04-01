import type { CountryHotspot, Top5Item } from "@/lib/types/geopolitics";

export function DetailCard({ hotspot, items }: { hotspot?: CountryHotspot; items: Top5Item[] }) {
  if (!hotspot) return null;

  const relatedItems = items.filter((item) => hotspot.relatedItemIds.includes(item.id)).slice(0, 3);

  return (
    <section className="panel" style={{ position: "absolute", right: 18, top: 18, width: 430, maxHeight: "calc(100vh - 110px)", overflow: "auto", borderRadius: 24, padding: 18, zIndex: 20 }}>
      <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#93c5fd", marginBottom: 8 }}>{hotspot.categoryLabel}</div>
      <h2 style={{ margin: 0, fontSize: 28, lineHeight: 1.1 }}>{hotspot.countryName}</h2>
      <p style={{ marginTop: 12, marginBottom: 16, color: "rgba(255,255,255,0.78)", lineHeight: 1.55 }}>{hotspot.dominantExplanation}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="badge">Tema dominante: {hotspot.dominantTitle}</div>
        <div className="badge">Confidenza {(hotspot.confidence * 100).toFixed(0)}%</div>
        <div className="badge">Paesi collegati {hotspot.relatedCountries.length}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#7dd3fc", marginBottom: 8 }}>Perché è attivo</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {hotspot.factors.map((factor) => (
            <span className="badge" key={factor}>{factor}</span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#7dd3fc", marginBottom: 8 }}>Raggio geopolitico</div>
        <div style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>
          {hotspot.relatedCountries.length
            ? `${hotspot.countryName} è collegato in questa istantanea a ${hotspot.relatedCountries.join(", ")}. Le linee sul globo mostrano i temi condivisi o gli stessi cluster di rischio.`
            : `${hotspot.countryName} al momento appare come hotspot più locale: il tema dominante non genera ancora connessioni forti con altri paesi nella top attuale.`}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#7dd3fc", marginBottom: 8 }}>Schede collegate</div>
        <div style={{ display: "grid", gap: 10 }}>
          {relatedItems.map((item) => (
            <div key={item.id} style={{ borderRadius: 16, padding: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#93c5fd", marginBottom: 6 }}>{item.category}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.72)" }}>{item.explanation}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
