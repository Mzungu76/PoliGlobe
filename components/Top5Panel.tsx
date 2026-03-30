import type { Top5Item } from "@/lib/types/geopolitics";

export function Top5Panel({ items, activeId, onSelect }: { items: Top5Item[]; activeId?: string; onSelect: (id: string) => void }) {
  return (
    <aside className="panel" style={{ position: "absolute", left: 18, top: 18, width: 390, maxHeight: "calc(100vh - 36px)", overflow: "auto", borderRadius: 24, padding: 16, zIndex: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "#7dd3fc" }}>GeoPulse</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Top 5 globali</div>
        </div>
        <div className="badge">AI ranked</div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, index) => {
          const active = item.id === activeId;
          return (
            <button key={item.id} onClick={() => onSelect(item.id)} style={{
              width: "100%",
              textAlign: "left",
              borderRadius: 18,
              border: active ? "1px solid rgba(125,211,252,0.5)" : "1px solid rgba(255,255,255,0.08)",
              background: active ? "rgba(14,116,144,0.22)" : "rgba(255,255,255,0.03)",
              color: "white",
              padding: 14,
              cursor: "pointer"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(125,211,252,0.14)", color: "#bae6fd", fontSize: 12, fontWeight: 700 }}>{index + 1}</div>
                <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#93c5fd" }}>{item.category}</div>
              </div>
              <div style={{ fontSize: 17, lineHeight: 1.25, fontWeight: 650, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.7)" }}>{item.explanation}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
