import { useEffect, useRef } from 'react';
import {
  CustomDataSource,
  Cartesian3,
  Color,
  PointGraphics,
  HeightReference,
} from 'cesium';
import { useViewer } from './MetroViewer';
import type { ExitInfo } from '../types';

interface ExitLayerProps {
  exits: ExitInfo[];
  stationId: number | null;
}

export default function ExitLayer({ exits, stationId }: ExitLayerProps) {
  const viewer = useViewer();
  const dsRef = useRef<CustomDataSource | null>(null);

  useEffect(() => {
    if (!viewer) return;

    if (dsRef.current && viewer.dataSources.contains(dsRef.current)) {
      viewer.dataSources.remove(dsRef.current, true);
    }

    if (!stationId || exits.length === 0) return;

    const ds = new CustomDataSource('exits');
    dsRef.current = ds;
    viewer.dataSources.add(ds);

    for (const exit of exits) {
      if (exit.latitude == null || exit.longitude == null) continue;

      ds.entities.add({
        position: Cartesian3.fromDegrees(exit.longitude, exit.latitude),
        name: `Exit ${exit.exit_number}${exit.exit_name ? ` - ${exit.exit_name}` : ''}`,
        point: new PointGraphics({
          color: Color.YELLOW,
          pixelSize: 6,
          outlineColor: Color.BLACK,
          outlineWidth: 1,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
      });
    }

    return () => {
      if (dsRef.current && viewer.dataSources.contains(dsRef.current)) {
        viewer.dataSources.remove(dsRef.current, true);
      }
    };
  }, [viewer, exits, stationId]);

  return null;
}
