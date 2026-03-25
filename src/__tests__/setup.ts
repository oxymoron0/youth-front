import '@testing-library/jest-dom/vitest';

// Mock Cesium module for tests
vi.mock('cesium', () => ({
  Viewer: vi.fn(),
  Ion: { defaultAccessToken: '' },
  Cartesian3: { fromDegrees: vi.fn(() => ({})) },
  Math: { toRadians: vi.fn((x: number) => x) },
  Color: {
    fromCssColorString: vi.fn(() => ({})),
    WHITE: {},
    BLACK: {},
    YELLOW: {},
  },
  CustomDataSource: vi.fn(() => ({
    entities: { add: vi.fn(), removeAll: vi.fn() },
  })),
  PointGraphics: vi.fn(),
  ScreenSpaceEventHandler: vi.fn(() => ({
    setInputAction: vi.fn(),
    destroy: vi.fn(),
    isDestroyed: vi.fn(() => false),
  })),
  ScreenSpaceEventType: { LEFT_CLICK: 0 },
  defined: vi.fn(),
}));

// Mock cesium CSS
vi.mock('cesium/Build/Cesium/Widgets/widgets.css', () => ({}));
