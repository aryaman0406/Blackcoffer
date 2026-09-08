import { AlertCircle, FilterX, LucideIcon, Sparkles } from 'lucide-react';
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
        'rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-5 shadow-xl flex flex-col justify-between transition-all duration-200 hover:border-slate-700/80',
        className,
      )}
    >
      {/* Header */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
          </div>
        </div>

        {/* Auto-generated dynamic caption */}
        {caption && !isLoading && !isEmpty && !error && (
          <p className="text-xs text-sky-300/90 font-medium flex items-center gap-1.5 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 leading-snug">
            <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
            <span>{caption}</span>
          </p>
        )}
      </div>

      {/* Chart Body */}
      <div className="w-full h-72 relative flex items-center justify-center">
        {isLoading ? (
          /* Loading Skeleton */
          <div
            data-testid="chart-skeleton"
            className="w-full h-full flex flex-col justify-end gap-3 p-4 animate-pulse bg-slate-950/40 rounded-xl border border-slate-800/40"
          >
            {skeletonType === 'pie' ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-8 border-slate-800 border-t-sky-500/30 animate-spin" />
              </div>
            ) : skeletonType === 'line' ? (
              <div className="w-full h-full flex flex-col justify-between py-4">
                <div className="w-full h-0.5 bg-slate-800" />
                <div className="w-full h-0.5 bg-slate-800" />
                <div className="w-full h-0.5 bg-slate-800" />
                <div className="flex justify-between items-end gap-2 h-32">
                  <div className="w-1/6 bg-sky-500/20 h-12 rounded-t" />
                  <div className="w-1/6 bg-sky-500/25 h-24 rounded-t" />
                  <div className="w-1/6 bg-sky-500/30 h-16 rounded-t" />
                  <div className="w-1/6 bg-sky-500/35 h-28 rounded-t" />
                  <div className="w-1/6 bg-sky-500/25 h-20 rounded-t" />
                  <div className="w-1/6 bg-sky-500/20 h-14 rounded-t" />
                </div>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-3 h-48 w-full pt-4">
                <div className="w-1/8 bg-slate-800 h-2/5 rounded-t" />
                <div className="w-1/8 bg-slate-800 h-4/5 rounded-t" />
                <div className="w-1/8 bg-slate-800 h-3/5 rounded-t" />
                <div className="w-1/8 bg-slate-800 h-5/6 rounded-t" />
                <div className="w-1/8 bg-slate-800 h-1/2 rounded-t" />
                <div className="w-1/8 bg-slate-800 h-2/3 rounded-t" />
                <div className="w-1/8 bg-slate-800 h-3/4 rounded-t" />
              </div>
            )}
          </div>
        ) : error ? (
          /* Error State */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center rounded-xl bg-red-500/5 border border-red-500/20">
            <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-xs font-semibold text-red-300">Unable to load chart metrics</p>
            <p className="text-[11px] text-red-400/80 mt-1 max-w-xs">{error}</p>
          </div>
        ) : isEmpty ? (
          /* Empty State */
          <div
            data-testid="chart-empty-state"
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center rounded-xl bg-slate-950/40 border border-slate-800/60"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-2">
              <FilterX className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No data matches these filters</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Try adjusting your active filters or clear search criteria to view analytics.
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
