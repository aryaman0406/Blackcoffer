import { AlertCircle, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import React, { useState } from 'react';
import { useFilterContext } from '../context/index.js';
import { useFilters } from '../hooks/index.js';
import { MultiSelectDropdown } from './MultiSelectDropdown.js';
import { SearchableSelect } from './SearchableSelect.js';
import { YearRangeSlider } from './YearRangeSlider.js';

export const FilterSidebar: React.FC = () => {
  const {
    filters,
    matchingCount,
    isLoadingMatchingCount,
    activeFilterCount,
    hasActiveFilters,
    setFilter,
    toggleTopic,
    removeTopic,
    setYearRange,
    clearFilters,
  } = useFilterContext();

  const { data: filtersData, isLoading: isLoadingFilters, error: filtersError } = useFilters();

  const [isNoteDismissed, setIsNoteDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('blackcoffer_swot_city_note_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissNote = () => {
    setIsNoteDismissed(true);
    try {
      sessionStorage.setItem('blackcoffer_swot_city_note_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const options = filtersData?.data ?? {
    topic: [],
    sector: [],
    region: [],
    pestle: [],
    source: [],
    country: [],
  };

  return (
    <aside className="w-full lg:w-[280px] shrink-0 bg-[#131B2E]/85 border border-[#26314A] rounded-xl p-4 backdrop-blur-md flex flex-col gap-4 shadow-panel">
      {/* Sidebar Top Instrument Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#26314A]">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#E8944A]/10 text-[#E8944A] border border-[#E8944A]/25">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-semibold tracking-wide text-[#ECE9E2]">
                Filters
              </h2>
              {hasActiveFilters && (
                <span className="inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-semibold bg-[#E8944A] text-[#0B1220] tabular-nums">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Clear All Filters Button */}
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-[#8B93A7] hover:text-[#ECE9E2] bg-[#0B1220] hover:bg-[#18233C] disabled:opacity-30 disabled:pointer-events-none border border-[#26314A] transition-colors focus-visible:ring-1 focus-visible:ring-[#E8944A]"
        >
          <RotateCcw className="h-3 w-3 text-[#E8944A]" />
          <span>Clear all</span>
        </button>
      </div>

      {/* Matching Records Metric Box */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#0E1524] border border-[#26314A]/80 shadow-inner">
        <div>
          <div className="text-[11px] text-[#8B93A7]">Matching Records</div>
          <div className="text-base font-bold text-[#ECE9E2] tabular-nums">
            {isLoadingMatchingCount ? (
              <span className="inline-block w-14 h-4 bg-[#26314A] animate-pulse rounded" />
            ) : (
              matchingCount.toLocaleString()
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-[#4FD1C5] bg-[#4FD1C5]/10 border border-[#4FD1C5]/20">
            Active
          </span>
        </div>
      </div>

      {/* Dismissible Dataset Scope Notice */}
      {!isNoteDismissed && (
        <div className="relative flex items-start gap-2 p-2.5 rounded-lg bg-[#18233C]/80 border border-[#26314A] text-xs text-[#8B93A7]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-[#E8944A] mt-0.5" />
          <div className="pr-3 text-[11px] leading-relaxed">
            This dataset does not include city-level or SWOT data.
          </div>
          <button
            type="button"
            onClick={handleDismissNote}
            className="absolute top-2 right-2 text-[#8B93A7] hover:text-[#ECE9E2]"
            aria-label="Dismiss note"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Filters Fetch Error Alert */}
      {filtersError && (
        <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span>Failed to load filter options.</span>
        </div>
      )}

      {/* Filter Controls Stack */}
      <div className="flex flex-col gap-3.5 overflow-y-auto pr-0.5">
        {/* 1. Topic: Multi-Select */}
        <MultiSelectDropdown
          label="Topic"
          selectedValues={filters.topic}
          options={options.topic}
          onToggle={toggleTopic}
          onRemove={removeTopic}
          onClear={() => setFilter('topic', [])}
          isLoading={isLoadingFilters}
        />

        {/* 2. Sector: Single-Select */}
        <SearchableSelect
          label="Sector"
          value={filters.sector}
          options={options.sector}
          placeholder="All Sectors"
          onChange={(val) => setFilter('sector', val)}
          isLoading={isLoadingFilters}
        />

        {/* 3. Region: Single-Select */}
        <SearchableSelect
          label="Region"
          value={filters.region}
          options={options.region}
          placeholder="All Regions"
          onChange={(val) => setFilter('region', val)}
          isLoading={isLoadingFilters}
        />

        {/* 4. PESTLE: Single-Select */}
        <SearchableSelect
          label="PESTLE"
          value={filters.pestle}
          options={options.pestle}
          placeholder="All Geopolitical Pillars"
          onChange={(val) => setFilter('pestle', val)}
          isLoading={isLoadingFilters}
        />

        {/* 5. Source: Single-Select */}
        <SearchableSelect
          label="Source"
          value={filters.source}
          options={options.source}
          placeholder="All Sources (400+)"
          onChange={(val) => setFilter('source', val)}
          isLoading={isLoadingFilters}
        />

        {/* 6. Country: Single-Select */}
        <SearchableSelect
          label="Country"
          value={filters.country}
          options={options.country}
          placeholder="All Countries"
          onChange={(val) => setFilter('country', val)}
          isLoading={isLoadingFilters}
        />

        {/* 7. Published Year Range Slider */}
        <YearRangeSlider
          minYear={filters.minYear}
          maxYear={filters.maxYear}
          onChange={setYearRange}
        />
      </div>
    </aside>
  );
};
