"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { DetailCard } from "@/components/DetailCard";
import { StatusBar } from "@/components/StatusBar";
import { Top5Panel } from "@/components/Top5Panel";
import type { Top5Response } from "@/lib/types/geopolitics";

const GlobeScene = dynamic(() => import("@/components/GlobeScene").then((m) => m.GlobeScene), {
  ssr: false,
  loading: () => <div className="loading">Caricamento PoliGlobe…</div>
});

export default function HomePage() {
  const [data, setData] = useState<Top5Response | null>(null);
  const [activeCode, setActiveCode] = useState<string | undefined>();

  useEffect(() => {
    fetch("/api/top5")
      .then((r) => r.json())
      .then((json: Top5Response) => {
        setData(json);
        setActiveCode(json.countryHotspots[0]?.countryCode);
      })
      .catch((error) => console.error("Failed to load top5", error));
  }, []);

  const activeHotspot = useMemo(() => data?.countryHotspots.find((item) => item.countryCode === activeCode), [data, activeCode]);

  if (!data) return <div className="loading">Caricamento PoliGlobe…</div>;

  return (
    <main className="appShell">
      <GlobeScene hotspots={data.countryHotspots} connections={data.connections} activeCode={activeCode} />
      <Top5Panel hotspots={data.countryHotspots} activeCode={activeCode} onSelect={setActiveCode} />
      <DetailCard hotspot={activeHotspot} items={data.items} />
      <StatusBar generatedAt={data.generatedAt} mode={data.mode} sources={data.sources} hotspotCount={data.countryHotspots.length} />
    </main>
  );
}
