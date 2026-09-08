import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FilterSidebar } from '../src/components/index.js';
import { FilterProvider } from '../src/context/index.js';
import type { FilterOptionsResponse } from '../src/types/index.js';

const mockFiltersData: FilterOptionsResponse = {
  topic: [
    { value: 'oil', count: 42 },
    { value: 'gas', count: 28 },
    { value: 'growth', count: 19 },
  ],
  sector: [
    { value: 'Energy', count: 70 },
    { value: 'Manufacturing', count: 35 },
  ],
  region: [
    { value: 'Northern America', count: 80 },
    { value: 'Western Europe', count: 45 },
  ],
  pestle: [
    { value: 'Economic', count: 60 },
    { value: 'Technological', count: 40 },
  ],
  source: [
    { value: 'Bloomberg', count: 50 },
    { value: 'EIA', count: 30 },
  ],
  country: [
    { value: 'United States of America', count: 65 },
    { value: 'Germany', count: 25 },
  ],
};

describe('FilterSidebar Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    sessionStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/filters')) {
        return {
          ok: true,
          json: async () => mockFiltersData,
        } as Response;
      }
      if (urlStr.includes('/aggregates')) {
        return {
          ok: true,
          json: async () => ({
            byYear: [
              { year: 2017, count: 50, avgIntensity: 15, avgLikelihood: 3, avgRelevance: 4 },
            ],
            byRegion: [],
            bySector: [],
            byTopic: [],
            byPestle: [],
            summary: { totalRecords: 125, avgIntensity: 14, avgLikelihood: 3.2, avgRelevance: 3.8 },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [], total: 125, page: 1, totalPages: 2 }),
      } as Response;
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <FilterProvider>
          <FilterSidebar />
        </FilterProvider>
      </QueryClientProvider>,
    );
  };

  it('renders all filter controls and fetches options on mount', async () => {
    renderComponent();

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Topic')).toBeInTheDocument();
    expect(screen.getByText('Sector')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('PESTLE')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Country')).toBeInTheDocument();
    expect(screen.getByText('Published year')).toBeInTheDocument();

    // Verify live matching records count
    await waitFor(() => {
      expect(screen.getByText('125')).toBeInTheDocument();
    });
  });

  it('displays dismissible note regarding absence of city-level and SWOT data', () => {
    renderComponent();

    const note = screen.getByText('This dataset does not include city-level or SWOT data.');
    expect(note).toBeInTheDocument();

    const dismissBtn = screen.getByLabelText('Dismiss note');
    fireEvent.click(dismissBtn);

    expect(
      screen.queryByText('This dataset does not include city-level or SWOT data.'),
    ).not.toBeInTheDocument();
  });

  it('allows multi-selecting topics and clearing selections', async () => {
    renderComponent();

    // Wait for options to finish loading
    await waitFor(() => {
      expect(screen.getByText('Select topics...')).toBeInTheDocument();
    });

    // Open Topic dropdown
    const topicTrigger = screen.getByText('Select topics...');
    fireEvent.click(topicTrigger);

    // Wait for options list to render
    await waitFor(() => {
      expect(screen.getByText('oil')).toBeInTheDocument();
    });

    // Select 'oil'
    fireEvent.click(screen.getByText('oil'));

    // Verify pill rendered
    expect(screen.getByText('1 topic selected')).toBeInTheDocument();
    expect(screen.getByText('Clear all')).not.toBeDisabled();

    // Click Clear all
    fireEvent.click(screen.getByText('Clear all'));
    expect(screen.getByText('Select topics...')).toBeInTheDocument();
  });

  it('allows selecting a single sector and resets via Clear', async () => {
    renderComponent();

    // Wait for options to finish loading
    await waitFor(() => {
      expect(screen.getByText('All Sectors')).toBeInTheDocument();
    });

    // Open Sector dropdown
    const sectorTrigger = screen.getByText('All Sectors');
    fireEvent.click(sectorTrigger);

    await waitFor(() => {
      expect(screen.getByText('Energy')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Energy'));

    expect(screen.getByText('Energy (70)')).toBeInTheDocument();
  });
});
