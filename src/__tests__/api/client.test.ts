import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Must mock import.meta.env before importing client
vi.stubEnv('VITE_API_BASE_URL', '');

import {
  apiFetch,
  fetchStationsGeoJSON,
  fetchStationDetail,
  searchStations,
  fetchNearbyStations,
  fetchLines,
  fetchLineStations,
  fetchLineGeometry,
  fetchTransfers,
} from '../../api/client';

const mockFetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mockJsonResponse(data: unknown, status = 200) {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: () => Promise.resolve(data),
    });
  }

  it('apiFetch sends Accept header and returns parsed JSON', async () => {
    mockJsonResponse({ result: true });
    const data = await apiFetch<{ result: boolean }>('/test');
    expect(data).toEqual({ result: true });
    expect(mockFetch).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: 'application/json' }),
      }),
    );
  });

  it('apiFetch throws on non-ok response', async () => {
    mockJsonResponse({ error: { message: 'Not Found' } }, 404);
    await expect(apiFetch('/missing')).rejects.toThrow('Not Found');
  });

  it('apiFetch throws statusText when body has no error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('no json')),
    });
    await expect(apiFetch('/broken')).rejects.toThrow('Internal Server Error');
  });

  it('fetchStationsGeoJSON calls correct URL', async () => {
    mockJsonResponse({ type: 'FeatureCollection', features: [] });
    await fetchStationsGeoJSON();
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/stations?format=geojson',
      expect.anything(),
    );
  });

  it('fetchStationDetail calls correct URL', async () => {
    mockJsonResponse({ station_id: 5 });
    await fetchStationDetail(5);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/stations/5', expect.anything());
  });

  it('searchStations calls correct URL with encoded query', async () => {
    mockJsonResponse([]);
    await searchStations('서울역');
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/v1/stations/search?q=${encodeURIComponent('서울역')}`,
      expect.anything(),
    );
  });

  it('fetchNearbyStations calls correct URL', async () => {
    mockJsonResponse({ type: 'FeatureCollection', features: [] });
    await fetchNearbyStations(126.97, 37.55, 1000);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/stations/nearby?lon=126.97&lat=37.55&radius=1000',
      expect.anything(),
    );
  });

  it('fetchLines calls correct URL', async () => {
    mockJsonResponse([]);
    await fetchLines();
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/lines', expect.anything());
  });

  it('fetchLineStations calls correct URL', async () => {
    mockJsonResponse({ type: 'FeatureCollection', features: [] });
    await fetchLineStations(3);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/lines/3/stations', expect.anything());
  });

  it('fetchLineGeometry calls correct URL', async () => {
    mockJsonResponse({ type: 'FeatureCollection', features: [] });
    await fetchLineGeometry(7);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/lines/7/geometry', expect.anything());
  });

  it('fetchTransfers calls correct URL', async () => {
    mockJsonResponse([]);
    await fetchTransfers(42);
    expect(mockFetch).toHaveBeenCalledWith('/api/v1/transfers/42', expect.anything());
  });
});
