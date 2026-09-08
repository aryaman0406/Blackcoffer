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

    return `${topSpecified.region} leads with ${topSpecified.count} records; Unspecified regions account for ${unspecifiedPct}%. Click bar to filter.`;
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
          <div className="flex items-center gap-1.5 text-xs text-[#E8944A] mb-1 px-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>
              Filtering: <strong>{selectedRegion}</strong>
            </span>
          </div>
        )}

        <div className="w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                stroke="#26314A"
                horizontal={false}
                opacity={0.6}
              />
              <XAxis
                type="number"
                stroke="#8B93A7"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#26314A' }}
              />
              <YAxis
                type="category"
                dataKey="region"
                stroke="#8B93A7"
                fontSize={11}
                width={100}
                tickLine={false}
                axisLine={{ stroke: '#26314A' }}
                tick={{ fill: '#ECE9E2' }}
              />
              <Tooltip content={<CustomTooltip titlePrefix="Region" />} />
              <Bar dataKey="count" name="Signals" radius={[0, 3, 3, 0]}>
                {chartData.map((entry, index) => {
                  const isFiltered = selectedRegion !== undefined;
                  const isThisSelected = entry.isSelected;
                  let fill = entry.isUnspecified ? '#334155' : '#4FD1C5';
                  let fillOpacity = entry.isUnspecified ? 0.7 : 0.85;

                  if (isFiltered) {
                    if (isThisSelected) {
                      fill = entry.isUnspecified ? '#4FD1C5' : '#4FD1C5';
                      fillOpacity = 1;
                    } else {
                      fillOpacity = 0.25;
                    }
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke={isThisSelected ? '#ECE9E2' : 'none'}
                      strokeWidth={isThisSelected ? 1.5 : 0}
                      onClick={() => handleRegionClick(entry.region)}
                      className="cursor-pointer transition-opacity"
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
