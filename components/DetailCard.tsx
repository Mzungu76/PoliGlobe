import type { Top5Item } from "@/lib/types/geopolitics";

export function DetailCard({ item }: { item?: Top5Item }) {
  if (!item) return null;
  return (
    <section className="absolute bottom-6 right-6 z-20 w-[540px] max-w-[calc(100vw-3rem)] rounded-3xl border border-white/15 bg-black/45 p-5 text-white backdrop-blur-xl">
      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-white/50">{item.category}</div>
      <h2 className="mb-3 text-2xl font-semibold leading-tight">{item.title}</h2>
      <p className="mb-4 text-sm leading-6 text-white/80">{item.explanation}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {item.factors.map((factor) => (
          <span key={factor} className="rounded-full border border-white/12 bg-white/6 px-3 py-1 text-xs text-white/70">{factor}</span>
        ))}
      </div>
      {item.historicalParallel ? (
        <div className="text-sm text-white/65"><span className="text-white/45">Historical parallel:</span> {item.historicalParallel}</div>
      ) : null}
    </section>
  );
}
