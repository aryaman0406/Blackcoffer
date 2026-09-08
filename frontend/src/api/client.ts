import type { ApiResult } from '../types/index.js';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function fetchApiResult<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status} (${response.statusText})`;
      try {
        const errorBody = (await response.json()) as { message?: string; error?: string };
        if (errorBody.message) {
          errorMessage = errorBody.message;
        } else if (errorBody.error) {
          errorMessage = errorBody.error;
        }
      } catch {
        // Response body was not JSON
      }
      return { error: errorMessage };
    }

    const data = (await response.json()) as T;
    return { data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected network error occurred';
    return { error: message };
  }
}
