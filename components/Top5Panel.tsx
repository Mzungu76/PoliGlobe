import type { Top5Item } from "@/lib/types/geopolitics";

export function Top5Panel({ items, activeId, onSelect }: { items: Top5Item[]; activeId?: string; onSelect: (id: string) => void }) {
  return (
    <aside className="absolute left-6 top-6 z-20 w-[420px] max-w-[calc(100vw-3rem)] rounded-3xl border border-white/15 bg-black/45 p-4 text-white backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-white/55">GeoPulse</div>
          <h1 className="text-2xl font-semibold">Top 5 geopolitics</h1>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full rounded-2xl border p-3 text-left transition ${active ? "border-cyan-300/60 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
            >
              <div className="mb-1 flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs">{index + 1}</span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/55">{item.category}</span>
                <span className="ml-auto text-xs text-white/45">{Math.round(item.confidence * 100)}%</span>
              </div>
              <div className="mb-1 text-base font-medium leading-tight">{item.title}</div>
              <div className="line-clamp-3 text-sm text-white/72">{item.explanation}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
