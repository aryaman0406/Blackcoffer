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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-[#8B93A7]" />
          <label className="text-[11px] font-medium text-[#8B93A7]">Published year</label>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] text-[#E8944A] hover:text-[#ECE9E2] transition-colors"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Reset
          </button>
        )}
      </div>

      <div className="p-2.5 rounded-lg border border-[#26314A] bg-[#0B1220] space-y-2.5">
        {/* Selected Range Display */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#E8944A] bg-[#E8944A]/15 px-1.5 py-0.2 rounded border border-[#E8944A]/30 tabular-nums">
            {currentMin}
          </span>
          <span className="text-[10px] text-[#8B93A7]">
            {isFiltered ? `${currentMin} – ${currentMax}` : 'All Timeline'}
          </span>
          <span className="font-semibold text-[#E8944A] bg-[#E8944A]/15 px-1.5 py-0.2 rounded border border-[#E8944A]/30 tabular-nums">
            {currentMax}
          </span>
        </div>

        {/* Dual Sliders */}
        <div className="space-y-2">
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-[#8B93A7] tabular-nums">
              <span>Start: {currentMin}</span>
              <span>Min: {availableMin}</span>
            </div>
            <input
              type="range"
              min={availableMin}
              max={availableMax}
              value={currentMin}
              onChange={handleMinChange}
              className="w-full h-1 bg-[#26314A] rounded-lg appearance-none cursor-pointer accent-[#E8944A]"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] text-[#8B93A7] tabular-nums">
              <span>End: {currentMax}</span>
              <span>Max: {availableMax}</span>
            </div>
            <input
              type="range"
              min={availableMin}
              max={availableMax}
              value={currentMax}
              onChange={handleMaxChange}
              className="w-full h-1 bg-[#26314A] rounded-lg appearance-none cursor-pointer accent-[#E8944A]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
