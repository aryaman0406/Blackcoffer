import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ActiveFilterChips } from '../src/components/ActiveFilterChips.js';
import { FilterProvider, useFilterContext } from '../src/context/index.js';

const TestComponentWithFilters: React.FC = () => {
  const { setFilter, toggleTopic, setYearRange } = useFilterContext();

  return (
    <div>
      <ActiveFilterChips />
      <button type="button" onClick={() => setFilter('region', 'Northern America')}>
        Set Region
      </button>
      <button type="button" onClick={() => setFilter('pestle', 'Economic')}>
        Set Pestle
      </button>
      <button type="button" onClick={() => toggleTopic('oil')}>
        Toggle Oil
      </button>
      <button type="button" onClick={() => setYearRange(2017, 2017)}>
        Set Year
      </button>
    </div>
  );
};

describe('ActiveFilterChips Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <FilterProvider>{component}</FilterProvider>
      </QueryClientProvider>,
    );
  };

  it('renders nothing when no filters are active', () => {
    const { container } = renderWithProviders(<ActiveFilterChips />);
    expect(container.firstChild).toBeNull();
  });

  it('renders chips when filters are applied and removes them individually', () => {
    renderWithProviders(<TestComponentWithFilters />);

    // Apply Region, Pestle, Topic, and Year filters
    fireEvent.click(screen.getByText('Set Region'));
    fireEvent.click(screen.getByText('Set Pestle'));
    fireEvent.click(screen.getByText('Toggle Oil'));
    fireEvent.click(screen.getByText('Set Year'));

    // Check chips render
    expect(screen.getByText('Active Filters (4):')).toBeInTheDocument();
    expect(screen.getByText('Northern America')).toBeInTheDocument();
    expect(screen.getByText('Economic')).toBeInTheDocument();
    expect(screen.getByText('oil')).toBeInTheDocument();
    expect(screen.getByText('2017')).toBeInTheDocument();

    // Remove Region chip individually
    const removeRegionBtn = screen.getByLabelText(/Remove Region filter/i);
    fireEvent.click(removeRegionBtn);

    expect(screen.queryByText('Northern America')).not.toBeInTheDocument();
    expect(screen.getByText('Active Filters (3):')).toBeInTheDocument();
  });

  it('clears all filters when Clear all button is clicked', () => {
    renderWithProviders(<TestComponentWithFilters />);

    fireEvent.click(screen.getByText('Set Region'));
    fireEvent.click(screen.getByText('Set Pestle'));

    expect(screen.getByText('Active Filters (2):')).toBeInTheDocument();

    const clearAllBtn = screen.getByTitle('Clear all active filters');
    fireEvent.click(clearAllBtn);

    expect(screen.queryByText('Active Filters')).not.toBeInTheDocument();
  });
});
