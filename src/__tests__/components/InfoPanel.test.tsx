import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import InfoPanel from '../../components/InfoPanel';
import type { StationDetail } from '../../types';

const mockStation: StationDetail = {
  station_id: 1,
  station_code: 'S001',
  station_name: 'Seoul Station',
  station_name_en: 'Seoul',
  station_name_cn: '首尔',
  latitude: 37.55,
  longitude: 126.97,
  is_transfer: true,
  address: '123 Seoul Rd',
  phone: '02-1234-5678',
  lines: [
    { line_id: 1, line_name: '1호선', line_color: '#0052A4' },
    { line_id: 4, line_name: '4호선', line_color: '#00A5DE' },
  ],
  exits: [
    { exit_id: 1, exit_number: '1', exit_name: 'Main Exit' },
    { exit_id: 2, exit_number: '2' },
  ],
  transfers: [
    {
      transfer_id: 1,
      to_station_id: 1,
      to_station_name: 'Seoul Station',
      from_line_id: 1,
      from_line_name: '1호선',
      to_line_id: 4,
      to_line_name: '4호선',
      transfer_time: 5,
    },
  ],
};

describe('InfoPanel', () => {
  it('renders nothing when no station and not loading', () => {
    const { container } = render(
      <InfoPanel station={null} loading={false} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state', () => {
    render(<InfoPanel station={null} loading={true} onClose={vi.fn()} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders station name and details', () => {
    render(<InfoPanel station={mockStation} loading={false} onClose={vi.fn()} />);

    expect(screen.getByText('Seoul Station')).toBeInTheDocument();
    expect(screen.getByText('Seoul')).toBeInTheDocument();
    expect(screen.getByText('首尔')).toBeInTheDocument();
  });

  it('renders line badges', () => {
    render(<InfoPanel station={mockStation} loading={false} onClose={vi.fn()} />);
    expect(screen.getByText('1호선')).toBeInTheDocument();
    expect(screen.getByText('4호선')).toBeInTheDocument();
  });

  it('renders transfers', () => {
    render(<InfoPanel station={mockStation} loading={false} onClose={vi.fn()} />);
    expect(screen.getByText('Transfers')).toBeInTheDocument();
    // Line names appear in both badges and transfer list, so use getAllByText
    expect(screen.getAllByText(/1호선/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/4호선/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('(5min)')).toBeInTheDocument();
  });

  it('renders exits', () => {
    render(<InfoPanel station={mockStation} loading={false} onClose={vi.fn()} />);
    expect(screen.getByText('Exits (2)')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Main Exit')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('renders address and phone', () => {
    render(<InfoPanel station={mockStation} loading={false} onClose={vi.fn()} />);
    expect(screen.getByText('123 Seoul Rd')).toBeInTheDocument();
    expect(screen.getByText('02-1234-5678')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<InfoPanel station={mockStation} loading={false} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});
