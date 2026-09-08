import { Globe, MousePointerClick } from 'lucide-react';
import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFilterContext } from '../context/index.js';
import { useAggregates } from '../hooks/index.js';
import { ChartContainer } from './ChartContainer.js';
import { CustomTooltip } from './CustomTooltip.js';

export const RegionBarChart: React.FC = () => {
  const { filters, filterParams, setFilter } = useFilterContext();

  // Exclude region dimension from own aggregate query to avoid collapsing to 1 bar
  const chartFilterParams = useMemo(() => ({ ...filterParams, region: undefined }), [filterParams]);

  const { data: aggregateResult, isLoading, error } = useAggregates(chartFilterParams);

  const selectedRegion = filters.region;

  // Make sure Unspecified region is explicitly preserved and formatted
  const chartData = useMemo(() => {
    const rawData = aggregateResult?.data?.byRegion ?? [];
    return rawData.map((item) => ({
      region: item.region || 'Unspecified',
      count: item.count,
      avgIntensity: item.avgIntensity,
      isUnspecified: item.region === 'Unspecified' || !item.region,
      isSelected: selectedRegion !== undefined && (item.region || 'Unspecified') === selectedRegion,
    }));
  }, [aggregateResult, selectedRegion]);

  const isEmpty = chartData.length === 0;

  // Auto-generate key data point caption
  const caption = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const total = chartData.reduce((acc, curr) => acc + curr.count, 0);
    const unspecified = chartData.find((r) => r.isUnspecified)?.count ?? 0;
    const unspecifiedPct = total > 0 ? ((unspecified / total) * 100).toFixed(1) : '0';

    const topSpecified = [...chartData]
      .filter((r) => !r.isUnspecified)
      .sort((a, b) => b.count - a.count)[0];

    if (!topSpecified) {
      return `Unspecified regions represent ${unspecifiedPct}% of all records (${unspecified} entries). Click bar to cross-filter.`;
    }

    return `${topSpecified.region} leads with ${topSpecified.count} records; Unspecified regions account for ${unspecifiedPct}% (${unspecified} records). Click bar to cross-filter.`;
  }, [chartData]);

  const handleRegionClick = (regionName: string) => {
    if (selectedRegion === regionName) {
      setFilter('region', undefined);
    } else {
      setFilter('region', regionName);
    }
  };

  return (
    <ChartContainer
      title="Regional Record Distribution"
      caption={caption}
      icon={Globe}
      isLoading={isLoading}
      isEmpty={isEmpty}
      error={error ? error.message : aggregateResult?.error}
      skeletonType="bar"
    >
      <div className="w-full h-full flex flex-col justify-between">
        {selectedRegion && (
          <div className="flex items-center gap-1.5 text-xs text-sky-400 mb-1 px-1">
            <MousePointerClick className="w-3.5 h-3.5 animate-pulse" />
            <span>
              Filtering by <strong>{selectedRegion}</strong> (Click active bar or chip to reset)
            </span>
          </div>
        )}

        <div className="w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                horizontal={false}
                opacity={0.5}
              />
              <XAxis
                type="number"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
              />
              <YAxis
                type="category"
                dataKey="region"
                stroke="#cbd5e1"
                fontSize={11}
                width={110}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                tick={{ fill: '#cbd5e1' }}
              />
              <Tooltip content={<CustomTooltip titlePrefix="Region" />} />
              <Bar dataKey="count" name="Record Count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => {
                  const isFiltered = selectedRegion !== undefined;
                  const isThisSelected = entry.isSelected;
                  let fill = entry.isUnspecified ? '#f59e0b' : '#0ea5e9';
                  let fillOpacity = entry.isUnspecified ? 0.85 : 0.9;

                  if (isFiltered) {
                    if (isThisSelected) {
                      fill = entry.isUnspecified ? '#fbbf24' : '#38bdf8';
                      fillOpacity = 1;
                    } else {
                      fillOpacity = 0.35;
                    }
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke={isThisSelected ? '#38bdf8' : 'none'}
                      strokeWidth={isThisSelected ? 2 : 0}
                      onClick={() => handleRegionClick(entry.region)}
                      className="cursor-pointer transition-all duration-150 hover:brightness-125"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartContainer>
  );
};
