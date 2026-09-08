import { Calendar, RotateCcw } from 'lucide-react';
import React, { useMemo } from 'react';
import { useAggregates } from '../hooks/index.js';

interface YearRangeSliderProps {
  minYear?: number;
  maxYear?: number;
  onChange: (minYear?: number, maxYear?: number) => void;
}

export const YearRangeSlider: React.FC<YearRangeSliderProps> = ({ minYear, maxYear, onChange }) => {
  // Fetch aggregates to derive actual available published year bounds
  const { data: aggregateData } = useAggregates();

  const { availableMin, availableMax } = useMemo(() => {
    const years = aggregateData?.data?.byYear?.map((y) => y.year).filter(Boolean) ?? [];
    if (years.length === 0) {
      return { availableMin: 2012, availableMax: 2026 };
    }
    return {
      availableMin: Math.min(...years),
      availableMax: Math.max(...years),
    };
  }, [aggregateData]);

  const currentMin = minYear ?? availableMin;
  const currentMax = maxYear ?? availableMax;
  const isFiltered = minYear !== undefined || maxYear !== undefined;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const newMin = Math.min(val, currentMax);
    onChange(newMin === availableMin && currentMax === availableMax ? undefined : newMin, maxYear);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const newMax = Math.max(val, currentMin);
    onChange(minYear, newMax === availableMax && currentMin === availableMin ? undefined : newMax);
  };

  const handleReset = () => {
    onChange(undefined, undefined);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Published year
          </label>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset
          </button>
        )}
      </div>

      <div className="p-3 rounded-lg border border-slate-700/80 bg-slate-900/80 space-y-3">
        {/* Selected Range Display */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            {currentMin}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {isFiltered ? `${currentMin} – ${currentMax}` : 'All published years'}
          </span>
          <span className="font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            {currentMax}
          </span>
        </div>

        {/* Dual Sliders */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>From: {currentMin}</span>
              <span>Min: {availableMin}</span>
            </div>
            <input
              type="range"
              min={availableMin}
              max={availableMax}
              value={currentMin}
              onChange={handleMinChange}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>To: {currentMax}</span>
              <span>Max: {availableMax}</span>
            </div>
            <input
              type="range"
              min={availableMin}
              max={availableMax}
              value={currentMax}
              onChange={handleMaxChange}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
