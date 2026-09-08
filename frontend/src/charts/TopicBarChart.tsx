import { MousePointerClick, Tag } from 'lucide-react';
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

export const TopicBarChart: React.FC = () => {
  const { filters, filterParams, toggleTopic } = useFilterContext();

  // Exclude topic from own aggregate query so top topics remain visible
  const chartFilterParams = useMemo(() => ({ ...filterParams, topic: undefined }), [filterParams]);

  const { data: aggregateResult, isLoading, error } = useAggregates(chartFilterParams);

  const selectedTopics = filters.topic;

  // Top 15 topics + Other bucket
  const chartData = useMemo(() => {
    const rawTopics = aggregateResult?.data?.byTopic ?? [];
    return rawTopics.map((item) => ({
      topic: item.topic,
      count: item.count,
      avgIntensity: item.avgIntensity,
      isOther: item.topic === 'Other',
      isSelected: selectedTopics.includes(item.topic),
    }));
  }, [aggregateResult, selectedTopics]);

  const isEmpty = chartData.length === 0;

  // Auto-generate key data point caption
  const caption = useMemo(() => {
    if (chartData.length === 0) return undefined;
    const topTopic = chartData.find((t) => !t.isOther);
    if (!topTopic) return undefined;

    const totalInChart = chartData.reduce((acc, curr) => acc + curr.count, 0);
    const topTopicPct = totalInChart > 0 ? ((topTopic.count / totalInChart) * 100).toFixed(1) : '0';

    return `"${topTopic.topic}" is the most prominent topic (${topTopic.count} records, ${topTopicPct}% of displayed topics). Click bar to cross-filter.`;
  }, [chartData]);

  const handleTopicClick = (topicName: string) => {
    if (topicName && topicName !== 'Other') {
      toggleTopic(topicName);
    }
  };

  return (
    <ChartContainer
      title="Top 15 Topics + Remaining Summary"
      caption={caption}
      icon={Tag}
      isLoading={isLoading}
      isEmpty={isEmpty}
      error={error ? error.message : aggregateResult?.error}
      skeletonType="bar"
    >
      <div className="w-full h-full flex flex-col justify-between">
        {selectedTopics.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-sky-400 mb-1 px-1">
            <MousePointerClick className="w-3.5 h-3.5 animate-pulse" />
            <span>
              Selected Topics: <strong>{selectedTopics.join(', ')}</strong> (Click bar or chip to
              toggle)
            </span>
          </div>
        )}

        <div className="w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
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
                dataKey="topic"
                stroke="#cbd5e1"
                fontSize={11}
                width={95}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                tick={{ fill: '#cbd5e1' }}
              />
              <Tooltip content={<CustomTooltip titlePrefix="Topic" />} />
              <Bar dataKey="count" name="Record Count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => {
                  const isFiltered = selectedTopics.length > 0;
                  const isThisSelected = entry.isSelected;
                  let fill = entry.isOther ? '#64748b' : '#38bdf8';
                  let fillOpacity = entry.isOther ? 0.75 : 0.9;

                  if (isFiltered && !entry.isOther) {
                    if (isThisSelected) {
                      fill = '#38bdf8';
                      fillOpacity = 1;
                    } else {
                      fillOpacity = 0.35;
                    }
                  }

                  return (
                    <Cell
                      key={`topic-cell-${index}`}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke={isThisSelected ? '#ffffff' : 'none'}
                      strokeWidth={isThisSelected ? 2 : 0}
                      onClick={() => handleTopicClick(entry.topic)}
                      className={`transition-all duration-150 ${
                        entry.isOther ? 'cursor-default' : 'cursor-pointer hover:brightness-125'
                      }`}
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
