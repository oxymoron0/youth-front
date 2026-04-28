import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchBar from '../../components/SearchBar';

vi.mock('../../hooks/useSearch', () => ({
  useSearch: vi.fn(),
}));

import { useSearch } from '../../hooks/useSearch';

const mockUseSearch = vi.mocked(useSearch);

describe('SearchBar', () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearch.mockReturnValue({ results: [], loading: false });
  });

  it('renders search input', () => {
    render(<SearchBar onSelect={onSelect} />);
    expect(screen.getByPlaceholderText('역 검색...')).toBeInTheDocument();
  });

  it('handles input change', () => {
    render(<SearchBar onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('역 검색...');
    fireEvent.change(input, { target: { value: 'Seoul' } });
    expect(input).toHaveValue('Seoul');
  });

  it('shows results dropdown when results are available', async () => {
    mockUseSearch.mockReturnValue({
      results: [
        {
          station_id: 1,
          station_name: 'Seoul Station',
          station_name_en: 'Seoul',
          latitude: 37.55,
          longitude: 126.97,
          lines: [{ line_id: 1, line_name: '1호선', line_color: '#0052A4' }],
        },
      ],
      loading: false,
    });

    render(<SearchBar onSelect={onSelect} />);
    const input = screen.getByPlaceholderText('역 검색...');
    fireEvent.change(input, { target: { value: 'Se' } });

    await waitFor(() => {
      expect(screen.getByText('Seoul Station')).toBeInTheDocument();
      expect(screen.getByText('1호선')).toBeInTheDocument();
    });
  });

  it('calls onSelect when result is clicked', async () => {
    mockUseSearch.mockReturnValue({
      results: [
        {
          station_id: 42,
          station_name: 'Gangnam',
          latitude: 37.497,
          longitude: 127.027,
          lines: [{ line_id: 2, line_name: '2호선' }],
        },
      ],
      loading: false,
    });

    render(<SearchBar onSelect={onSelect} />);
    fireEvent.change(screen.getByPlaceholderText('역 검색...'), {
      target: { value: 'Gang' },
    });

    await waitFor(() => {
      fireEvent.click(screen.getByText('Gangnam'));
    });

    expect(onSelect).toHaveBeenCalledWith(42, 127.027, 37.497);
  });

  it('shows loading indicator', () => {
    mockUseSearch.mockReturnValue({ results: [], loading: true });
    render(<SearchBar onSelect={onSelect} />);
    fireEvent.change(screen.getByPlaceholderText('역 검색...'), {
      target: { value: 'test' },
    });
    expect(screen.getByText('...')).toBeInTheDocument();
  });
});
