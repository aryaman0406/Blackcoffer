import { AlertCircle, FilterX, LucideIcon } from 'lucide-react';
import React from 'react';
import { cn } from '../utils/index.js';

interface ChartContainerProps {
  title: string;
  caption?: string;
  icon?: LucideIcon;
  isLoading: boolean;
  isEmpty: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  skeletonType?: 'bar' | 'line' | 'pie';
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  caption,
  icon: Icon,
  isLoading,
  isEmpty,
  error,
  children,
  className,
  skeletonType = 'bar',
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#26314A] bg-[#131B2E]/90 backdrop-blur-md p-4 shadow-panel flex flex-col justify-between transition-colors',
        className,
      )}
    >
      {/* Header */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#18233C] text-[#E8944A] border border-[#26314A]">
                <Icon className="h-3.5 w-3.5" />
              </div>
            )}
            <h3 className="text-xs font-semibold tracking-wide text-[#ECE9E2]">{title}</h3>
          </div>
        </div>

        {/* Auto-generated dynamic caption */}
        {caption && !isLoading && !isEmpty && !error && (
          <p className="text-[11px] text-[#8B93A7] leading-relaxed">
            {caption}
          </p>
        )}
      </div>

      {/* Chart Body */}
      <div className="w-full h-64 relative flex items-center justify-center">
        {isLoading ? (
          /* Loading Skeleton */
          <div
            data-testid="chart-skeleton"
            className="w-full h-full flex flex-col justify-end gap-2 p-3 animate-pulse bg-[#0B1220]/60 rounded-lg border border-[#26314A]/60"
          >
            {skeletonType === 'pie' ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-[#26314A] border-t-[#4FD1C5]/50 animate-spin" />
              </div>
            ) : skeletonType === 'line' ? (
              <div className="w-full h-full flex flex-col justify-between py-2">
                <div className="w-full h-px bg-[#26314A]" />
                <div className="w-full h-px bg-[#26314A]" />
                <div className="flex justify-between items-end gap-2 h-24">
                  <div className="w-1/6 bg-[#4FD1C5]/15 h-8 rounded-t" />
                  <div className="w-1/6 bg-[#4FD1C5]/20 h-16 rounded-t" />
                  <div className="w-1/6 bg-[#4FD1C5]/25 h-12 rounded-t" />
                  <div className="w-1/6 bg-[#4FD1C5]/30 h-20 rounded-t" />
                  <div className="w-1/6 bg-[#4FD1C5]/20 h-14 rounded-t" />
                </div>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-36 w-full pt-2">
                <div className="w-1/8 bg-[#26314A] h-2/5 rounded-t" />
                <div className="w-1/8 bg-[#26314A] h-4/5 rounded-t" />
                <div className="w-1/8 bg-[#26314A] h-3/5 rounded-t" />
                <div className="w-1/8 bg-[#26314A] h-5/6 rounded-t" />
                <div className="w-1/8 bg-[#26314A] h-1/2 rounded-t" />
                <div className="w-1/8 bg-[#26314A] h-2/3 rounded-t" />
              </div>
            )}
          </div>
        ) : error ? (
          /* Error State */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center rounded-lg bg-red-500/5 border border-red-500/20">
            <AlertCircle className="h-6 w-6 text-red-400 mb-1.5" />
            <p className="text-xs font-semibold text-red-300">Signal stream unavailable</p>
            <p className="text-[11px] text-red-400/80 mt-0.5 max-w-xs">{error}</p>
          </div>
        ) : isEmpty ? (
          /* Empty State */
          <div
            data-testid="chart-empty-state"
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center rounded-lg bg-[#0B1220]/60 border border-[#26314A]/80"
          >
            <div className="w-8 h-8 rounded-full bg-[#18233C] flex items-center justify-center text-[#8B93A7] mb-1.5 border border-[#26314A]">
              <FilterX className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-[#ECE9E2]">No data matches these filters</p>
            <p className="text-[11px] text-[#8B93A7] mt-0.5 max-w-xs">
              No signals match these filters — clear one to see more.
            </p>
          </div>
        ) : (
          /* Chart Content */
          <div className="w-full h-full">{children}</div>
        )}
      </div>
    </div>
  );
};
