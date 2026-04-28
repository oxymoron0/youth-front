import '@testing-library/jest-dom/vitest';

class FakeLatLng {
  constructor(public lat: number, public lng: number) {}
}

class FakePoint {
  constructor(public x: number, public y: number) {}
}

class FakeMarker {
  setMap(): void {}
  setIcon(): void {}
  setPosition(): void {}
  setVisible(): void {}
  setZIndex(): void {}
}

class FakePolygon {
  setMap(): void {}
  setPaths(): void {}
}

class FakeMap {
  setCenter(): void {}
  setZoom(): void {}
  panTo(): void {}
  morph(): void {}
  getZoom(): number { return 12; }
  destroy(): void {}
}

(globalThis as unknown as { naver: unknown }).naver = {
  maps: {
    LatLng: FakeLatLng,
    Point: FakePoint,
    Marker: FakeMarker,
    Polygon: FakePolygon,
    Map: FakeMap,
    MapTypeId: { NORMAL: 'NORMAL', SATELLITE: 'SATELLITE', HYBRID: 'HYBRID' },
    Event: {
      addListener: () => ({ id: 0 }),
      removeListener: () => {},
      clearInstanceListeners: () => {},
    },
  },
};
