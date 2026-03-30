"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { DetailCard } from "@/components/DetailCard";
import { Top5Panel } from "@/components/Top5Panel";
import type { Top5Response } from "@/lib/types/geopolitics";

const GlobeScene = dynamic(() => import("@/components/GlobeScene").then((m) => m.GlobeScene), {
  ssr: false,
  loading: () => <div className="h-screen w-screen animate-pulse bg-[#030712]" />
});

export default function HomePage() {
  const [data, setData] = useState<Top5Response | null>(null);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch("/api/top5")
      .then((r) => r.json())
      .then((json: Top5Response) => {
        setData(json);
        setActiveId(json.items[0]?.id);
      })
      .catch(console.error);
  }, []);

  const activeItem = useMemo(() => data?.items.find((item) => item.id === activeId), [data, activeId]);

  if (!data) {
    return <div className="flex h-screen items-center justify-center bg-[#020617] text-white">Loading GeoPulse…</div>;
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(249,115,22,0.10),transparent_25%)]" />
      <GlobeScene items={data.items} activeId={activeId} />
      <Top5Panel items={data.items} activeId={activeId} onSelect={setActiveId} />
      <DetailCard item={activeItem} />
      <div className="absolute bottom-6 left-6 z-20 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs text-white/60 backdrop-blur-md">
        {data.mode.toUpperCase()} · {new Date(data.generatedAt).toLocaleString()}
      </div>
    </main>
  );
}
