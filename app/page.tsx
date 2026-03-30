"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { DetailCard } from "@/components/DetailCard";
import { StatusBar } from "@/components/StatusBar";
import { Top5Panel } from "@/components/Top5Panel";
import type { Top5Response } from "@/lib/types/geopolitics";

const GlobeScene = dynamic(() => import("@/components/GlobeScene").then((m) => m.GlobeScene), {
  ssr: false,
  loading: () => <div className="loading">Caricamento GeoPulse…</div>
});

export default function HomePage() {
  const [data, setData] = useState<Top5Response | null>(null);
  const [activeId, setActiveId] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/top5")
      .then((r) => r.json())
      .then((json: Top5Response) => {
        setData(json);
        setActiveId(json.items[0]?.id);
      })
      .catch((error) => console.error("Failed to load top5", error));
  }, []);

  const activeItem = useMemo(() => data?.items.find((item) => item.id === activeId), [data, activeId]);

  if (!data) return <div className="loading">Caricamento GeoPulse…</div>;

  return (
    <main className="appShell">
      <GlobeScene items={data.items} activeId={activeId} />
      <Top5Panel items={data.items} activeId={activeId} onSelect={setActiveId} />
      <DetailCard item={activeItem} />
      <StatusBar generatedAt={data.generatedAt} mode={data.mode} sources={data.sources} />
    </main>
  );
}
