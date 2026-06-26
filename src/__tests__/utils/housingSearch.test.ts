import { describe, it, expect } from 'vitest';
import { filterHousings } from '../../utils/housingSearch';
import type { HousingListItem } from '../../types/housing';

function make(overrides: Partial<HousingListItem>): HousingListItem {
  return {
    home_code: '0',
    home_name: '',
    supply_status: '02',
    address_gu: null,
    address_dong: null,
    longitude: null,
    latitude: null,
    deposit_low: null,
    rental_low: null,
    ...overrides,
  };
}

const housings: HousingListItem[] = [
  make({ home_code: '1', home_name: '청량리역 퀸즈W', address_gu: '동대문구', address_dong: '전농동' }),
  make({ home_code: '2', home_name: '충정로역 어바니엘', address_gu: '서대문구', address_dong: '충정로2가' }),
  make({ home_code: '3', home_name: '장한평역 힐데스하임', address_gu: '성동구', address_dong: '성수동1가' }),
];

describe('filterHousings', () => {
  it('returns empty for blank query', () => {
    expect(filterHousings(housings, '')).toEqual([]);
    expect(filterHousings(housings, '   ')).toEqual([]);
  });

  it('matches by housing name', () => {
    const r = filterHousings(housings, '퀸즈');
    expect(r.map((h) => h.home_code)).toEqual(['1']);
  });

  it('matches by district (자치구)', () => {
    const r = filterHousings(housings, '성동구');
    expect(r.map((h) => h.home_code)).toEqual(['3']);
  });

  it('matches by dong (洞)', () => {
    const r = filterHousings(housings, '전농동');
    expect(r.map((h) => h.home_code)).toEqual(['1']);
  });

  it('matches a partial dong name', () => {
    const r = filterHousings(housings, '성수동');
    expect(r.map((h) => h.home_code)).toEqual(['3']);
  });

  it('is case-insensitive', () => {
    const r = filterHousings(housings, '퀸즈w');
    expect(r.map((h) => h.home_code)).toEqual(['1']);
  });

  it('ignores null region fields', () => {
    const data = [make({ home_code: '9', home_name: '이름없는동', address_gu: null, address_dong: null })];
    expect(filterHousings(data, '동대문구')).toEqual([]);
  });
});
