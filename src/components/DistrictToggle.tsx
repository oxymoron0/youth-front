import { useState, useCallback, useMemo } from 'react';
import type { SeoulDistrictCollection } from '../hooks/useSeoulDistricts';

interface DistrictToggleProps {
  data: SeoulDistrictCollection | null;
  enabled: boolean;
  onToggleEnabled: () => void;
  visibleDistricts: Set<string>;
  onToggleDistrict: (code: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function DistrictToggle({
  data,
  enabled,
  onToggleEnabled,
  visibleDistricts,
  onToggleDistrict,
  onSelectAll,
  onDeselectAll,
}: DistrictToggleProps) {
  const [expanded, setExpanded] = useState(false);

  const districts = useMemo(() => {
    if (!data) return [];
    return data.features
      .map((f) => ({ code: f.properties.code, name: f.properties.name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [data]);

  const handleToggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className="absolute bottom-4 right-20 z-10">
      <button
        onClick={onToggleEnabled}
        className={`rounded-lg px-3 py-2 text-xs font-medium shadow-lg backdrop-blur transition-colors ${
          enabled
            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
            : 'bg-white/90 text-gray-700 hover:bg-white'
        }`}
        title="Seoul Districts"
      >
        Seoul Gu
      </button>

      {enabled && (
        <button
          onClick={handleToggleExpand}
          className="ml-1 rounded-lg bg-white/90 px-2 py-2 text-xs font-medium text-gray-600 shadow-lg backdrop-blur hover:bg-white"
          title={expanded ? 'Collapse' : 'Select districts'}
        >
          {expanded ? '▼' : '▲'}
        </button>
      )}

      {enabled && expanded && districts.length > 0 && (
        <div className="absolute bottom-10 right-0 w-44 rounded-lg bg-white/95 p-2 shadow-lg backdrop-blur">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Districts</span>
            <div className="flex gap-1 text-[10px]">
              <button
                onClick={onSelectAll}
                className="rounded px-1 text-blue-500 hover:bg-blue-50"
              >
                All
              </button>
              <button
                onClick={onDeselectAll}
                className="rounded px-1 text-gray-400 hover:bg-gray-100"
              >
                None
              </button>
            </div>
          </div>
          <ul className="max-h-60 space-y-0.5 overflow-y-auto">
            {districts.map((d) => (
              <li key={d.code}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={visibleDistricts.has(d.code)}
                    onChange={() => onToggleDistrict(d.code)}
                    className="h-3 w-3"
                  />
                  <span>{d.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
