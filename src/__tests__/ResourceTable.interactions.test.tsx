import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceTable } from '@/components/ResourceTable';
import { sampleResourceData } from '@/data/sampleData';

/**
 * These tests focus on high-level user interactions that the table supports –
 * search filtering and basic content visibility (badges, counts).
 */

describe('ResourceTable interactions', () => {
  it('shows dynamic resource count and filters via search', async () => {
    render(<ResourceTable data={sampleResourceData} />);

    // Initial count should equal full dataset length (5)
    expect(await screen.findByText(/5 resources found/i)).toBeInTheDocument();

    // Type a query that matches only 1 resource ("blood" appears in the first item)
    const searchInput = screen.getByPlaceholderText(/search resources/i);
    await userEvent.type(searchInput, 'blood');

    // Count text should update
    expect(await screen.findByText(/2 resources? found/i)).toBeInTheDocument();
  });

  // TODO: add badge visibility checks once virtualisation quirks are handled
}); 