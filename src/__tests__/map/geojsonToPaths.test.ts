import { describe, it, expect } from 'vitest';
import {
  ringToLatLngs,
  polygonToPaths,
  multiPolygonToPathSets,
  polygonCentroid,
} from '../../map/geojsonToPaths';

describe('geojsonToPaths', () => {
  describe('ringToLatLngs', () => {
    it('flips GeoJSON [lng, lat] to naver LatLng(lat, lng)', () => {
      const ring: [number, number][] = [
        [126.978, 37.5665],
        [127.0, 37.55],
      ];
      const result = ringToLatLngs(ring);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ lat: 37.5665, lng: 126.978 });
      expect(result[1]).toMatchObject({ lat: 37.55, lng: 127.0 });
    });
  });

  describe('polygonToPaths', () => {
    it('converts a single-ring Polygon to one path', () => {
      const coords: [number, number][][] = [
        [
          [126.978, 37.5665],
          [127.0, 37.55],
          [126.95, 37.56],
          [126.978, 37.5665],
        ],
      ];
      const paths = polygonToPaths(coords);
      expect(paths).toHaveLength(1);
      expect(paths[0]).toHaveLength(4);
    });

    it('preserves multiple rings (outer + holes)', () => {
      const coords: [number, number][][] = [
        [[0, 0], [10, 0], [10, 10], [0, 10]],
        [[2, 2], [4, 2], [4, 4], [2, 4]],
      ];
      const paths = polygonToPaths(coords);
      expect(paths).toHaveLength(2);
      expect(paths[0]).toHaveLength(4);
      expect(paths[1]).toHaveLength(4);
    });
  });

  describe('multiPolygonToPathSets', () => {
    it('returns one path-set per sub-polygon', () => {
      const coords: [number, number][][][] = [
        [[[126.978, 37.5665], [127.0, 37.55], [126.95, 37.56]]],
        [[[126.5, 37.4], [126.6, 37.4], [126.55, 37.45]]],
      ];
      const sets = multiPolygonToPathSets(coords);
      expect(sets).toHaveLength(2);
      expect(sets[0]).toHaveLength(1);
      expect(sets[1]).toHaveLength(1);
      expect(sets[0]![0]).toHaveLength(3);
    });
  });

  describe('polygonCentroid', () => {
    it('averages outer-ring coordinates as [lng, lat]', () => {
      const [lng, lat] = polygonCentroid([
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
        ],
      ]);
      expect(lng).toBe(5);
      expect(lat).toBe(5);
    });

    it('ignores inner rings (uses outer ring only)', () => {
      const [lng, lat] = polygonCentroid([
        [[0, 0], [4, 0], [4, 4], [0, 4]],
        [[100, 100], [200, 100], [200, 200], [100, 200]],
      ]);
      expect(lng).toBe(2);
      expect(lat).toBe(2);
    });
  });
});
