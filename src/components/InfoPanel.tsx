import type { StationDetail } from '../types';
import { getLineColor } from '../constants/lineColors';

interface InfoPanelProps {
  station: StationDetail | null;
  loading: boolean;
  onClose: () => void;
}

export default function InfoPanel({ station, loading, onClose }: InfoPanelProps) {
  if (!station && !loading) return null;

  return (
    <div className="absolute right-3 top-16 z-10 w-72 rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur">
      <button
        onClick={onClose}
        className="absolute right-2 top-2 text-gray-400 hover:text-gray-700"
        aria-label="Close"
      >
        &times;
      </button>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : station ? (
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{station.station_name}</h2>
            {station.station_name_en && (
              <p className="text-xs text-gray-500">{station.station_name_en}</p>
            )}
            {station.station_name_cn && (
              <p className="text-xs text-gray-400">{station.station_name_cn}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {station.lines.map((line) => (
              <span
                key={line.line_id}
                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: getLineColor(line.line_name, line.line_color ?? undefined) }}
              >
                {line.line_name}
              </span>
            ))}
          </div>

          {station.transfers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600">Transfers</h4>
              <ul className="mt-1 space-y-0.5">
                {station.transfers.map((t, i) => (
                  <li key={i} className="text-xs text-gray-700">
                    {t.from_line_name} &rarr; {t.to_line_name}
                    {t.transfer_time != null && (
                      <span className="ml-1 text-gray-400">({t.transfer_time}min)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {station.exits.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600">Exits ({station.exits.length})</h4>
              <ul className="mt-1 max-h-32 space-y-0.5 overflow-y-auto">
                {station.exits.map((exit) => (
                  <li key={exit.exit_id} className="text-xs text-gray-700">
                    #{exit.exit_number}
                    {exit.exit_name && <span className="ml-1 text-gray-500">{exit.exit_name}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {station.address && (
            <p className="text-xs text-gray-500">{station.address}</p>
          )}
          {station.phone && (
            <p className="text-xs text-gray-500">{station.phone}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
