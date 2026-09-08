import { Filter, RotateCcw, X } from 'lucide-react';
import React from 'react';
import { useFilterContext } from '../context/index.js';

interface ChipData {
  id: string;
  label: string;
  category: string;
  onRemove: () => void;
  colorClass: string;
}

export const ActiveFilterChips: React.FC = () => {
  const {
    filters,
    activeFilterCount,
    hasActiveFilters,
    removeTopic,
    resetFilter,
    setYearRange,
    clearFilters,
  } = useFilterContext();

  if (!hasActiveFilters) {
    return null;
  }

  const chips: ChipData[] = [];

  // 1. Topics
  filters.topic.forEach((t) => {
    chips.push({
      id: `topic-${t}`,
      category: 'Topic',
      label: t,
      onRemove: () => removeTopic(t),
      colorClass: 'bg-[#E8944A]/15 text-[#ECE9E2] border-[#E8944A]/35',
    });
  });

  // 2. Sector
  if (filters.sector) {
    chips.push({
      id: 'sector',
      category: 'Sector',
      label: filters.sector,
      onRemove: () => resetFilter('sector'),
      colorClass: 'bg-[#4FD1C5]/15 text-[#ECE9E2] border-[#4FD1C5]/35',
    });
  }

  // 3. Region
  if (filters.region) {
    chips.push({
      id: 'region',
      category: 'Region',
      label: filters.region,
      onRemove: () => resetFilter('region'),
      colorClass: 'bg-[#4FD1C5]/15 text-[#ECE9E2] border-[#4FD1C5]/35',
    });
  }

  // 4. PESTLE
  if (filters.pestle) {
    chips.push({
      id: 'pestle',
      category: 'PESTLE',
      label: filters.pestle,
      onRemove: () => resetFilter('pestle'),
      colorClass: 'bg-[#1E293B] text-[#ECE9E2] border-[#26314A]',
    });
  }

  // 5. Source
  if (filters.source) {
    chips.push({
      id: 'source',
      category: 'Source',
      label: filters.source,
      onRemove: () => resetFilter('source'),
      colorClass: 'bg-[#1E293B] text-[#ECE9E2] border-[#26314A]',
    });
  }

  // 6. Country
  if (filters.country) {
    chips.push({
      id: 'country',
      category: 'Country',
      label: filters.country,
      onRemove: () => resetFilter('country'),
      colorClass: 'bg-[#E8944A]/20 text-[#ECE9E2] border-[#E8944A]/40 font-semibold',
    });
  }

  // 7. Published Year Range
  if (filters.minYear !== undefined || filters.maxYear !== undefined) {
    let yearLabel = '';
    if (filters.minYear !== undefined && filters.maxYear !== undefined) {
      yearLabel =
        filters.minYear === filters.maxYear
          ? `${filters.minYear}`
          : `${filters.minYear} - ${filters.maxYear}`;
    } else if (filters.minYear !== undefined) {
      yearLabel = `≥ ${filters.minYear}`;
    } else if (filters.maxYear !== undefined) {
      yearLabel = `≤ ${filters.maxYear}`;
    }

    chips.push({
      id: 'published-year',
      category: 'Published Year',
      label: yearLabel,
      onRemove: () => setYearRange(undefined, undefined),
      colorClass: 'bg-[#E8944A]/15 text-[#ECE9E2] border-[#E8944A]/35',
    });
  }

  // 8. Intensity
  if (filters.minIntensity !== undefined || filters.maxIntensity !== undefined) {
    let intensityLabel = '';
    if (filters.minIntensity !== undefined && filters.maxIntensity !== undefined) {
      intensityLabel = `${filters.minIntensity} - ${filters.maxIntensity}`;
    } else if (filters.minIntensity !== undefined) {
      intensityLabel = `≥ ${filters.minIntensity}`;
    } else if (filters.maxIntensity !== undefined) {
      intensityLabel = `≤ ${filters.maxIntensity}`;
    }

    chips.push({
      id: 'intensity',
      category: 'Intensity',
      label: intensityLabel,
      onRemove: () => {
        resetFilter('minIntensity');
        resetFilter('maxIntensity');
      },
      colorClass: 'bg-[#E8944A]/15 text-[#ECE9E2] border-[#E8944A]/35',
    });
  }

  // 9. Likelihood
  if (filters.minLikelihood !== undefined) {
    chips.push({
      id: 'likelihood',
      category: 'Likelihood',
      label: `≥ ${filters.minLikelihood}`,
      onRemove: () => resetFilter('minLikelihood'),
      colorClass: 'bg-[#4FD1C5]/15 text-[#ECE9E2] border-[#4FD1C5]/35',
    });
  }

  // 10. Relevance
  if (filters.minRelevance !== undefined) {
    chips.push({
      id: 'relevance',
      category: 'Relevance',
      label: `≥ ${filters.minRelevance}`,
      onRemove: () => resetFilter('minRelevance'),
      colorClass: 'bg-[#4FD1C5]/15 text-[#ECE9E2] border-[#4FD1C5]/35',
    });
  }

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl border border-[#26314A] bg-[#131B2E]/90 backdrop-blur-md shadow-panel transition-all">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#8B93A7] mr-1">
          <Filter className="h-3.5 w-3.5 text-[#E8944A]" />
          <span>Active Filters ({activeFilterCount}):</span>
        </div>

        {chips.map((chip) => (
          <span
            key={chip.id}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border transition-colors shadow-sm ${chip.colorClass}`}
          >
            <span className="text-[#8B93A7] font-normal">{chip.category}:</span>
            <span className="tabular-nums">{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="p-0.5 rounded hover:bg-white/10 hover:text-white transition-colors focus-visible:ring-1 focus-visible:ring-[#E8944A]"
              title={`Remove ${chip.category} filter`}
              aria-label={`Remove ${chip.category} filter: ${chip.label}`}
            >
              <X className="h-3 w-3 text-[#8B93A7] hover:text-[#ECE9E2]" />
            </button>
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="flex items-center gap-1 text-xs text-[#8B93A7] hover:text-[#ECE9E2] px-2.5 py-1 rounded-lg bg-[#0B1220] hover:bg-[#18233C] border border-[#26314A] transition-colors shrink-0 focus-visible:ring-1 focus-visible:ring-[#E8944A]"
        title="Clear all active filters"
      >
        <RotateCcw className="h-3 w-3 text-[#E8944A]" />
        <span>Clear all</span>
      </button>
    </div>
  );
};
