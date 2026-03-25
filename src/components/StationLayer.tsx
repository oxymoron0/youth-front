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
  NearFarScalar,
  DistanceDisplayCondition,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from 'cesium';
import { useViewer } from './MetroViewer';
import { getLineColor } from '../constants/lineColors';
import type { GeoJSONFeatureCollection } from '../types';

interface StationLayerProps {
  data: GeoJSONFeatureCollection | null;
  visibleLines: Set<number>;
  onStationClick: (stationId: number) => void;
}

export default function StationLayer({ data, visibleLines, onStationClick }: StationLayerProps) {
  const viewer = useViewer();
  const dsRef = useRef<CustomDataSource | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

  useEffect(() => {
    if (!viewer || !data) return;

    const ds = new CustomDataSource('stations');
    dsRef.current = ds;
    viewer.dataSources.add(ds);

    for (const feature of data.features) {
      const props = feature.properties;
      const coords = feature.geometry.coordinates;
      if (!coords || coords.length < 2) continue;

      const lon = coords[0]!;
      const lat = coords[1]!;
      const stationId = props['station_id'] as number;
      const name = (props['station_name'] as string) ?? '';
      const isTransfer = props['is_transfer'] as boolean;
      const linesArr = (props['lines'] as Array<{ line_id: number; line_name: string; line_color: string | null }>) ?? [];
      const lineIds = linesArr.map((l) => l.line_id);
      const lineName = linesArr[0]?.line_name ?? '';
      const lineColor = linesArr[0]?.line_color ?? undefined;

      const color = Color.fromCssColorString(getLineColor(lineName, lineColor));
      const size = isTransfer ? 14 : 10;

      const entity = ds.entities.add({
        position: Cartesian3.fromDegrees(lon, lat),
        name,
        point: new PointGraphics({
          color,
          pixelSize: size,
          outlineColor: Color.WHITE,
          outlineWidth: isTransfer ? 3 : 2,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
        label: new LabelGraphics({
          text: name,
          font: '12px sans-serif',
          style: LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          outlineColor: Color.BLACK,
          fillColor: Color.WHITE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(0, -10),
          distanceDisplayCondition: new DistanceDisplayCondition(0, 15000),
          scaleByDistance: new NearFarScalar(1000, 1.0, 15000, 0.5),
        }),
        properties: {
          station_id: stationId,
          line_ids: lineIds,
        } as unknown as Record<string, unknown>,
      });

      entity.show = lineIds.length === 0 || lineIds.some((id) => visibleLines.has(id));
    }

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    handler.setInputAction((click: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position);
      if (defined(picked) && picked.id?.properties) {
        const sid = picked.id.properties.station_id?.getValue(viewer.clock.currentTime);
        if (typeof sid === 'number') onStationClick(sid);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      if (handlerRef.current && !handlerRef.current.isDestroyed()) {
        handlerRef.current.destroy();
      }
      if (dsRef.current && viewer.dataSources.contains(dsRef.current)) {
        viewer.dataSources.remove(dsRef.current, true);
      }
    };
  }, [viewer, data, visibleLines, onStationClick]);

  return null;
}
