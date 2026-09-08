import React, { useCallback, useMemo, useState } from 'react';
import { useAggregates } from '../hooks/index.js';
import type { FilterParams } from '../types/index.js';
import {
  type ActiveFilters,
  FilterContext,
  type FilterContextValue,
  initialFilters,
} from './filter-context.js';

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<ActiveFilters>(initialFilters);

  // Convert active UI filters to API query params
  const filterParams = useMemo<FilterParams>(() => {
    return {
      topic: filters.topic.length > 0 ? filters.topic.join(',') : undefined,
      sector: filters.sector || undefined,
      region: filters.region || undefined,
      pestle: filters.pestle || undefined,
      source: filters.source || undefined,
      country: filters.country || undefined,
      minYear: filters.minYear,
      maxYear: filters.maxYear,
      minIntensity: filters.minIntensity,
      maxIntensity: filters.maxIntensity,
      minLikelihood: filters.minLikelihood,
      minRelevance: filters.minRelevance,
      page: filters.page,
      limit: filters.limit,
    };
  }, [filters]);

  // Fetch count of currently matching records
  const { data: aggregateResult, isLoading: isLoadingMatchingCount } = useAggregates(filterParams);
  const matchingCount = aggregateResult?.data?.summary?.totalRecords ?? 0;

  const setFilter = useCallback(
    <K extends keyof ActiveFilters>(key: K, value: ActiveFilters[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: 1, // Reset to first page whenever a filter changes
      }));
    },
    [],
  );

  const toggleTopic = useCallback((topic: string) => {
    setFilters((prev) => {
      const exists = prev.topic.includes(topic);
      const nextTopics = exists ? prev.topic.filter((t) => t !== topic) : [...prev.topic, topic];
      return {
        ...prev,
        topic: nextTopics,
        page: 1,
      };
    });
  }, []);

  const removeTopic = useCallback((topic: string) => {
    setFilters((prev) => ({
      ...prev,
      topic: prev.topic.filter((t) => t !== topic),
      page: 1,
    }));
  }, []);

  const setYearRange = useCallback((minYear?: number, maxYear?: number) => {
    setFilters((prev) => ({
      ...prev,
      minYear,
      maxYear,
      page: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const resetFilter = useCallback((key: keyof ActiveFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: initialFilters[key],
      page: 1,
    }));
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.topic.length > 0) count += filters.topic.length;
    if (filters.sector) count++;
    if (filters.region) count++;
    if (filters.pestle) count++;
    if (filters.source) count++;
    if (filters.country) count++;
    if (filters.minYear !== undefined || filters.maxYear !== undefined) count++;
    if (filters.minIntensity !== undefined || filters.maxIntensity !== undefined) count++;
    if (filters.minLikelihood !== undefined) count++;
    if (filters.minRelevance !== undefined) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      filterParams,
      matchingCount,
      isLoadingMatchingCount,
      activeFilterCount,
      hasActiveFilters,
      setFilter,
      toggleTopic,
      removeTopic,
      setYearRange,
      clearFilters,
      resetFilter,
    }),
    [
      filters,
      filterParams,
      matchingCount,
      isLoadingMatchingCount,
      activeFilterCount,
      hasActiveFilters,
      setFilter,
      toggleTopic,
      removeTopic,
      setYearRange,
      clearFilters,
      resetFilter,
    ],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
