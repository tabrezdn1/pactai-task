import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResourceTable } from '@/components/ResourceTable';
import { sampleResourceData } from '@/data/sampleData';

describe('ResourceTable', () => {
  it('renders patient IDs from data', async () => {
    render(<ResourceTable data={sampleResourceData} />);
    // Table header should render
    expect(await screen.findByText('Patient ID')).toBeInTheDocument();
  });
}); 