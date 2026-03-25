import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LineSelector from '../../components/LineSelector';
import type { Line } from '../../types';

const mockLines: Line[] = [
  { line_id: 1, line_code: 'L1', line_name: '1호선', line_color: '#0052A4' },
  { line_id: 2, line_code: 'L2', line_name: '2호선', line_color: '#00A84D' },
  { line_id: 3, line_code: 'L3', line_name: '3호선' },
];

describe('LineSelector', () => {
  it('shows loading state', () => {
    render(
      <LineSelector lines={[]} visibleLines={new Set()} onToggle={vi.fn()} loading={true} />,
    );
    expect(screen.getByText('Loading lines...')).toBeInTheDocument();
  });

  it('renders all lines with checkboxes', () => {
    const visible = new Set([1, 2, 3]);
    render(
      <LineSelector lines={mockLines} visibleLines={visible} onToggle={vi.fn()} loading={false} />,
    );
    expect(screen.getByText('1호선')).toBeInTheDocument();
    expect(screen.getByText('2호선')).toBeInTheDocument();
    expect(screen.getByText('3호선')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
  });

  it('shows unchecked state for non-visible lines', () => {
    const visible = new Set([1]);
    render(
      <LineSelector lines={mockLines} visibleLines={visible} onToggle={vi.fn()} loading={false} />,
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).not.toBeChecked();
  });

  it('calls onToggle when checkbox is clicked', () => {
    const onToggle = vi.fn();
    const visible = new Set([1, 2, 3]);
    render(
      <LineSelector lines={mockLines} visibleLines={visible} onToggle={onToggle} loading={false} />,
    );
    fireEvent.click(screen.getAllByRole('checkbox')[1]!);
    expect(onToggle).toHaveBeenCalledWith(2);
  });
});
