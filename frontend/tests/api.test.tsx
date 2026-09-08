import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildQueryString, getAggregates, getFilters, getInsights } from '../src/api/index.js';
import { useAggregates, useFilters, useInsights } from '../src/hooks/index.js';
import type {
  AggregatesResponse,
  FilterOptionsResponse,
  PaginatedInsightsResponse,
} from '../src/types/index.js';

describe('Frontend API Client & Query Utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildQueryString', () => {
    it('returns empty string when params are undefined or empty', () => {
      expect(buildQueryString()).toBe('');
      expect(buildQueryString({})).toBe('');
    });

    it('builds formatted query string omitting undefined, null, and empty string fields', () => {
      const qs = buildQueryString({
        sector: 'Energy',
        region: '',
        topic: undefined,
        country: null,
        minYear: 2017,
        page: 1,
      });

      expect(qs).toBe('?sector=Energy&minYear=2017&page=1');
    });
  });

  describe('API endpoint functions', () => {
    it('getInsights returns data successfully when fetch succeeds', async () => {
      const mockData: PaginatedInsightsResponse = {
        data: [
          {
            _id: '1',
            title: 'Test Insight',
            insight: 'Test content',
            sector: 'Energy',
            topic: 'oil',
            region: 'World',
            country: 'USA',
            pestle: 'Economic',
            source: 'EIA',
            intensity: 10,
            likelihood: 3,
            relevance: 4,
            start_year: 2018,
            end_year: 2025,
            impact: null,
            added: '2017-01-20T03:51:25.000Z',
            published: '2017-01-15T00:00:00.000Z',
            url: 'https://example.com',
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await getInsights({ sector: 'Energy' });

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
    });

    it('getInsights catches 400 Bad Request error and returns typed error without throwing', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'minIntensity cannot be greater than 100' }),
      } as Response);

      const result = await getInsights({ minIntensity: 150 });

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('minIntensity cannot be greater than 100');
    });

    it('getInsights handles network rejection gracefully returning typed error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch'));

      const result = await getInsights();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Failed to fetch');
    });

    it('getFilters returns distinct filter options with counts', async () => {
      const mockFilters: FilterOptionsResponse = {
        topic: [{ value: 'oil', count: 10 }],
        sector: [{ value: 'Energy', count: 15 }],
        region: [{ value: 'World', count: 20 }],
        pestle: [{ value: 'Economic', count: 12 }],
        source: [{ value: 'EIA', count: 8 }],
        country: [{ value: 'USA', count: 14 }],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilters,
      } as Response);

      const result = await getFilters();

      expect(result.data).toEqual(mockFilters);
      expect(result.error).toBeUndefined();
    });

    it('getAggregates returns pre-aggregated data correctly', async () => {
      const mockAggregates: AggregatesResponse = {
        byYear: [{ year: 2017, avgIntensity: 12, avgLikelihood: 3, avgRelevance: 4, count: 5 }],
        byRegion: [
          { region: 'World', avgIntensity: 10, avgLikelihood: 2, avgRelevance: 3, count: 10 },
        ],
        bySector: [
          { sector: 'Energy', avgIntensity: 15, avgLikelihood: 4, avgRelevance: 4, count: 8 },
        ],
        byTopic: [{ topic: 'oil', avgIntensity: 12, avgLikelihood: 3, avgRelevance: 4, count: 6 }],
        byPestle: [
          { pestle: 'Economic', avgIntensity: 14, avgLikelihood: 3, avgRelevance: 4, count: 7 },
        ],
        byCountry: [
          {
            country: 'United States',
            avgIntensity: 12,
            avgLikelihood: 3,
            avgRelevance: 4,
            count: 5,
          },
        ],
        regionYearHeatmap: [{ region: 'Northern America', year: 2017, avgIntensity: 15, count: 5 }],
        summary: { totalRecords: 10, avgIntensity: 12, avgLikelihood: 3, avgRelevance: 3.5 },
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregates,
      } as Response);

      const result = await getAggregates({ sector: 'Energy' });

      expect(result.data).toEqual(mockAggregates);
      expect(result.error).toBeUndefined();
    });
  });

  describe('React Query Hooks', () => {
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

    const createWrapper = () => {
      return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
    };

    it('useInsights fetches and caches data via React Query', async () => {
      const mockData: PaginatedInsightsResponse = {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { result } = renderHook(() => useInsights({ sector: 'Energy' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ data: mockData });
    });

    it('useFilters fetches filter options via React Query', async () => {
      const mockFilters: FilterOptionsResponse = {
        topic: [],
        sector: [{ value: 'Energy', count: 5 }],
        region: [],
        pestle: [],
        source: [],
        country: [],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilters,
      } as Response);

      const { result } = renderHook(() => useFilters(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data?.sector).toEqual([{ value: 'Energy', count: 5 }]);
    });

    it('useAggregates fetches analytics data via React Query', async () => {
      const mockAggregates: AggregatesResponse = {
        byYear: [],
        byRegion: [],
        bySector: [],
        byTopic: [],
        byPestle: [],
        byCountry: [],
        regionYearHeatmap: [],
        summary: { totalRecords: 0, avgIntensity: 0, avgLikelihood: 0, avgRelevance: 0 },
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockAggregates,
      } as Response);

      const { result } = renderHook(() => useAggregates({ minYear: 2016 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data?.summary.totalRecords).toBe(0);
    });
  });
});
