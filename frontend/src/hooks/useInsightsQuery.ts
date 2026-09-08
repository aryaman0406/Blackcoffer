import { type UseQueryOptions, type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getAggregates, getFilters, getInsights } from '../api/index.js';
import type {
  AggregatesResponse,
  ApiResult,
  FilterOptionsResponse,
  FilterParams,
  PaginatedInsightsResponse,
} from '../types/index.js';

export const queryKeys = {
  all: ['insights-root'] as const,
  insights: (params?: FilterParams) => ['insights', params] as const,
  filters: () => ['filters'] as const,
  aggregates: (params?: FilterParams) => ['aggregates', params] as const,
};

export function useInsights(
  params?: FilterParams,
  options?: Omit<
    UseQueryOptions<
      ApiResult<PaginatedInsightsResponse>,
      Error,
      ApiResult<PaginatedInsightsResponse>
    >,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<ApiResult<PaginatedInsightsResponse>, Error> {
  return useQuery({
    queryKey: queryKeys.insights(params),
    queryFn: () => getInsights(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

export function useFilters(
  options?: Omit<
    UseQueryOptions<ApiResult<FilterOptionsResponse>, Error, ApiResult<FilterOptionsResponse>>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<ApiResult<FilterOptionsResponse>, Error> {
  return useQuery({
    queryKey: queryKeys.filters(),
    queryFn: () => getFilters(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    ...options,
  });
}

export function useAggregates(
  params?: FilterParams,
  options?: Omit<
    UseQueryOptions<ApiResult<AggregatesResponse>, Error, ApiResult<AggregatesResponse>>,
    'queryKey' | 'queryFn'
  >,
): UseQueryResult<ApiResult<AggregatesResponse>, Error> {
  return useQuery({
    queryKey: queryKeys.aggregates(params),
    queryFn: () => getAggregates(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}
