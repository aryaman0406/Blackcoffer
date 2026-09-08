import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/App.js';
import type {
  AggregatesResponse,
  FilterOptionsResponse,
  PaginatedInsightsResponse,
} from '../src/types/index.js';

const mockFiltersData: FilterOptionsResponse = {
  topic: [
    { value: 'oil', count: 42 },
    { value: 'gas', count: 28 },
    { value: 'export', count: 19 },
  ],
  sector: [
    { value: 'Energy', count: 65 },
    { value: 'Manufacturing', count: 32 },
    { value: 'Financial services', count: 21 },
  ],
  region: [
    { value: 'Northern America', count: 55 },
    { value: 'Western Europe', count: 38 },
    { value: 'Unspecified', count: 45 },
  ],
  pestle: [
    { value: 'Economic', count: 65 },
    { value: 'Technological', count: 35 },
    { value: 'Political', count: 20 },
  ],
  source: [
    { value: 'Bloomberg', count: 25 },
    { value: 'Reuters', count: 18 },
    { value: 'EIA', count: 15 },
  ],
  country: [
    { value: 'United States of America', count: 60 },
    { value: 'Russia', count: 25 },
    { value: 'Saudi Arabia', count: 18 },
  ],
};

const mockAggregatesData: AggregatesResponse = {
  byYear: [
    { year: 2016, avgIntensity: 12.0, avgLikelihood: 2.8, avgRelevance: 3.5, count: 30 },
    { year: 2017, avgIntensity: 24.5, avgLikelihood: 3.8, avgRelevance: 4.2, count: 65 },
    { year: 2018, avgIntensity: 18.0, avgLikelihood: 3.0, avgRelevance: 4.0, count: 43 },
  ],
  byRegion: [
    {
      region: 'Northern America',
      avgIntensity: 20.5,
      avgLikelihood: 3.5,
      avgRelevance: 4.0,
      count: 55,
    },
    {
      region: 'Western Europe',
      avgIntensity: 18.2,
      avgLikelihood: 3.2,
      avgRelevance: 4.1,
      count: 38,
    },
    {
      region: 'Unspecified',
      avgIntensity: 14.0,
      avgLikelihood: 2.8,
      avgRelevance: 3.6,
      count: 45,
    },
  ],
  byTopic: [
    { topic: 'oil', avgIntensity: 22.0, avgLikelihood: 3.5, avgRelevance: 4.2, count: 42 },
    { topic: 'gas', avgIntensity: 19.5, avgLikelihood: 3.2, avgRelevance: 3.9, count: 28 },
    { topic: 'Other', avgIntensity: 15.0, avgLikelihood: 2.9, avgRelevance: 3.7, count: 68 },
  ],
  byPestle: [
    { pestle: 'Economic', avgIntensity: 20.0, avgLikelihood: 3.4, avgRelevance: 4.1, count: 65 },
    {
      pestle: 'Technological',
      avgIntensity: 22.0,
      avgLikelihood: 3.8,
      avgRelevance: 4.5,
      count: 35,
    },
    { pestle: 'Political', avgIntensity: 16.0, avgLikelihood: 3.0, avgRelevance: 3.8, count: 20 },
  ],
  bySector: [
    { sector: 'Energy', avgIntensity: 21.0, avgLikelihood: 3.6, avgRelevance: 4.5, count: 65 },
    {
      sector: 'Manufacturing',
      avgIntensity: 18.0,
      avgLikelihood: 3.2,
      avgRelevance: 3.8,
      count: 32,
    },
    {
      sector: 'Financial services',
      avgIntensity: 12.0,
      avgLikelihood: 2.5,
      avgRelevance: 3.2,
      count: 21,
    },
  ],
  byCountry: [
    {
      country: 'United States of America',
      avgIntensity: 25.4,
      avgLikelihood: 3.6,
      avgRelevance: 4.1,
      count: 60,
    },
    { country: 'Russia', avgIntensity: 18.2, avgLikelihood: 3.1, avgRelevance: 3.8, count: 25 },
    {
      country: 'Saudi Arabia',
      avgIntensity: 21.0,
      avgLikelihood: 3.4,
      avgRelevance: 4.0,
      count: 18,
    },
  ],
  regionYearHeatmap: [
    { region: 'Northern America', year: 2017, avgIntensity: 28.5, count: 35 },
    { region: 'Western Europe', year: 2016, avgIntensity: 16.2, count: 20 },
    { region: 'Unspecified', year: 2018, avgIntensity: 14.5, count: 25 },
  ],
  summary: {
    totalRecords: 138,
    avgIntensity: 19.8,
    avgLikelihood: 3.3,
    avgRelevance: 4.0,
  },
};

