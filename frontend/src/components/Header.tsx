import { Activity, ShieldAlert, Wifi } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFilterContext } from '../context/index.js';

export const Header: React.FC = () => {
  const { matchingCount, hasActiveFilters, activeFilterCount } = useFilterContext();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' UTC',
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#26314A] bg-[#0B1220]/90 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Terminal Identifier */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8944A]/10 text-[#E8944A] border border-[#E8944A]/25">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-semibold tracking-tight text-[#ECE9E2]">
                Global Signals Intelligence
                <span className="sr-only">Analytics Dashboard</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-[#4FD1C5]/10 border border-[#4FD1C5]/20 px-2 py-0.5 text-[11px] font-medium text-[#4FD1C5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4FD1C5] animate-pulse" />
                Live Radar
                <span className="sr-only">Live Sync</span>
              </span>
            </div>
            <p className="text-xs text-[#8B93A7]">
              Energy, Geopolitical, and Sector Cross-Filter Terminal
            </p>
          </div>
        </div>

        {/* Live Metrics & UTC Clock */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 border-r border-[#26314A] pr-4 text-xs">
            <div className="text-right">
              <div className="text-[11px] text-[#8B93A7]">Active Signals</div>
              <div className="font-semibold text-[#ECE9E2] tabular-nums">
                {matchingCount.toLocaleString()} Records
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="hidden lg:flex items-center gap-1.5 rounded bg-[#E8944A]/10 border border-[#E8944A]/25 px-2.5 py-1 text-xs text-[#E8944A]">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>{activeFilterCount} Filter Dimensions Applied</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 rounded bg-[#131B2E] border border-[#26314A] px-3 py-1.5 text-xs text-[#8B93A7]">
            <Wifi className="h-3.5 w-3.5 text-[#4FD1C5]" />
            <span className="text-[#ECE9E2] tabular-nums font-medium">{timeStr}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
