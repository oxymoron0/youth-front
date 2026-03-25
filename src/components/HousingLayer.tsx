import { useEffect, useRef } from 'react';
import {
  CustomDataSource,
  Cartesian2,
  Cartesian3,
  BillboardGraphics,
  HeightReference,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from 'cesium';
import { useViewer } from './MetroViewer';
import type { HousingListItem } from '../types/housing';

interface HousingLayerProps {
  housings: HousingListItem[];
  checkedHomes: Set<string>;
  selectedHomeCode: string | null;
  onHousingClick: (homeCode: string) => void;
}

function createHousingIconDataURI(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="white" stroke="#3B82F6" stroke-width="2"/>
    <g transform="translate(6, 7) scale(0.04)">
      <path fill="#3B82F6" d="M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.514z"/>
      <path fill="#3B82F6" d="M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const HOUSING_ICON = createHousingIconDataURI();

export default function HousingLayer({
  housings,
  checkedHomes,
  selectedHomeCode,
  onHousingClick,
}: HousingLayerProps) {
  const viewer = useViewer();
  const dsRef = useRef<CustomDataSource | null>(null);
  const handlerRef = useRef<ScreenSpaceEventHandler | null>(null);

  // Select entity when selectedHomeCode changes (list click → map highlight)
  useEffect(() => {
    if (!viewer || !dsRef.current) return;
    if (!selectedHomeCode) {
      viewer.selectedEntity = undefined;
      return;
    }
    const entities = dsRef.current.entities.values;
    for (const entity of entities) {
      const code = entity.properties?.home_code?.getValue(viewer.clock.currentTime);
      if (code === selectedHomeCode) {
        viewer.selectedEntity = entity;
        return;
      }
    }
  }, [viewer, selectedHomeCode]);

  useEffect(() => {
    if (!viewer) return;

    // Clean up previous data source
    if (dsRef.current && viewer.dataSources.contains(dsRef.current)) {
      viewer.dataSources.remove(dsRef.current, true);
    }
    if (handlerRef.current && !handlerRef.current.isDestroyed()) {
      handlerRef.current.destroy();
    }

    const ds = new CustomDataSource('housings');
    dsRef.current = ds;
    viewer.dataSources.add(ds);

    for (const h of housings) {
      if (!checkedHomes.has(h.home_code)) continue;
      if (h.longitude == null || h.latitude == null) continue;

      ds.entities.add({
        position: Cartesian3.fromDegrees(h.longitude, h.latitude),
        name: h.home_name,
        billboard: new BillboardGraphics({
          image: HOUSING_ICON,
          width: 32,
          height: 32,
          heightReference: HeightReference.CLAMP_TO_GROUND,
        }),
        properties: {
          home_code: h.home_code,
        } as unknown as Record<string, unknown>,
      });
    }

    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    handlerRef.current = handler;

    handler.setInputAction((click: { position: Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position);
      if (defined(picked) && picked.id?.properties) {
        const code = picked.id.properties.home_code?.getValue(viewer.clock.currentTime);
        if (typeof code === 'string') onHousingClick(code);
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
  }, [viewer, housings, checkedHomes, onHousingClick]);

  return null;
}
