import { useState, useMemo, useCallback } from 'react';
import type { Line } from '../types';
import { getLineColor } from '../constants/lineColors';

interface LineSelectorProps {
  lines: Line[];
  visibleLines: Set<number>;
  onToggle: (lineId: number) => void;
  loading: boolean;
  embedded?: boolean;
}

const OPERATOR_CITY_MAP: Record<string, string> = {
  '서울교통공사': '서울',
  '서울특별시 서울시메트로9호선㈜': '서울',
  '남서울경전철 주식회사': '서울',
  '우이신설경전철운영㈜': '서울',
  '한국철도공사': '수도권 광역',
  '공항철도주식회사': '수도권 광역',
  '경기도 신분당선': '수도권 광역',
  '남양주도시공사': '수도권 광역',
  '인천교통공사': '인천',
  '인천광역시 인천국제공항공사': '인천',
  '김포골드라인에스알에스㈜': '경기',
  '의정부경량전철㈜': '경기',
  '경기도 용인경전철': '경기',
  '부산광역시 부산교통공사': '부산',
  '부산-김해경전철㈜': '부산',
  '대구교통공사': '대구',
  '광주교통공사': '광주',
  '대전교통공사': '대전',
};

const CITY_ORDER = ['서울', '수도권 광역', '인천', '경기', '부산', '대구', '광주', '대전', '기타'];

function getCity(line: Line): string {
  return (line.operator_name && OPERATOR_CITY_MAP[line.operator_name]) ?? '기타';
}

interface CityGroup {
  city: string;
  lines: Line[];
}

export default function LineSelector({ lines, visibleLines, onToggle, loading, embedded }: LineSelectorProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const groups = useMemo<CityGroup[]>(() => {
    const map = new Map<string, Line[]>();
    for (const line of lines) {
      const city = getCity(line);
      const arr = map.get(city);
      if (arr) arr.push(line);
      else map.set(city, [line]);
    }
    return CITY_ORDER
      .filter((c) => map.has(c))
      .map((city) => ({ city, lines: map.get(city)! }));
  }, [lines]);

  const toggleCollapse = useCallback((city: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(city)) next.delete(city);
      else next.add(city);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    (groupLines: Line[]) => {
      for (const l of groupLines) {
        if (!visibleLines.has(l.line_id)) onToggle(l.line_id);
      }
    },
    [visibleLines, onToggle],
  );

  const deselectAll = useCallback(
    (groupLines: Line[]) => {
      for (const l of groupLines) {
        if (visibleLines.has(l.line_id)) onToggle(l.line_id);
      }
    },
    [visibleLines, onToggle],
  );

  if (loading) {
    if (embedded) {
      return <p className="text-sm text-gray-500">Loading lines...</p>;
    }
    return (
      <div className="absolute left-3 top-16 z-10 w-56 rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur">
        <p className="text-sm text-gray-500">Loading lines...</p>
      </div>
    );
  }

  if (embedded) {
    return (
      <div>
        {groups.map(({ city, lines: groupLines }) => {
          const isCollapsed = collapsed.has(city);
          return (
            <div key={city} className="mb-1">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleCollapse(city)}
                  className="flex flex-1 items-center gap-1 rounded px-1 py-1 text-left text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  <span className="w-3 text-center text-[10px]">{isCollapsed ? '\u25B6' : '\u25BC'}</span>
                  <span>{city}</span>
                  <span className="ml-1 text-gray-400">({groupLines.length})</span>
                </button>
                {!isCollapsed && (
                  <div className="flex gap-1 text-[10px]">
                    <button
                      onClick={() => selectAll(groupLines)}
                      className="rounded px-1 text-blue-500 hover:bg-blue-50"
                      title="Select all"
                    >
                      All
                    </button>
                    <button
                      onClick={() => deselectAll(groupLines)}
                      className="rounded px-1 text-gray-400 hover:bg-gray-100"
                      title="Deselect all"
                    >
                      None
                    </button>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <ul className="ml-2 space-y-0.5">
                  {groupLines.map((line) => {
                    const color = getLineColor(line.line_name, line.line_color ?? undefined);
                    return (
                      <li key={line.line_id}>
                        <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={visibleLines.has(line.line_id)}
                            onChange={() => onToggle(line.line_id)}
                            className="h-3.5 w-3.5"
                          />
                          <span
                            className="inline-block h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="truncate">{line.line_name}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="absolute left-3 top-16 z-10 max-h-[calc(100vh-5rem)] w-60 overflow-y-auto rounded-lg bg-white/95 p-3 shadow-lg backdrop-blur">
      <h3 className="mb-2 text-sm font-bold text-gray-700">Lines</h3>
      {groups.map(({ city, lines: groupLines }) => {
        const isCollapsed = collapsed.has(city);
        return (
          <div key={city} className="mb-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleCollapse(city)}
                className="flex flex-1 items-center gap-1 rounded px-1 py-1 text-left text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                <span className="w-3 text-center text-[10px]">{isCollapsed ? '▶' : '▼'}</span>
                <span>{city}</span>
                <span className="ml-1 text-gray-400">({groupLines.length})</span>
              </button>
              {!isCollapsed && (
                <div className="flex gap-1 text-[10px]">
                  <button
                    onClick={() => selectAll(groupLines)}
                    className="rounded px-1 text-blue-500 hover:bg-blue-50"
                    title="Select all"
                  >
                    All
                  </button>
                  <button
                    onClick={() => deselectAll(groupLines)}
                    className="rounded px-1 text-gray-400 hover:bg-gray-100"
                    title="Deselect all"
                  >
                    None
                  </button>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ul className="ml-2 space-y-0.5">
                {groupLines.map((line) => {
                  const color = getLineColor(line.line_name, line.line_color ?? undefined);
                  return (
                    <li key={line.line_id}>
                      <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={visibleLines.has(line.line_id)}
                          onChange={() => onToggle(line.line_id)}
                          className="h-3.5 w-3.5"
                        />
                        <span
                          className="inline-block h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="truncate">{line.line_name}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
