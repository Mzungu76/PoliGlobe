"use client";

import { useMemo } from "react";
import { Viewer, Entity } from "resium";
import { Cartesian3, Color, Ion } from "cesium";
import type { Top5Item } from "@/lib/types/geopolitics";

if (typeof window !== "undefined") {
  Ion.defaultAccessToken = "";
}

export function GlobeScene({ items, activeId }: { items: Top5Item[]; activeId?: string }) {
  const active = items.find((item) => item.id === activeId) ?? items[0];
  const entities = useMemo(
    () =>
      items.flatMap((item) =>
        item.coordinates.map((coord, index) => ({
          id: `${item.id}-${index}`,
          item,
          position: Cartesian3.fromDegrees(coord.lon, coord.lat, 300000),
          active: item.id === active?.id,
          weight: coord.weight ?? 1
        }))
      ),
    [items, active?.id]
  );

  return (
    <Viewer
      full
      animation={false}
      timeline={false}
      baseLayerPicker={false}
      homeButton={false}
      navigationHelpButton={false}
      sceneModePicker={false}
      geocoder={false}
      shouldAnimate
    >
      {entities.map((entity) => (
        <Entity
          key={entity.id}
          name={entity.item.title}
          position={entity.position}
          point={{
            pixelSize: entity.active ? 18 : 10,
            color: entity.active ? Color.CYAN : Color.ORANGE,
            outlineColor: Color.WHITE,
            outlineWidth: 2
          }}
          ellipse={{
            semiMinorAxis: 150000 + entity.weight * 100000,
            semiMajorAxis: 150000 + entity.weight * 100000,
            material: (entity.active ? Color.CYAN : Color.ORANGE).withAlpha(entity.active ? 0.2 : 0.12),
            height: 0
          }}
        />
      ))}
    </Viewer>
  );
}
