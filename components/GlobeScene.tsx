"use client";

import { useMemo } from "react";
import {
  Cartesian2,
  Cartesian3,
  Color,
  OpenStreetMapImageryProvider,
} from "cesium";
import {
  CameraFlyTo,
  Entity,
  Globe,
  LabelGraphics,
  PointGraphics,
  PolylineGraphics,
  Viewer,
} from "resium";
import type { Top5Item } from "@/lib/types/geopolitics";

export function GlobeScene({
  items,
  activeId,
}: {
  items: Top5Item[];
  activeId?: string;
}) {
  const initialPosition = useMemo(
    () => Cartesian3.fromDegrees(10, 22, 22000000),
    []
  );

  const imageryProvider = useMemo(
    () =>
      new OpenStreetMapImageryProvider({
        url: "https://tile.openstreetmap.org/",
      }),
    []
  );

  return (
    <div style={{ position: "absolute", inset: 0 }}>
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
        imageryProvider={imageryProvider}
      >
        <CameraFlyTo destination={initialPosition} duration={0} />
        <Globe enableLighting depthTestAgainstTerrain={false} />

        {items.map((item) => {
          const active = item.id === activeId;

          return item.coordinates.map((coordinate, idx) => (
            <Entity
              key={`${item.id}-${idx}`}
              position={Cartesian3.fromDegrees(
                coordinate.lon,
                coordinate.lat,
                active ? 50000 : 0
              )}
            >
              <PointGraphics
                pixelSize={active ? 18 : 12}
                color={active ? Color.CYAN : Color.ORANGE}
                outlineColor={Color.WHITE}
                outlineWidth={2}
              />

              <LabelGraphics
                text={idx === 0 ? item.title : ""}
                fillColor={Color.WHITE}
                showBackground
                backgroundColor={Color.fromCssColorString("rgba(2,6,23,0.75)")}
                scale={0.55}
                pixelOffset={new Cartesian2(0, -42)}
              />
            </Entity>
          ));
        })}

        {items
          .filter((item) => item.id === activeId)
          .flatMap((item) => {
            const origin = item.coordinates[0];

            return item.coordinates.slice(1).map((target, idx) => (
              <Entity key={`line-${item.id}-${idx}`}>
                <PolylineGraphics
                  positions={Cartesian3.fromDegreesArray([
                    origin.lon,
                    origin.lat,
                    target.lon,
                    target.lat,
                  ])}
                  width={3}
                  material={Color.CYAN.withAlpha(0.65)}
                />
              </Entity>
            ));
          })}
      </Viewer>
    </div>
  );
}
