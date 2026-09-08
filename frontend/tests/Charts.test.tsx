import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  D3RegionYearHeatmap,
  IntensityLikelihoodLineChart,
  PestlePieChart,
  RegionBarChart,
  SectorBarGrid3D,
  SectorRelevanceBarChart,
  TopicBarChart,
  WorldChoroplethMap,
} from '../src/charts/index.js';
import { FilterProvider } from '../src/context/index.js';
import type { AggregatesResponse } from '../src/types/index.js';

const mockAggregatesData: AggregatesResponse = {
  byYear: [
    { year: 2016, avgIntensity: 10, avgLikelihood: 2.5, avgRelevance: 3.5, count: 20 },
    { year: 2017, avgIntensity: 24.5, avgLikelihood: 3.8, avgRelevance: 4.2, count: 50 },
    { year: 2018, avgIntensity: 18, avgLikelihood: 3.0, avgRelevance: 4.0, count: 30 },
  ],
  byRegion: [
    {
      region: 'Northern America',
      avgIntensity: 20,
      avgLikelihood: 3.5,
      avgRelevance: 4.0,
      count: 55,
    },
    {
      region: 'Western Europe',
      avgIntensity: 18,
      avgLikelihood: 3.2,
      avgRelevance: 4.1,
      count: 35,
    },
    { region: 'Unspecified', avgIntensity: 14, avgLikelihood: 2.8, avgRelevance: 3.6, count: 45 },
  ],
  byTopic: [
    { topic: 'oil', avgIntensity: 22, avgLikelihood: 3.5, avgRelevance: 4.2, count: 40 },
    { topic: 'gas', avgIntensity: 19, avgLikelihood: 3.2, avgRelevance: 3.9, count: 25 },
    { topic: 'Other', avgIntensity: 15, avgLikelihood: 2.9, avgRelevance: 3.7, count: 60 },
  ],
  byPestle: [
    { pestle: 'Economic', avgIntensity: 20, avgLikelihood: 3.4, avgRelevance: 4.1, count: 65 },
    { pestle: 'Technological', avgIntensity: 22, avgLikelihood: 3.8, avgRelevance: 4.5, count: 35 },
    { pestle: 'Environmental', avgIntensity: 16, avgLikelihood: 3.0, avgRelevance: 3.8, count: 25 },
  ],
  bySector: [
    { sector: 'Energy', avgIntensity: 21, avgLikelihood: 3.6, avgRelevance: 4.5, count: 70 },
    { sector: 'Manufacturing', avgIntensity: 18, avgLikelihood: 3.2, avgRelevance: 3.8, count: 35 },
    { sector: 'Retail', avgIntensity: 12, avgLikelihood: 2.5, avgRelevance: 3.2, count: 20 },
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
    { region: 'Western Asia', year: 2018, avgIntensity: 22.0, count: 15 },
  ],
  summary: {
    totalRecords: 125,
    avgIntensity: 18.2,
    avgLikelihood: 3.2,
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

describe('Analytics & Advanced Chart Components', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
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

  describe('IntensityLikelihoodLineChart', () => {
    it('renders with dynamic peak intensity caption when data is available', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatesData,
      } as Response);

      renderWithProviders(<IntensityLikelihoodLineChart />);

      expect(screen.getByText('Intensity & Likelihood Trends')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(/Peak average intensity reached 24.5 in 2017/i),
        ).toBeInTheDocument();
      });
    });

    it('renders empty state when filtered dataset has 0 records', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyAggregatesData,
      } as Response);

      renderWithProviders(<IntensityLikelihoodLineChart />);

      await waitFor(() => {
        expect(screen.getByText('No data matches these filters')).toBeInTheDocument();
      });
    });
  });

  describe('RegionBarChart', () => {
    it('renders with explicit Unspecified caption and data', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatesData,
      } as Response);

      renderWithProviders(<RegionBarChart />);

      expect(screen.getByText('Regional Record Distribution')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Northern America leads with 55 records/i)).toBeInTheDocument();
        expect(screen.getByText(/Unspecified regions account for/i)).toBeInTheDocument();
      });
    });

    it('renders empty state when empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyAggregatesData,
      } as Response);

      renderWithProviders(<RegionBarChart />);

      await waitFor(() => {
        expect(screen.getByText('No data matches these filters')).toBeInTheDocument();
      });
    });
  });

  describe('TopicBarChart', () => {
    it('renders top topic caption and handles top topics + Other bucket', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatesData,
      } as Response);

      renderWithProviders(<TopicBarChart />);

      expect(screen.getByText('Top 15 Topics + Remaining Summary')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/"oil" is the most prominent topic/i)).toBeInTheDocument();
      });
    });

    it('renders empty state when empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyAggregatesData,
      } as Response);

      renderWithProviders(<TopicBarChart />);

      await waitFor(() => {
        expect(screen.getByText('No data matches these filters')).toBeInTheDocument();
      });
    });
  });

  describe('PestlePieChart', () => {
    it('renders PESTLE category distribution and leading factor caption', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatesData,
      } as Response);

      renderWithProviders(<PestlePieChart />);

      expect(screen.getByText('PESTLE Framework Distribution')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(/Economic factors lead PESTLE distribution with 65 records/i),
        ).toBeInTheDocument();
      });
    });

    it('renders empty state when empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyAggregatesData,
      } as Response);

      renderWithProviders(<PestlePieChart />);

      await waitFor(() => {
        expect(screen.getByText('No data matches these filters')).toBeInTheDocument();
      });
    });
  });

  describe('SectorRelevanceBarChart', () => {
    it('renders average relevance by sector and dynamic caption', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatesData,
      } as Response);

      renderWithProviders(<SectorRelevanceBarChart />);

      expect(screen.getByText('Average Relevance by Sector')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(/Energy is the most-covered sector/i)).toBeInTheDocument();
      });
    });

    it('renders empty state when empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyAggregatesData,
      } as Response);

      renderWithProviders(<SectorRelevanceBarChart />);

      await waitFor(() => {
        expect(screen.getByText('No data matches these filters')).toBeInTheDocument();
      });
    });
  });

  describe('WorldChoroplethMap', () => {
    it('renders world map with peak country intensity caption', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatesData,
      } as Response);

      renderWithProviders(<WorldChoroplethMap />);

      expect(screen.getByText('Global Intensity Distribution Map')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(/Peak country intensity: United States of America/i),
        ).toBeInTheDocument();
        expect(screen.getByText('No Data (Neutral Grey)')).toBeInTheDocument();
      });
    });

    it('renders empty state when country data is empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyAggregatesData,
      } as Response);

      renderWithProviders(<WorldChoroplethMap />);

      await waitFor(() => {
        expect(screen.getByText('No data matches these filters')).toBeInTheDocument();
      });
    });
  });

  describe('D3RegionYearHeatmap', () => {
    it('renders region x year heatmap with peak concentration caption', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregatesData,
      } as Response);

      renderWithProviders(<D3RegionYearHeatmap />);

      expect(screen.getByText('Region × Published Year Intensity Heatmap')).toBeInTheDocument();

      await waitFor(() => {
        expect(
          screen.getByText(/Peak concentration: Northern America in 2017/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Click any cell to cross-filter dashboard by Region & Year/i),
        ).toBeInTheDocument();
      });
    });

    it('renders empty state when heatmap data is empty', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyAggregatesData,
      } as Response);

      renderWithProviders(<D3RegionYearHeatmap />);

      await waitFor(() => {
        expect(screen.getByText('No data matches these filters')).toBeInTheDocument();
      });
    });
  });

  describe('SectorBarGrid3D (3D Sector Volume Matrix)', () => {
    it('renders shared empty state when filtered dataset has 0 sector records', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyAggregatesData,
      } as Response);

      renderWithProviders(<SectorBarGrid3D />);

      expect(screen.getByText('Sector Volume Matrix')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('No data matches these filters')).toBeInTheDocument();
        expect(
          screen.getByText('No signals match these filters — clear one to see more.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Empty Data Propagation - All Chart Components', () => {
    const allChartComponents = [
      { name: 'IntensityLikelihoodLineChart', component: <IntensityLikelihoodLineChart /> },
      { name: 'RegionBarChart', component: <RegionBarChart /> },
      { name: 'TopicBarChart', component: <TopicBarChart /> },
      { name: 'PestlePieChart', component: <PestlePieChart /> },
      { name: 'SectorRelevanceBarChart', component: <SectorRelevanceBarChart /> },
      { name: 'WorldChoroplethMap', component: <WorldChoroplethMap /> },
      { name: 'D3RegionYearHeatmap', component: <D3RegionYearHeatmap /> },
      { name: 'SectorBarGrid3D (3D Sector Volume Matrix)', component: <SectorBarGrid3D /> },
    ];

    it.each(allChartComponents)(
      'renders shared empty-state component for $name when data is empty (not a blank canvas or crash)',
      async ({ component }) => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
          ok: true,
          json: async () => mockEmptyAggregatesData,
        } as Response);

        const { getByTestId, getByText } = renderWithProviders(component);

        await waitFor(() => {
          expect(getByTestId('chart-empty-state')).toBeInTheDocument();
          expect(getByText('No data matches these filters')).toBeInTheDocument();
        });
      },
    );
  });
});
