import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Activity, Database, Flame, Gauge } from 'lucide-react';
import React, { useState } from 'react';
import {
  D3RegionYearHeatmap,
  GlobeHero,
  IntensityLikelihoodLineChart,
  PestlePieChart,
  RegionBarChart,
  SectorBarGrid3D,
  TopicBarChart,
} from './charts/index.js';
import { ActiveFilterChips, FilterSidebar, Header, ParallaxCard } from './components/index.js';
import { FilterProvider, useFilterContext } from './context/index.js';
import { useAggregates } from './hooks/index.js';

const TerminalMetricBar: React.FC = () => {
  const { filterParams, matchingCount, isLoadingMatchingCount } = useFilterContext();
  const { data: aggregateResult } = useAggregates(filterParams);
  const summary = aggregateResult?.data?.summary;

  const avgIntensity = summary?.avgIntensity ?? 0;
  const avgLikelihood = summary?.avgLikelihood ?? 0;
  const avgRelevance = summary?.avgRelevance ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      <h2 className="sr-only">Analytics Overview</h2>
      {/* 1. Signals Monitored / Total Insights */}
      <div className="p-3.5 rounded-xl border border-[#26314A] bg-[#131B2E]/90 backdrop-blur-md shadow-panel">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8B93A7]">Total Insights</span>
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#18233C] text-[#8B93A7]">
            <Database className="h-3 w-3" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold text-[#ECE9E2] tabular-nums">
            {isLoadingMatchingCount ? '...' : matchingCount.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#8B93A7]">records</span>
        </div>
      </div>

      {/* 2. Mean Signal Intensity (Amber Highlight) */}
      <div className="p-3.5 rounded-xl border border-[#26314A] bg-[#131B2E]/90 backdrop-blur-md shadow-panel">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8B93A7]">Avg Intensity</span>
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#E8944A]/10 text-[#E8944A]">
            <Flame className="h-3 w-3" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold text-[#E8944A] tabular-nums">
            {isLoadingMatchingCount
              ? '...'
              : Number.isFinite(avgIntensity)
                ? avgIntensity.toFixed(1)
                : '0.0'}
          </span>
          <span className="text-[11px] text-[#8B93A7]">/ 100</span>
        </div>
      </div>

      {/* 3. Avg Relevance Score (Teal Highlight) */}
      <div className="p-3.5 rounded-xl border border-[#26314A] bg-[#131B2E]/90 backdrop-blur-md shadow-panel">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8B93A7]">Avg Relevance</span>
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#4FD1C5]/10 text-[#4FD1C5]">
            <Gauge className="h-3 w-3" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold text-[#4FD1C5] tabular-nums">
            {isLoadingMatchingCount
              ? '...'
              : Number.isFinite(avgRelevance)
                ? avgRelevance.toFixed(1)
                : '0.0'}
          </span>
          <span className="text-[11px] text-[#8B93A7]">/ 10</span>
        </div>
      </div>

      {/* 4. Mean Likelihood Indicator */}
      <div className="p-3.5 rounded-xl border border-[#26314A] bg-[#131B2E]/90 backdrop-blur-md shadow-panel">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#8B93A7]">Avg Likelihood</span>
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#18233C] text-[#8B93A7]">
            <Activity className="h-3 w-3" />
          </div>
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-xl font-bold text-[#ECE9E2] tabular-nums">
            {isLoadingMatchingCount
              ? '...'
              : Number.isFinite(avgLikelihood)
                ? avgLikelihood.toFixed(1)
                : '0.0'}
          </span>
          <span className="text-[11px] text-[#8B93A7]">/ 10</span>
        </div>
      </div>
    </div>
  );
};

const DashboardContent: React.FC = () => {
  return (
    <div className="flex-1 space-y-4 w-full min-w-0">
      {/* 4-Stat Indicator Bar */}
      <TerminalMetricBar />

      {/* Active Filters Chip Row */}
      <ActiveFilterChips />

      {/* HERO / 3D GLOBE CENTERPIECE */}
      <div className="w-full">
        <GlobeHero />
      </div>

      {/* ASYMMETRIC GRID SECTION */}
      {/* Row 1: Wide Timeline Trend Chart (60%) + 3D Extruded Sector Bar Grid (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 flex">
          <ParallaxCard className="w-full h-full">
            <IntensityLikelihoodLineChart />
          </ParallaxCard>
        </div>

        <div className="lg:col-span-5 flex min-h-[340px]">
          <div className="w-full h-full">
            <SectorBarGrid3D />
          </div>
        </div>
      </div>

      {/* Row 2: Half-Width Panels: PESTLE Geopolitical Pie (50%) + Top Topics Bar (50%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        <ParallaxCard className="w-full h-full">
          <PestlePieChart />
        </ParallaxCard>

        <ParallaxCard className="w-full h-full">
          <TopicBarChart />
        </ParallaxCard>
      </div>

      {/* Row 3: Asymmetric Regional Matrix & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 flex">
          <ParallaxCard className="w-full h-full">
            <D3RegionYearHeatmap />
          </ParallaxCard>
        </div>

        <div className="lg:col-span-5 flex">
          <ParallaxCard className="w-full h-full">
            <RegionBarChart />
          </ParallaxCard>
        </div>
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
        <div className="min-h-screen bg-[#0B1220] text-[#ECE9E2] flex flex-col antialiased selection:bg-[#E8944A]/30 selection:text-[#ECE9E2]">
          <Header />
          <main className="max-w-[1780px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-4 flex-1">
            <div className="flex flex-col lg:flex-row gap-4 items-start">
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
