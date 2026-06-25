import { useCallback, useState } from 'react';

export interface RecentSearch {
  homeCode: string;
  name: string;
}

const STORAGE_KEY = 'youth:recent-searches';
const MAX_ITEMS = 8;

function isRecent(v: unknown): v is RecentSearch {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as RecentSearch).homeCode === 'string' &&
    typeof (v as RecentSearch).name === 'string'
  );
}

function load(): RecentSearch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecent).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function save(items: RecentSearch[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable / quota — ignore, history is best-effort
  }
}

/**
 * 로그인 없이 브라우저(localStorage)에 최근 검색을 보관한다.
 * 쿠키 불필요 — 기록은 기기에만 남고 서버로 전송되지 않는다.
 */
export function useRecentSearches() {
  const [recents, setRecents] = useState<RecentSearch[]>(() => load());

  const add = useCallback((item: RecentSearch) => {
    setRecents((prev) => {
      const next = [item, ...prev.filter((r) => r.homeCode !== item.homeCode)].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    save([]);
    setRecents([]);
  }, []);

  return { recents, add, clear };
}
