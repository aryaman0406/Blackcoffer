import { MousePointerClick, PieChart as PieIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFilterContext } from '../context/index.js';
import { useAggregates } from '../hooks/index.js';
import { ChartContainer } from './ChartContainer.js';
import { CustomTooltip } from './CustomTooltip.js';

const PESTLE_COLORS: Record<string, string> = {
  Economic: '#4FD1C5',
  Political: '#38B2AC',
  Industries: '#319795',
  Technological: '#2C7A7B',
  Environmental: '#285E61',
  Social: '#4B5563',
  Healthcare: '#6B7280',
  Organization: '#9CA3AF',
  Unspecified: '#374151',
};

const FALLBACK_PALETTE = [
  '#4FD1C5',
  '#38B2AC',
  '#319795',
  '#2C7A7B',
  '#285E61',
  '#4B5563',
  '#6B7280',
  '#9CA3AF',
  '#374151',
];

export const PestlePieChart: React.FC = () => {
  const { filters, filterParams, setFilter } = useFilterContext();

  // Exclude pestle dimension from own query to avoid collapsing to 1 slice
  const chartFilterParams = useMemo(
    () => ({ ...filterParams, pestle: undefined }),
    [filterParams],
  );

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

    return `${topPestle.name} factors lead PESTLE distribution with ${topPestle.value} records (${topPct}% of signals). Click slice to filter.`;
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
          <div className="flex items-center gap-1.5 text-xs text-[#E8944A] mb-1 px-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>
              Filtering: <strong>{selectedPestle}</strong>
            </span>
          </div>
        )}

        <div className="w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Tooltip content={<CustomTooltip titlePrefix="Pillar" />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#8B93A7', paddingTop: '6px' }}
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
                outerRadius={75}
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
                    '#4FD1C5';

                  let fillOpacity = 0.85;
                  if (isFiltered) {
                    fillOpacity = isThisSelected ? 1 : 0.25;
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                      fillOpacity={fillOpacity}
                      stroke={isThisSelected ? '#ECE9E2' : '#0B1220'}
                      strokeWidth={isThisSelected ? 2.5 : 1.5}
                      className="cursor-pointer transition-opacity"
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
