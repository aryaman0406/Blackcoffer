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

    return `"${topTopic.topic}" is the most prominent topic (${topTopic.count} records, ${topTopicPct}% of displayed topics). Click bar to toggle.`;
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
          <div className="flex items-center gap-1.5 text-xs text-[#E8944A] mb-1 px-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>
              Active: <strong>{selectedTopics.join(', ')}</strong>
            </span>
          </div>
        )}

        <div className="w-full flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
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
                dataKey="topic"
                stroke="#8B93A7"
                fontSize={11}
                width={90}
                tickLine={false}
                axisLine={{ stroke: '#26314A' }}
                tick={{ fill: '#ECE9E2' }}
              />
              <Tooltip content={<CustomTooltip titlePrefix="Topic" />} />
              <Bar dataKey="count" name="Signals" radius={[0, 3, 3, 0]}>
                {chartData.map((entry, index) => {
                  const isFiltered = selectedTopics.length > 0;
                  const isThisSelected = entry.isSelected;
                  let fill = entry.isOther ? '#334155' : '#E8944A';
                  let fillOpacity = entry.isOther ? 0.7 : 0.85;

                  if (isFiltered && !entry.isOther) {
                    if (isThisSelected) {
                      fill = '#E8944A';
                      fillOpacity = 1;
                    } else {
                      fillOpacity = 0.25;
                    }
                  }

                  return (
                    <Cell
                      key={`topic-cell-${index}`}
                      fill={fill}
                      fillOpacity={fillOpacity}
                      stroke={isThisSelected ? '#ECE9E2' : 'none'}
                      strokeWidth={isThisSelected ? 1.5 : 0}
                      onClick={() => handleTopicClick(entry.topic)}
                      className={`transition-opacity ${
                        entry.isOther ? 'cursor-default' : 'cursor-pointer hover:opacity-100'
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
