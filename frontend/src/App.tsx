import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Activity, Database, Layers, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';
import {
  D3RegionYearHeatmap,
  IntensityLikelihoodLineChart,
  PestlePieChart,
  RegionBarChart,
  SectorRelevanceBarChart,
  TopicBarChart,
  WorldChoroplethMap,
} from './charts/index.js';
import { ActiveFilterChips, FilterSidebar, Header } from './components/index.js';
import { FilterProvider, useFilterContext } from './context/index.js';
import { useAggregates } from './hooks/index.js';

const KPISummarySection: React.FC = () => {
  const { filterParams, matchingCount, isLoadingMatchingCount } = useFilterContext();
  const { data: aggregateResult } = useAggregates(filterParams);
  const summary = aggregateResult?.data?.summary;

  const avgIntensity = summary?.avgIntensity ?? 0;
  const avgLikelihood = summary?.avgLikelihood ?? 0;
  const avgRelevance = summary?.avgRelevance ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Matching Records */}
      <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Insights
          </span>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Database className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-white">
            {isLoadingMatchingCount ? '...' : matchingCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">records</span>
        </div>
      </div>

      {/* 2. Average Intensity */}
      <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Avg Intensity
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-cyan-400">
            {isLoadingMatchingCount
              ? '...'
              : Number.isFinite(avgIntensity)
                ? avgIntensity.toFixed(1)
                : '0.0'}
          </span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>

      {/* 3. Average Likelihood */}
      <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Avg Likelihood
          </span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-purple-400">
            {isLoadingMatchingCount
              ? '...'
              : Number.isFinite(avgLikelihood)
                ? avgLikelihood.toFixed(1)
                : '0.0'}
          </span>
          <span className="text-xs text-slate-400">/ 10</span>
        </div>
      </div>

      {/* 4. Average Relevance */}
      <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Avg Relevance
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-2xl font-black text-emerald-400">
            {isLoadingMatchingCount
              ? '...'
              : Number.isFinite(avgRelevance)
                ? avgRelevance.toFixed(1)
                : '0.0'}
          </span>
          <span className="text-xs text-slate-400">/ 10</span>
        </div>
      </div>
    </div>
  );
};

const DashboardContent: React.FC = () => {
  const { matchingCount, hasActiveFilters, activeFilterCount } = useFilterContext();

  return (
    <div className="flex-1 space-y-6 w-full min-w-0">
      {/* Top Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Analytics Overview</h2>
            <p className="text-xs text-slate-400">
              {hasActiveFilters
                ? `Filtered by ${activeFilterCount} active criteria (${matchingCount.toLocaleString()} records matched)`
                : `Comprehensive analytics across all ${matchingCount.toLocaleString()} records`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>

      {/* KPI Summary Row */}
      <KPISummarySection />

      {/* Active Filter Chips Bar (Shown above charts when filters are applied) */}
      <ActiveFilterChips />

      {/* Advanced Visualization 1: World Choropleth Map (Full Width) */}
      <div className="w-full">
        <WorldChoroplethMap />
      </div>

      {/* Advanced Visualization 2: D3 Region x Year Heatmap (Full Width) */}
      <div className="w-full">
        <D3RegionYearHeatmap />
      </div>

      {/* Temporal Trend Chart (Full Width) */}
      <div className="w-full">
        <IntensityLikelihoodLineChart />
      </div>

      {/* Grid of Analytical Charts (2 columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RegionBarChart />
        <TopicBarChart />
        <PestlePieChart />
        <SectorRelevanceBarChart />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500/30 selection:text-sky-200">
          <Header />
          <main className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <FilterSidebar />
              <DashboardContent />
            </div>
          </main>
        </div>
      </FilterProvider>
    </QueryClientProvider>
  );
};

export default App;
