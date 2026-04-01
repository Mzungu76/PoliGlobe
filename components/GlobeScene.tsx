"use client";

import { useMemo } from "react";
import { Cartesian2, Cartesian3, Color, OpenStreetMapImageryProvider } from "cesium";
import { CameraFlyTo, Entity, Globe, ImageryLayer, LabelGraphics, PointGraphics, PolylineGraphics, Viewer } from "resium";
import type { CountryConnection, CountryHotspot } from "@/lib/types/geopolitics";

function categoryColor(category: CountryHotspot["category"]) {
  switch (category) {
    case "tensions":
      return Color.fromCssColorString("#ef4444");
    case "fragilities":
      return Color.fromCssColorString("#f59e0b");
    case "influence":
      return Color.fromCssColorString("#22c55e");
    case "correlations":
      return Color.fromCssColorString("#60a5fa");
    case "watchlist":
      return Color.fromCssColorString("#a78bfa");
    default:
      return Color.WHITE;
  }
}

export function GlobeScene({ hotspots, connections, activeCode }: { hotspots: CountryHotspot[]; connections: CountryConnection[]; activeCode?: string }) {
  const initialPosition = useMemo(() => Cartesian3.fromDegrees(8, 18, 23000000), []);
  const imageryProvider = useMemo(
    () =>
      new OpenStreetMapImageryProvider({
        url: "https://tile.openstreetmap.org/",
      }),
    []
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#020617",
      }}
    >
      <Viewer
        full
        animation={false}
        timeline={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        navigationHelpButton={false}
        sceneModePicker={false}
        selectionIndicator={false}
        infoBox={false}
        skyBox={false}
        skyAtmosphere={false}
        shouldAnimate
        scene3DOnly
      >
        <ImageryLayer imageryProvider={imageryProvider} />
        <CameraFlyTo destination={initialPosition} duration={0} />
        <Globe enableLighting depthTestAgainstTerrain={false} />

        {hotspots.map((hotspot) => {
          const active = hotspot.countryCode === activeCode;
          const color = categoryColor(hotspot.category);
          const ringMeters = 300000 + hotspot.score * 14000;
          return (
            <Entity
              key={hotspot.countryCode}
              position={Cartesian3.fromDegrees(hotspot.centroid.lon, hotspot.centroid.lat, active ? 90000 : 20000)}
            >
              <PointGraphics
                pixelSize={active ? 18 : 12}
                color={active ? Color.CYAN : color}
                outlineColor={Color.WHITE}
                outlineWidth={2}
              />
              <LabelGraphics
                text={`${hotspot.countryName} · ${hotspot.dominantTitle}`}
                fillColor={Color.WHITE}
                showBackground
                backgroundColor={Color.fromCssColorString("rgba(2,6,23,0.78)")}
                scale={active ? 0.62 : 0.52}
                pixelOffset={new Cartesian2(0, -40)}
              />
              <PolylineGraphics
                positions={Cartesian3.fromDegreesArray([
                  hotspot.centroid.lon - 0.0001,
                  hotspot.centroid.lat,
                  hotspot.centroid.lon + 0.0001,
                  hotspot.centroid.lat,
                ])}
                width={0}
              />
            </Entity>
          );
        })}

        {hotspots.map((hotspot) => {
          const color = categoryColor(hotspot.category).withAlpha(hotspot.countryCode === activeCode ? 0.28 : 0.14);
          const ringMeters = 300000 + hotspot.score * 14000;
          return (
            <Entity
              key={`ring-${hotspot.countryCode}`}
              position={Cartesian3.fromDegrees(hotspot.centroid.lon, hotspot.centroid.lat)}
              ellipse={{
                semiMajorAxis: ringMeters,
                semiMinorAxis: ringMeters,
                material: color,
                outline: true,
                outlineColor: categoryColor(hotspot.category).withAlpha(0.45),
                height: 0,
              } as never}
            />
          );
        })}

        {connections.map((connection) => {
          const from = hotspots.find((h) => h.countryCode === connection.fromCountry);
          const to = hotspots.find((h) => h.countryCode === connection.toCountry);
          if (!from || !to) return null;
          return (
            <Entity key={`${connection.fromCountry}-${connection.toCountry}`}>
              <PolylineGraphics
                positions={Cartesian3.fromDegreesArray([
                  from.centroid.lon,
                  from.centroid.lat,
                  to.centroid.lon,
                  to.centroid.lat,
                ])}
                width={Math.max(1.5, Math.min(5, connection.strength / 22))}
                material={Color.CYAN.withAlpha(0.42)}
              />
            </Entity>
          );
        })}
      </Viewer>
    </div>
  );
}
