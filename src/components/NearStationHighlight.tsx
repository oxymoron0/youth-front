import { useEffect, useRef } from 'react';
import {
  CustomDataSource,
  Cartesian2,
  Cartesian3,
  Color,
  PointGraphics,
  LabelGraphics,
  LabelStyle,
  VerticalOrigin,
  HeightReference,
} from 'cesium';
import { useViewer } from './MetroViewer';
import type { NearbyStation } from '../types/housing';

interface NearStationHighlightProps {
  nearbyStations: NearbyStation[];
}

export default function NearStationHighlight({ nearbyStations }: NearStationHighlightProps) {
  const viewer = useViewer();
  const dsRef = useRef<CustomDataSource | null>(null);

  useEffect(() => {
    if (!viewer) return;

    // Clean up previous data source
    if (dsRef.current && viewer.dataSources.contains(dsRef.current)) {
      viewer.dataSources.remove(dsRef.current, true);
    }

    if (nearbyStations.length === 0) return;

    const ds = new CustomDataSource('near-stations-highlight');
    dsRef.current = ds;
    viewer.dataSources.add(ds);

    for (const s of nearbyStations) {
      if (s.latitude == null || s.longitude == null) continue;

      ds.entities.add({
        position: Cartesian3.fromDegrees(s.longitude, s.latitude),
        name: s.station_name,
        point: new PointGraphics({
          color: Color.ORANGERED,
          pixelSize: 18,
          outlineColor: Color.WHITE,
          outlineWidth: 3,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
        label: new LabelGraphics({
          text: `${s.station_name} (${Math.round(s.distance_m)}m)`,
          font: '13px sans-serif',
          style: LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Color.BLACK,
          fillColor: Color.WHITE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -14),
        }),
      });
    }

    return () => {
      if (dsRef.current && viewer.dataSources.contains(dsRef.current)) {
        viewer.dataSources.remove(dsRef.current, true);
      }
    };
  }, [viewer, nearbyStations]);

  return null;
}
