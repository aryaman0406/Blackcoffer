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

    return `Peak average intensity reached ${peakIntensityYear.avgIntensity} in ${peakIntensityYear.year} (Likelihood: ${peakIntensityYear.avgLikelihood}, ${peakIntensityYear.count} records).`;
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
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="intensityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis
            dataKey="year"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#475569' }} />
          <Tooltip content={<CustomTooltip titlePrefix="Published Year" />} />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }}
          />
          <Line
            type="monotone"
            dataKey="avgIntensity"
            name="Avg Intensity"
            stroke="#38bdf8"
            strokeWidth={3}
            dot={{ fill: '#0284c7', stroke: '#38bdf8', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="avgLikelihood"
            name="Avg Likelihood"
            stroke="#c084fc"
            strokeWidth={2.5}
            strokeDasharray="4 4"
            dot={{ fill: '#9333ea', stroke: '#c084fc', strokeWidth: 2, r: 3.5 }}
            activeDot={{ r: 6, fill: '#c084fc', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
