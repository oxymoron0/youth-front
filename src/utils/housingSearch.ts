import type { HousingListItem } from '../types/housing';

/**
 * Filter housings by a free-text query, matching against the housing name,
 * its district (자치구), and its dong (洞). Case-insensitive substring match.
 * An empty/whitespace query returns an empty list.
 */
export function filterHousings(
  housings: HousingListItem[],
  query: string,
): HousingListItem[] {
  const trimmed = query.trim().toLowerCase();
  if (trimmed === '') {
    return [];
  }
  return housings.filter((h) => {
    const haystacks = [h.home_name, h.address_gu, h.address_dong];
    return haystacks.some(
      (field) => field != null && field.toLowerCase().includes(trimmed),
    );
  });
}
