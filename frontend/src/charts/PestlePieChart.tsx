import { MousePointerClick, PieChart as PieIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFilterContext } from '../context/index.js';
import { useAggregates } from '../hooks/index.js';
import { ChartContainer } from './ChartContainer.js';
import { CustomTooltip } from './CustomTooltip.js';

const PESTLE_COLORS: Record<string, string> = {
  Economic: '#0ea5e9', // Sky Blue
  Political: '#8b5cf6', // Violet
  Industries: '#10b981', // Emerald
  Technological: '#f59e0b', // Amber
  Environmental: '#14b8a6', // Teal
  Social: '#ec4899', // Pink
  Healthcare: '#06b6d4', // Cyan
  Organization: '#6366f1', // Indigo
  Unspecified: '#64748b', // Slate
};

const FALLBACK_PALETTE = [
  '#0ea5e9',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#64748b',
];

export const PestlePieChart: React.FC = () => {
  const { filters, filterParams, setFilter } = useFilterContext();

  // Exclude pestle dimension from own query to avoid collapsing to 1 slice
  const chartFilterParams = useMemo(() => ({ ...filterParams, pestle: undefined }), [filterParams]);

  const { data: aggregateResult, isLoading, error } = useAggregates(chartFilterParams);

  const selectedPestle = filters.pestle;

  const chartData = useMemo(() => {
    const rawPestle = aggregateResult?.data?.byPestle ?? [];
    return rawPestle
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: item.pestle || 'Unspecified',
        value: item.count,
        avgIntensity: item.avgIntensity,
        isSelected:
          selectedPestle !== undefined && (item.pestle || 'Unspecified') === selectedPestle,
      }));
  }, [aggregateResult, selectedPestle]);

  const isEmpty = chartData.length === 0;

  // Auto-generate key data point caption
  const caption = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
    const topPestle = [...chartData].sort((a, b) => b.value - a.value)[0];

    if (!topPestle) return undefined;
    const topPct = total > 0 ? ((topPestle.value / total) * 100).toFixed(1) : '0';

    return `${topPestle.name} factors lead PESTLE distribution with ${topPestle.value} records (${topPct}% of total). Click slice to cross-filter.`;
  }, [chartData]);

  const handleSliceClick = (pestleName: string) => {
    if (selectedPestle === pestleName) {
      setFilter('pestle', undefined);
    } else {
      setFilter('pestle', pestleName);
    }
  };

  return (
    <ChartContainer
      title="PESTLE Framework Distribution"
      caption={caption}
      icon={PieIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      error={error ? error.message : aggregateResult?.error}
      skeletonType="pie"
    >
      <div className="w-full h-full flex flex-col justify-between">
        {selectedPestle && (
          <div className="flex items-center gap-1.5 text-xs text-purple-400 mb-1 px-1">
            <MousePointerClick className="w-3.5 h-3.5 animate-pulse" />
            <span>
              Filtering by <strong>{selectedPestle}</strong> (Click slice or chip to reset)
            </span>
          </div>
        )}

        <div className="w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip content={<CustomTooltip titlePrefix="PESTLE" />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#cbd5e1', paddingTop: '10px' }}
                onClick={(entry) => {
                  if (entry && typeof entry.value === 'string') {
                    handleSliceClick(entry.value);
                  }
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                onClick={(entry) => {
                  if (entry && entry.name) {
                    handleSliceClick(entry.name);
                  }
                }}
              >
                {chartData.map((entry, index) => {
                  const isFiltered = selectedPestle !== undefined;
                  const isThisSelected = entry.isSelected;

                  const color =
                    PESTLE_COLORS[entry.name] ||
                    FALLBACK_PALETTE[index % FALLBACK_PALETTE.length] ||
                    '#38bdf8';

                  let fillOpacity = 0.9;
                  if (isFiltered) {
                    fillOpacity = isThisSelected ? 1 : 0.35;
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                      fillOpacity={fillOpacity}
                      stroke={isThisSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isThisSelected ? 3 : 2}
                      className="cursor-pointer transition-all duration-150 hover:opacity-100"
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartContainer>
  );
};
