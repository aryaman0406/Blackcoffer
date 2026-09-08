import { createContext } from 'react';
import type { FilterParams } from '../types/index.js';

export interface ActiveFilters {
  topic: string[];
  sector?: string;
  region?: string;
  pestle?: string;
  source?: string;
  country?: string;
  minYear?: number;
  maxYear?: number;
  minIntensity?: number;
  maxIntensity?: number;
  minLikelihood?: number;
  minRelevance?: number;
  page?: number;
  limit?: number;
}

export const initialFilters: ActiveFilters = {
  topic: [],
  sector: undefined,
  region: undefined,
  pestle: undefined,
  source: undefined,
  country: undefined,
  minYear: undefined,
  maxYear: undefined,
  minIntensity: undefined,
  maxIntensity: undefined,
  minLikelihood: undefined,
  minRelevance: undefined,
  page: 1,
  limit: 100,
};

export interface FilterContextValue {
  filters: ActiveFilters;
  filterParams: FilterParams;
  matchingCount: number;
  isLoadingMatchingCount: boolean;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  setFilter: <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => void;
  toggleTopic: (topic: string) => void;
  removeTopic: (topic: string) => void;
  setYearRange: (minYear?: number, maxYear?: number) => void;
  clearFilters: () => void;
  resetFilter: (key: keyof ActiveFilters) => void;
}

export const FilterContext = createContext<FilterContextValue | null>(null);