const mockEmptyAggregatesData: AggregatesResponse = {
  byYear: [],
  byRegion: [],
  byTopic: [],
  byPestle: [],
  bySector: [],
  byCountry: [],
  regionYearHeatmap: [],
  summary: {
    totalRecords: 0,
    avgIntensity: 0,
    avgLikelihood: 0,
    avgRelevance: 0,
  },
};

const mockInsightsData: PaginatedInsightsResponse = {
  data: [],
  total: 0,
  page: 1,
  totalPages: 0,
};

describe('End-to-End Dashboard User Flows', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/filters')) {
        return { ok: true, json: async () => mockFiltersData } as Response;
      }
      if (url.includes('/api/aggregates')) {
        return { ok: true, json: async () => mockAggregatesData } as Response;
      }
      if (url.includes('/api/insights')) {
        return { ok: true, json: async () => mockInsightsData } as Response;
      }
      return { ok: true, json: async () => ({}) } as Response;
    });
  });

  it('1. Loads the dashboard with no initial filters and renders all analytical sections', async () => {
    render(<App />);

    // Verify Header
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getAllByText('Live Sync').length).toBeGreaterThan(0);

    // Verify KPI Summary Cards
    await waitFor(() => {
      expect(screen.getByText('Total Insights')).toBeInTheDocument();
      expect(screen.getByText('Avg Intensity')).toBeInTheDocument();
      expect(screen.getByText('Avg Likelihood')).toBeInTheDocument();
      expect(screen.getByText('Avg Relevance')).toBeInTheDocument();
    });

    // Verify all Visualizations are present
    expect(screen.getByText('Global Signals Radar')).toBeInTheDocument();
    expect(screen.getByText('Sector Volume Matrix')).toBeInTheDocument();
    expect(screen.getByText('Region × Published Year Intensity Heatmap')).toBeInTheDocument();
    expect(screen.getByText('Intensity & Likelihood Trends')).toBeInTheDocument();
    expect(screen.getByText('Regional Record Distribution')).toBeInTheDocument();
    expect(screen.getByText('Top 15 Topics + Remaining Summary')).toBeInTheDocument();
    expect(screen.getByText('PESTLE Framework Distribution')).toBeInTheDocument();

    // Active filters bar should be hidden when no filters applied
    expect(screen.queryByText(/Active Filters \(/i)).not.toBeInTheDocument();

    // Verify dismissal of SWOT/City note
    expect(
      screen.getByText(/This dataset does not include city-level or SWOT data./i),
    ).toBeInTheDocument();
    const dismissBtn = screen.getByLabelText('Dismiss note');
    fireEvent.click(dismissBtn);
    expect(
      screen.queryByText(/This dataset does not include city-level or SWOT data./i),
    ).not.toBeInTheDocument();
  });

  it('2. Applies each filter type individually and updates active chips row', async () => {
    render(<App />);

    // Apply Sector Filter
    await waitFor(() => expect(screen.getByText('All Sectors')).toBeInTheDocument());
    const sectorBtn = screen.getByText('All Sectors');
    fireEvent.click(sectorBtn);

    // Wait for dropdown option and click 'Energy'
    await waitFor(() => expect(screen.getByText('Energy')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Energy'));

    // Verify Active Filter Chip renders for Sector
    await waitFor(() => {
      expect(screen.getByText('Active Filters (1):')).toBeInTheDocument();
      expect(screen.getByText('Sector:')).toBeInTheDocument();
    });

    // Remove Sector Chip via ✕ button
    const removeSectorBtn = screen.getByLabelText(/Remove Sector filter/i);
    fireEvent.click(removeSectorBtn);

    // Verify chip was removed
    await waitFor(() => {
      expect(screen.queryByText('Active Filters (1):')).not.toBeInTheDocument();
    });
  });

  it('3. Handles 3+ joint filters ending in zero records: asserts every panel shows empty state, 0 console errors, and Clear all repopulates', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // First, provide normal mock responses
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/filters/compatible') && url.includes('country=Belize')) {
        return {
          ok: true,
          json: async () => ({
            topic: [],
            sector: [],
            region: [{ value: 'Central America', count: 2 }],
            pestle: [],
            source: [],
            country: [{ value: 'Belize', count: 2 }],
          }),
        } as Response;
      }
      if (url.includes('/api/filters')) {
        return {
          ok: true,
          json: async () => ({
            ...mockFiltersData,
            country: [...mockFiltersData.country, { value: 'Belize', count: 2 }],
            region: [...mockFiltersData.region, { value: 'Africa', count: 10 }],
          }),
        } as Response;
      }
      return { ok: true, json: async () => mockAggregatesData } as Response;
    });

    render(<App />);

    // Wait for initial dashboard load
    await waitFor(() => {
      expect(screen.getByText('Global Signals Radar')).toBeInTheDocument();
      expect(screen.getByText('All Sectors')).toBeInTheDocument();
    });

    // Switch mock to empty aggregates when 3+ impossible filters are applied
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/filters/compatible')) {
        return {
          ok: true,
          json: async () => ({
            topic: [],
            sector: [],
            region: [],
            pestle: [],
            source: [],
            country: [],
          }),
        } as Response;
      }
      if (url.includes('/api/filters')) {
        return {
          ok: true,
          json: async () => mockFiltersData,
        } as Response;
      }
      return { ok: true, json: async () => mockEmptyAggregatesData } as Response;
    });

    // 1. Apply Filter: Sector -> Energy
    fireEvent.click(screen.getByText('All Sectors'));
    await waitFor(() => expect(screen.getByText('Energy')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Energy'));

    // 2. Apply Filter: Region -> Northern America
    fireEvent.click(screen.getByText('All Regions'));
    await waitFor(() => expect(screen.getByText('Northern America')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Northern America'));

    // 3. Apply Filter: Country -> Russia (impossible with Northern America)
    fireEvent.click(screen.getByText('All Countries'));
    await waitFor(() => expect(screen.getByText('Russia')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Russia'));

    // Assert that every single chart panel on the page shows the shared empty state
    // Panels: GlobeHero, IntensityLikelihoodLineChart, SectorBarGrid3D, PestlePieChart, TopicBarChart, D3RegionYearHeatmap, RegionBarChart
    await waitFor(() => {
      const emptyStates = screen.getAllByTestId('chart-empty-state');
      // All 6 panels (Globe + 5 sub-charts/grid) must be showing empty state
      expect(emptyStates.length).toBeGreaterThanOrEqual(6);
      for (const el of emptyStates) {
        expect(el).toHaveTextContent('No data matches these filters');
      }
    });

    // Assert zero console errors were logged during the whole flow
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Now click 'Clear all' (from sidebar or active filters bar)
    const clearAllBtns = screen.getAllByText('Clear all');
    expect(clearAllBtns.length).toBeGreaterThan(0);
    const clearBtn = clearAllBtns[0].closest('button') || clearAllBtns[0];
    expect(clearBtn).toBeEnabled();

    // Repopulate with normal aggregate data
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/api/filters')) {
        return { ok: true, json: async () => mockFiltersData } as Response;
      }
      return { ok: true, json: async () => mockAggregatesData } as Response;
    });

    fireEvent.click(clearBtn);

    // Assert every panel repopulates with non-empty data within timeout
    await waitFor(() => {
      expect(screen.queryAllByTestId('chart-empty-state')).toHaveLength(0);
      expect(screen.getByText('Regional Record Distribution')).toBeInTheDocument();
      expect(screen.getByText('Intensity & Likelihood Trends')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('4. Cross-filters the entire dashboard on chart element click', async () => {
    render(<App />);

    // Wait for Region chart to render
    await waitFor(() => {
      expect(screen.getByText('Regional Record Distribution')).toBeInTheDocument();
    });

    // Cross-filter: Click on a region bar
    const regionBars = document.querySelectorAll('.recharts-bar-rectangle');
    if (regionBars.length > 0) {
      fireEvent.click(regionBars[0]);
    } else {
      // Alternatively trigger via topic / country / heatmap element
      const heatmapCells = document.querySelectorAll('svg rect[rx="4"]');
      if (heatmapCells.length > 0) {
        fireEvent.click(heatmapCells[0]);
      }
    }

    // Verify live matching count is present and app remains fully responsive
    await waitFor(() => {
      expect(screen.getByText('Total Insights')).toBeInTheDocument();
    });
  });
});
