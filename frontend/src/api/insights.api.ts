import type {
  AggregatesResponse,
  ApiResult,
  FilterOptionsResponse,
  FilterParams,
  PaginatedInsightsResponse,
} from '../types/index.js';
import { buildQueryString, fetchApiResult } from './client.js';

export async function getInsights(
  params?: FilterParams,
): Promise<ApiResult<PaginatedInsightsResponse>> {
  const query = buildQueryString(params as Record<string, unknown> | undefined);
  return fetchApiResult<PaginatedInsightsResponse>(`/insights${query}`);
}

export async function getFilters(): Promise<ApiResult<FilterOptionsResponse>> {
  return fetchApiResult<FilterOptionsResponse>('/filters');
}

export async function getAggregates(params?: FilterParams): Promise<ApiResult<AggregatesResponse>> {
  const query = buildQueryString(params as Record<string, unknown> | undefined);
  return fetchApiResult<AggregatesResponse>(`/aggregates${query}`);
}
