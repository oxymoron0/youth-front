import { useEffect, useRef } from 'react';
import {
  GeoJsonDataSource,
  Color,
  HeightReference,
  LabelGraphics,
  LabelStyle,
  VerticalOrigin,
  Cartesian3,
  DistanceDisplayCondition,
} from 'cesium';
import { useViewer } from './MetroViewer';
import type { SeoulDistrictCollection, SeoulDistrictFeature } from '../hooks/useSeoulDistricts';

interface SeoulDistrictLayerProps {
  data: SeoulDistrictCollection | null;
  visible: boolean;
  visibleDistricts: Set<string> | null;
}

function computeCentroid(coords: number[][][]): [number, number] {
  const ring = coords[0]!;
  let lonSum = 0;
  let latSum = 0;
  for (const pt of ring) {
    lonSum += pt[0]!;
    latSum += pt[1]!;
  }
  return [lonSum / ring.length, latSum / ring.length];
}

export default function SeoulDistrictLayer({ data, visible, visibleDistricts }: SeoulDistrictLayerProps) {
  const viewer = useViewer();
  const dsRef = useRef<GeoJsonDataSource | null>(null);

  useEffect(() => {
    if (!viewer || !data) return;

    const fillColor = Color.YELLOW.withAlpha(0.15);
    const strokeColor = Color.fromCssColorString('#DAA520');

    GeoJsonDataSource.load(data as unknown as Record<string, unknown>, {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
      clampToGround: true,
    }).then((ds) => {
      for (const entity of ds.entities.values) {
        const name = entity.properties?.name?.getValue() as string | undefined;
        if (!name) continue;

        const feature = data.features.find(
          (f: SeoulDistrictFeature) => f.properties.name === name,
        );
        if (!feature) continue;

        const [lon, lat] = computeCentroid(feature.geometry.coordinates);

        const labelEntity = ds.entities.add({
          position: Cartesian3.fromDegrees(lon, lat),
          label: new LabelGraphics({
            text: name,
            font: 'bold 13px sans-serif',
            style: LabelStyle.FILL_AND_OUTLINE,
            outlineWidth: 2,
            outlineColor: Color.BLACK,
            fillColor: Color.WHITE,
            verticalOrigin: VerticalOrigin.CENTER,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            distanceDisplayCondition: new DistanceDisplayCondition(0, 80000),
          }),
          properties: { code: feature.properties.code } as unknown as Record<string, unknown>,
        });
        labelEntity.show = true;
      }

      ds.show = visible;
      viewer.dataSources.add(ds);
      dsRef.current = ds;
    });

    return () => {
      if (dsRef.current && viewer.dataSources.contains(dsRef.current)) {
        viewer.dataSources.remove(dsRef.current, true);
      }
      dsRef.current = null;
    };
  }, [viewer, data]);

  useEffect(() => {
    if (!dsRef.current) return;
    dsRef.current.show = visible;
  }, [visible]);

  useEffect(() => {
    if (!dsRef.current || !visibleDistricts) return;

    for (const entity of dsRef.current.entities.values) {
      const code = entity.properties?.code?.getValue() as string | undefined;
      if (code) {
        entity.show = visibleDistricts.has(code);
      }
    }
  }, [visibleDistricts]);

  return null;
}
