import { AlertCircle, BarChart2, Filter, Layers, RotateCcw, X } from 'lucide-react';
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
    <aside className="w-full lg:w-80 shrink-0 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl flex flex-col gap-5 shadow-xl">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
              Filters
              {hasActiveFilters && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-white leading-none">
                  {activeFilterCount}
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">Refine dashboard analytics</p>
          </div>
        </div>

        {/* Clear All Filters Button */}
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all duration-150 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-40 disabled:pointer-events-none border border-slate-700/60"
        >
          <RotateCcw className="w-3 h-3 text-sky-400" />
          <span>Clear all</span>
        </button>
      </div>

      {/* Matching Records Counter Badge */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-sky-500/10 to-blue-600/10 border border-sky-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-sky-500/20 text-sky-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
              Matching Records
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white tracking-tight">
                {isLoadingMatchingCount ? (
                  <span className="inline-block w-12 h-4 bg-slate-700 animate-pulse rounded" />
                ) : (
                  matchingCount.toLocaleString()
                )}
              </span>
              <span className="text-[11px] text-slate-400">records</span>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Dismissible Dataset Note */}
      {!isNoteDismissed && (
        <div className="relative flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="pr-4">
            <p className="font-medium text-amber-200">Dataset scope notice</p>
            <p className="text-[11px] text-amber-300/90 mt-0.5 leading-relaxed">
              This dataset does not include city-level or SWOT data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismissNote}
            className="absolute top-2.5 right-2.5 p-1 rounded-md text-amber-400/70 hover:text-amber-200 hover:bg-amber-500/20 transition-colors"
            aria-label="Dismiss note"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters Fetch Error Alert */}
      {filtersError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Failed to load filter options. Retrying...</span>
        </div>
      )}

      {/* Filter Controls List */}
      <div className="flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
        {/* 1. Topic: Searchable Multi-Select (97 values) */}
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
          placeholder="All PESTLE"
          onChange={(val) => setFilter('pestle', val)}
          isLoading={isLoadingFilters}
        />

        {/* 5. Source: Searchable Single-Select (403 values) */}
        <SearchableSelect
          label="Source"
          value={filters.source}
          options={options.source}
          placeholder="All Sources (400+)"
          onChange={(val) => setFilter('source', val)}
          isLoading={isLoadingFilters}
        />

        {/* 6. Country: Searchable Single-Select */}
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

      {/* Active Filters Summary Footer */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-sky-400" />
            {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''} applied
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </aside>
  );
};
