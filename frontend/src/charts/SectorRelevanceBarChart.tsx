import { Layers, MousePointerClick } from 'lucide-react';
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

export const SectorRelevanceBarChart: React.FC = () => {
  const { filters, filterParams, setFilter } = useFilterContext();

  // Exclude sector from own aggregate query so top sectors remain visible
  const chartFilterParams = useMemo(() => ({ ...filterParams, sector: undefined }), [filterParams]);

  const { data: aggregateResult, isLoading, error } = useAggregates(chartFilterParams);

  const selectedSector = filters.sector;

  const chartData = useMemo(() => {
    const rawSectors = aggregateResult?.data?.bySector ?? [];
    return rawSectors
      .filter((item) => item.count > 0)
      .sort((a, b) => b.avgRelevance - a.avgRelevance)
      .slice(0, 10) // Show top 10 sectors by relevance
      .map((item) => ({
        sector: item.sector,
        avgRelevance: item.avgRelevance,
        count: item.count,
        avgIntensity: item.avgIntensity,
        isSelected: selectedSector !== undefined && item.sector === selectedSector,
      }));
  }, [aggregateResult, selectedSector]);

  const isEmpty = chartData.length === 0;

  // Auto-generate key data point caption
  const caption = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const topCoverageSector = [...chartData].sort((a, b) => b.count - a.count)[0];
    const highestRelevanceSector = [...chartData].sort(
      (a, b) => b.avgRelevance - a.avgRelevance,
    )[0];

    if (!topCoverageSector || !highestRelevanceSector) return undefined;

    if (topCoverageSector.sector === highestRelevanceSector.sector) {
      return `${topCoverageSector.sector} is the most-covered sector (${topCoverageSector.count} records) with highest avg relevance of ${topCoverageSector.avgRelevance}/10. Click bar to cross-filter.`;
    }

    return `${topCoverageSector.sector} is the most-covered sector (${topCoverageSector.count} records), while ${highestRelevanceSector.sector} leads in avg relevance (${highestRelevanceSector.avgRelevance}/10). Click bar to cross-filter.`;
  }, [chartData]);

  const handleSectorClick = (sectorName: string) => {
    if (selectedSector === sectorName) {
      setFilter('sector', undefined);
    } else {
      setFilter('sector', sectorName);
    }
  };

  return (
    <ChartContainer
      title="Average Relevance by Sector"
      caption={caption}
      icon={Layers}
      isLoading={isLoading}
      isEmpty={isEmpty}
      error={error ? error.message : aggregateResult?.error}
      skeletonType="bar"
    >
      <div className="w-full h-full flex flex-col justify-between">
        {selectedSector && (
          <div className="flex items-center gap-1.5 text-xs text-purple-400 mb-1 px-1">
            <MousePointerClick className="w-3.5 h-3.5 animate-pulse" />
            <span>
              Filtering by <strong>{selectedSector}</strong> (Click bar or chip to reset)
            </span>
          </div>
        )}

        <div className="w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                dataKey="sector"
                stroke="#cbd5e1"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                angle={-25}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                domain={[0, 10]}
              />
              <Tooltip content={<CustomTooltip titlePrefix="Sector" />} />
              <Bar dataKey="avgRelevance" name="Avg Relevance" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => {
                  const isFiltered = selectedSector !== undefined;
                  const isThisSelected = entry.isSelected;
                  let fill = '#a855f7';
                  let fillOpacity = 0.9;

                  if (isFiltered) {
                    if (isThisSelected) {
                      fill = '#c084fc';
                      fillOpacity = 1;
                    } else {
                      fillOpacity = 0.35;
                    }
                  }

                  return (
                    <Cell
                      key={`sector-cell-${index}`}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke={isThisSelected ? '#ffffff' : 'none'}
                      strokeWidth={isThisSelected ? 2 : 0}
                      onClick={() => handleSectorClick(entry.sector)}
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
