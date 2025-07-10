import React from 'react';
import { render } from '@testing-library/react';
import { ProgressBar } from '@/components/ui/progress';
import '@testing-library/jest-dom';

/**
 * Basic unit tests to verify that the ProgressBar component
 * (a) renders without crashing and (b) correctly clamps the
 * width style between 0 % and 100 %.
 */
describe('ProgressBar', () => {
  const getInnerBar = (container: HTMLElement): HTMLElement => {
    // Select the element that has the inline width style set
    const inner = container.querySelector('div[style]');
    if (!inner) throw new Error('Inner progress element not found');
    return inner as HTMLElement;
  };

  it('renders with correct width for in-range value', () => {
    const { container } = render(<ProgressBar value={42} />);
    const inner = getInnerBar(container);
    expect(inner.getAttribute('style') || '').toContain('width: 42%');
  });

  it('clamps value below 0 to 0%', () => {
    const { container } = render(<ProgressBar value={-10} />);
    const inner = getInnerBar(container);
    expect(inner.getAttribute('style') || '').toContain('width: 0%');
  });

  it('clamps value above 100 to 100%', () => {
    const { container } = render(<ProgressBar value={150} />);
    const inner = getInnerBar(container);
    expect(inner.getAttribute('style') || '').toContain('width: 100%');
  });
});