import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../api/client', () => ({
  searchStations: vi.fn(),
}));

import { useSearch } from '../../hooks/useSearch';
import { searchStations } from '../../api/client';

const mockSearch = vi.mocked(searchStations);

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty results for short queries', () => {
    const { result } = renderHook(() => useSearch('a'));
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('debounces search calls', async () => {
    mockSearch.mockResolvedValue([
      {
        station_id: 1,
        station_name: 'Test',
        latitude: 37,
        longitude: 127,
        lines: [],
      },
    ]);

    const { rerender } = renderHook(
      ({ q }: { q: string }) => useSearch(q, 300),
      { initialProps: { q: 'Se' } },
    );

    expect(mockSearch).not.toHaveBeenCalled();

    rerender({ q: 'Seo' });
    rerender({ q: 'Seou' });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockSearch).toHaveBeenCalledWith('Seou');
  });

  it('returns results after debounce', async () => {
    mockSearch.mockResolvedValue([
      {
        station_id: 1,
        station_name: 'Seoul',
        latitude: 37.55,
        longitude: 126.97,
        lines: [],
      },
    ]);

    const { result } = renderHook(() => useSearch('Seoul', 300));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0]?.station_name).toBe('Seoul');
  });

  it('clears results when query becomes too short', () => {
    const { result, rerender } = renderHook(
      ({ q }: { q: string }) => useSearch(q, 300),
      { initialProps: { q: 'Seoul' } },
    );

    rerender({ q: 'S' });
    expect(result.current.results).toEqual([]);
  });
});
