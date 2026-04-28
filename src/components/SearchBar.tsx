import { useState, useRef, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';
import { getLineColor } from '../constants/lineColors';

interface SearchBarProps {
  onSelect: (stationId: number, lon: number, lat: number) => void;
  embedded?: boolean;
}

export default function SearchBar({ onSelect, embedded = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { results, loading } = useSearch(query);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(results.length > 0);
  }, [results]);

  return (
    <div
      ref={wrapperRef}
      className={
        embedded
          ? 'relative w-full'
          : 'absolute left-1/2 top-3 z-20 w-80 -translate-x-1/2'
      }
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="역 검색..."
        className={
          embedded
            ? 'w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none'
            : 'w-full rounded-lg border border-gray-300 bg-white/95 px-4 py-2 text-sm shadow-lg backdrop-blur focus:border-blue-500 focus:outline-none'
        }
        aria-label="Search stations"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-xs text-gray-400">...</div>
      )}
      {open && results.length > 0 && (
        <ul className="mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {results.map((r) => (
            <li key={r.station_id}>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                onClick={() => {
                  onSelect(r.station_id, r.longitude, r.latitude);
                  setQuery('');
                  setOpen(false);
                }}
              >
                <span className="font-medium text-gray-800">{r.station_name}</span>
                {r.station_name_en && (
                  <span className="text-xs text-gray-400">{r.station_name_en}</span>
                )}
                <span className="ml-auto flex gap-1">
                  {r.lines.map((l) => (
                    <span
                      key={l.line_id}
                      className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: getLineColor(l.line_name, l.line_color ?? undefined) }}
                    >
                      {l.line_name}
                    </span>
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
