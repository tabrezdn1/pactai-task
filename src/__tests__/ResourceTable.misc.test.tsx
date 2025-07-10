import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceTable } from '@/components/ResourceTable';
import { sampleResourceData } from '@/data/sampleData';

jest.mock('@tanstack/react-virtual', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useVirtualizer: (opts: any) => {
      const count = opts.count ?? 0;
      const size = (opts.estimateSize ? opts.estimateSize() : 30) as number;
      return {
        getVirtualItems: () =>
          Array.from({ length: count }).map((_, idx) => ({
            index: idx,
            start: idx * size,
            end: (idx + 1) * size,
            size,
          })),
        getTotalSize: () => count * size,
      };
    },
  };
});

describe('ResourceTable edge cases', () => {
  it('renders loading skeleton', async () => {
    render(<ResourceTable data={[]} loading={true} />);
    expect(await screen.findByText(/loading resource data/i)).toBeInTheDocument();
  });

  it('shows error alert and allows retry', async () => {
    const onRetry = jest.fn();
    render(<ResourceTable data={[]} error="Failed" onRefresh={onRetry} />);

    expect(await screen.findByText('Failed')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    await userEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });

  it('displays various state badges and processed-time pending text', async () => {
    render(<ResourceTable data={sampleResourceData} />);

    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Processing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Failed').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
  });

  it('renders formatted date strings', async () => {
    render(<ResourceTable data={sampleResourceData} />);

    // Created date Jan 15 (may vary by locale, check month abbreviation)
    expect(screen.getAllByText(/jan/i).length).toBeGreaterThan(0);
  });

  it('prev/next buttons disabled when single page', async () => {
    render(<ResourceTable data={sampleResourceData} />);

    expect(screen.getByRole('button', { name: /prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
  });

  it('paginates large dataset with page-size select and next button', async () => {
    // Create a larger data set by cloning sample rows
    const largeData = Array.from({ length: 30 }).map((_, idx) => {
      const clone = JSON.parse(JSON.stringify(sampleResourceData[idx % sampleResourceData.length]));
      // ensure unique patientId per row so table key differences don't collide
      clone.resource.metadata.identifier.patientId = `patient-${idx}`;
      return clone;
    });

    render(<ResourceTable data={largeData} />);

    // Page count should be 1 of 1 initially (30 rows, default pageSize 100)
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();

    // Change rows per page to 25
    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, '25');

    // After changing page size, page count becomes 2
    expect(await screen.findByText(/Page 1 of 2/i)).toBeInTheDocument();

    // Click next
    const nextBtn = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextBtn);
    expect(await screen.findByText(/Page 2 of 2/i)).toBeInTheDocument();

    // Change page via input + Go
    const pageInput = screen.getByRole('spinbutton');
    await userEvent.clear(pageInput);
    await userEvent.type(pageInput, '1');
    // Press Enter to trigger handleGoToPage via keydown
    await userEvent.type(pageInput, '{enter}');

    expect(await screen.findByText(/Page 1 of 2/i)).toBeInTheDocument();
  });
}); 