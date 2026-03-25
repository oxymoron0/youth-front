import { useEffect, useRef, useState, createContext, useContext, useCallback, type ReactNode } from 'react';
import {
  Viewer,
  Ion,
  Cartesian3,
  Math as CesiumMath,
  Cesium3DTileset,
  GoogleMaps,
  Google2DImageryProvider,
  ImageryLayer,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface ViewerContextValue {
  viewer: Viewer | null;
  lod4Enabled: boolean;
  toggleLod4: () => void;
}

const ViewerContext = createContext<ViewerContextValue>({
  viewer: null,
  lod4Enabled: false,
  toggleLod4: () => {},
});

export function useViewer(): Viewer | null {
  return useContext(ViewerContext).viewer;
}

export function useLod4(): { enabled: boolean; toggle: () => void } {
  const { lod4Enabled, toggleLod4 } = useContext(ViewerContext);
  return { enabled: lod4Enabled, toggle: toggleLod4 };
}

const SEOUL = Cartesian3.fromDegrees(126.978, 37.5665, 30000);

const VWORLD_LOD4_URL = 'https://xdworld.vworld.kr/TDServer/services/facility_LOD4/vworld_3d_facility.json';

export default function MetroViewer({ children }: { children?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [lod4Enabled, setLod4Enabled] = useState(false);
  const lod4TilesetRef = useRef<Cesium3DTileset | null>(null);

  useEffect(() => {
    const token = import.meta.env.VITE_CESIUM_TOKEN;
    if (token) Ion.defaultAccessToken = token;

    const googleKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (googleKey) GoogleMaps.defaultApiKey = googleKey;

    if (!containerRef.current) return;

    const v = new Viewer(containerRef.current, {
      timeline: false,
      animation: false,
      homeButton: false,
      navigationHelpButton: false,
      baseLayerPicker: false,
      geocoder: false,
      sceneModePicker: false,
      fullscreenButton: false,
      selectionIndicator: true,
      infoBox: false,
      useBrowserRecommendedResolution: false,
      msaaSamples: 4,
    });

    // Replace default imagery with Google 2D satellite tiles
    v.imageryLayers.removeAll();
    const googleLayer = ImageryLayer.fromProviderAsync(
      Google2DImageryProvider.fromUrl({ mapType: 'satellite' }) as unknown as Promise<import('cesium').ImageryProvider>,
    );
    v.imageryLayers.add(googleLayer);

    v.camera.setView({
      destination: SEOUL,
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
    });

    setViewer(v);

    return () => {
      if (!v.isDestroyed()) {
        v.destroy();
      }
      setViewer(null);
    };
  }, []);

  useEffect(() => {
    if (!viewer) return;

    if (lod4Enabled && !lod4TilesetRef.current) {
      Cesium3DTileset.fromUrl(VWORLD_LOD4_URL)
        .then((tileset) => {
          if (!viewer.isDestroyed()) {
            viewer.scene.primitives.add(tileset);
            lod4TilesetRef.current = tileset;
          }
        })
        .catch((err) => {
          console.warn('Failed to load VWorld LOD4 tileset:', err);
        });
    } else if (!lod4Enabled && lod4TilesetRef.current) {
      viewer.scene.primitives.remove(lod4TilesetRef.current);
      lod4TilesetRef.current = null;
    }
  }, [viewer, lod4Enabled]);

  const toggleLod4 = useCallback(() => {
    setLod4Enabled((prev) => !prev);
  }, []);

  return (
    <ViewerContext.Provider value={{ viewer, lod4Enabled, toggleLod4 }}>
      <div ref={containerRef} className="absolute inset-0" />
      {viewer && children}
    </ViewerContext.Provider>
  );
}
