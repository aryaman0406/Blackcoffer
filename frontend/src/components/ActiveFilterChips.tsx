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
      colorClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25',
    });
  });

  // 2. Sector
  if (filters.sector) {
    chips.push({
      id: 'sector',
      category: 'Sector',
      label: filters.sector,
      onRemove: () => resetFilter('sector'),
      colorClass:
        'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
    });
  }

  // 3. Region
  if (filters.region) {
    chips.push({
      id: 'region',
      category: 'Region',
      label: filters.region,
      onRemove: () => resetFilter('region'),
      colorClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25',
    });
  }

  // 4. PESTLE
  if (filters.pestle) {
    chips.push({
      id: 'pestle',
      category: 'PESTLE',
      label: filters.pestle,
      onRemove: () => resetFilter('pestle'),
      colorClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25',
    });
  }

  // 5. Source
  if (filters.source) {
    chips.push({
      id: 'source',
      category: 'Source',
      label: filters.source,
      onRemove: () => resetFilter('source'),
      colorClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25',
    });
  }

  // 6. Country
  if (filters.country) {
    chips.push({
      id: 'country',
      category: 'Country',
      label: filters.country,
      onRemove: () => resetFilter('country'),
      colorClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25',
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
      colorClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
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
      colorClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
    });
  }

  // 9. Likelihood
  if (filters.minLikelihood !== undefined) {
    chips.push({
      id: 'likelihood',
      category: 'Likelihood',
      label: `≥ ${filters.minLikelihood}`,
      onRemove: () => resetFilter('minLikelihood'),
      colorClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30 hover:bg-pink-500/25',
    });
  }

  // 10. Relevance
  if (filters.minRelevance !== undefined) {
    chips.push({
      id: 'relevance',
      category: 'Relevance',
      label: `≥ ${filters.minRelevance}`,
      onRemove: () => resetFilter('minRelevance'),
      colorClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25',
    });
  }

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-lg transition-all">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mr-1">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <span>Active Filters ({activeFilterCount}):</span>
        </div>

        {chips.map((chip) => (
          <span
            key={chip.id}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors shadow-sm ${chip.colorClass}`}
          >
            <span className="opacity-75 font-normal">{chip.category}:</span>
            <span className="font-semibold">{chip.label}</span>
            <button
              type="button"
              onClick={chip.onRemove}
              className="p-0.5 rounded hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-white/40"
              title={`Remove ${chip.category} filter`}
              aria-label={`Remove ${chip.category} filter: ${chip.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors shrink-0"
        title="Clear all active filters"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear all</span>
      </button>
    </div>
  );
};
