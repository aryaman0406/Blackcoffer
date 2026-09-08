import { TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFilterContext } from '../context/index.js';
import { useAggregates } from '../hooks/index.js';
import { ChartContainer } from './ChartContainer.js';
import { CustomTooltip } from './CustomTooltip.js';

export const IntensityLikelihoodLineChart: React.FC = () => {
  const { filterParams } = useFilterContext();
  const { data: aggregateResult, isLoading, error } = useAggregates(filterParams);

  // Filter out any invalid years and sort chronologically
  const chartData = useMemo(() => {
    const rawData = aggregateResult?.data?.byYear ?? [];
    return rawData.filter((item) => item.year && !isNaN(item.year)).sort((a, b) => a.year - b.year);
  }, [aggregateResult]);

  const isEmpty = chartData.length === 0;

  // Auto-generate key data point caption
  const caption = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const peakIntensityYear = [...chartData].sort((a, b) => b.avgIntensity - a.avgIntensity)[0];
    if (!peakIntensityYear) return undefined;

    return `Peak average intensity reached ${peakIntensityYear.avgIntensity.toFixed(1)} in ${peakIntensityYear.year} (Likelihood: ${peakIntensityYear.avgLikelihood.toFixed(1)}, ${peakIntensityYear.count} records).`;
  }, [chartData]);

  return (
    <ChartContainer
      title="Intensity & Likelihood Trends"
      caption={caption}
      icon={TrendingUp}
      isLoading={isLoading}
      isEmpty={isEmpty}
      error={error ? error.message : aggregateResult?.error}
      skeletonType="line"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="#26314A" opacity={0.6} />
          <XAxis
            dataKey="year"
            stroke="#8B93A7"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#26314A' }}
          />
          <YAxis stroke="#8B93A7" fontSize={11} tickLine={false} axisLine={{ stroke: '#26314A' }} />
          <Tooltip content={<CustomTooltip titlePrefix="Published Year" />} />
          <Legend
            verticalAlign="top"
            align="right"
            height={30}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#8B93A7' }}
          />
          <Line
            type="monotone"
            dataKey="avgIntensity"
            name="Avg Intensity"
            stroke="#4FD1C5"
            strokeWidth={2.5}
            dot={{ fill: '#0B1220', stroke: '#4FD1C5', strokeWidth: 2, r: 3.5 }}
            activeDot={{ r: 5.5, fill: '#4FD1C5', stroke: '#ECE9E2', strokeWidth: 1.5 }}
          />
          <Line
            type="monotone"
            dataKey="avgLikelihood"
            name="Avg Likelihood"
            stroke="#8B93A7"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ fill: '#0B1220', stroke: '#8B93A7', strokeWidth: 1.5, r: 3 }}
            activeDot={{ r: 5, fill: '#8B93A7', stroke: '#ECE9E2', strokeWidth: 1.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
