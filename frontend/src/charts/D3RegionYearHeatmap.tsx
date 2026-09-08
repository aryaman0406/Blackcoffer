import * as d3 from 'd3';
import { Flame, MousePointerClick } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFilterContext } from '../context/index.js';
import { useAggregates } from '../hooks/index.js';
import { ChartContainer } from './ChartContainer.js';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  region: string;
  year: number;
  avgIntensity: number;
  count: number;
}

export const D3RegionYearHeatmap: React.FC = () => {
  const { filters, filterParams, setFilter, resetFilter, setYearRange } = useFilterContext();

  // Exclude region and year dimensions from own aggregate query so matrix remains visible
  const chartFilterParams = useMemo(
    () => ({
      ...filterParams,
      region: undefined,
      minYear: undefined,
      maxYear: undefined,
    }),
    [filterParams],
  );

  const { data: aggregateResult, isLoading, error } = useAggregates(chartFilterParams);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    region: '',
    year: 0,
    avgIntensity: 0,
    count: 0,
  });

  const selectedRegion = filters.region;
  const selectedMinYear = filters.minYear;
  const selectedMaxYear = filters.maxYear;

  const rawHeatmap = useMemo(
    () => aggregateResult?.data?.regionYearHeatmap ?? [],
    [aggregateResult],
  );

  const isEmpty = rawHeatmap.length === 0;

  // Derive distinct regions and years
  const { regions, years, maxIntensity } = useMemo(() => {
    if (rawHeatmap.length === 0) {
      return { regions: [], years: [], maxIntensity: 100 };
    }

    const regSet = new Set<string>();
    const yearSet = new Set<number>();
    let max = 0;

    for (const item of rawHeatmap) {
      if (item.region) regSet.add(item.region);
      if (item.year) yearSet.add(item.year);
      if (item.avgIntensity > max) max = item.avgIntensity;
    }

    return {
      regions: Array.from(regSet).sort(),
      years: Array.from(yearSet).sort((a, b) => a - b),
      maxIntensity: Math.max(max, 10),
    };
  }, [rawHeatmap]);

  // Auto-generate key data point caption
  const caption = useMemo(() => {
    if (rawHeatmap.length === 0) return undefined;
    const peak = [...rawHeatmap].sort((a, b) => b.avgIntensity - a.avgIntensity)[0];
    if (!peak) return undefined;

    return `Peak concentration: ${peak.region} in ${peak.year} (Avg: ${peak.avgIntensity.toFixed(1)}, ${peak.count} records). Click any cell to cross-filter dashboard by Region & Year.`;
  }, [rawHeatmap]);

  // D3 Render Effect with full cleanup
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || isEmpty || isLoading) {
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 600;
    const containerHeight = Math.max(regions.length * 28 + 70, 240);

    const margin = { top: 25, right: 20, bottom: 35, left: 120 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand<number>().domain(years).range([0, width]).padding(0.08);

    const yScale = d3.scaleBand<string>().domain(regions).range([0, height]).padding(0.08);

    // Color scale: Teal spectrum
    const colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, maxIntensity]);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => String(d)))
      .call((axis) => {
        axis.select('.domain').attr('stroke', '#26314A');
        axis.selectAll('.tick line').attr('stroke', '#26314A');
        axis.selectAll('.tick text').attr('fill', '#8B93A7').attr('font-size', '10px');
      });

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .call((axis) => {
        axis.select('.domain').attr('stroke', '#26314A');
        axis.selectAll('.tick line').attr('stroke', '#26314A');
        axis
          .selectAll('.tick text')
          .attr('fill', '#ECE9E2')
          .attr('font-size', '10px')
          .attr('font-weight', '500');
      });

    // Data lookup map
    const dataMap = new Map<string, { avgIntensity: number; count: number }>();
    rawHeatmap.forEach((d) => {
      dataMap.set(`${d.region}__${d.year}`, {
        avgIntensity: d.avgIntensity,
        count: d.count,
      });
    });

    // Render Heatmap Matrix Grid Cells
    regions.forEach((region) => {
      years.forEach((year) => {
        const key = `${region}__${year}`;
        const item = dataMap.get(key);
        const intensity = item?.avgIntensity ?? 0;
        const count = item?.count ?? 0;
        const hasData = count > 0;

        const cellX = xScale(year) ?? 0;
        const cellY = yScale(region) ?? 0;
        const cellW = xScale.bandwidth();
        const cellH = yScale.bandwidth();

        const isCellSelected =
          selectedRegion === region &&
          ((selectedMinYear === year && selectedMaxYear === year) ||
            (selectedMinYear === undefined && selectedMaxYear === undefined));

        const isAnyFilterActive = selectedRegion !== undefined || selectedMinYear !== undefined;

        const cellFill = hasData ? colorScale(intensity) : '#131B2E';
        let cellOpacity = 1;

        if (isAnyFilterActive && hasData) {
          const matchesRegion = !selectedRegion || selectedRegion === region;
          const matchesYear =
            (!selectedMinYear && !selectedMaxYear) ||
            ((!selectedMinYear || year >= selectedMinYear) &&
              (!selectedMaxYear || year <= selectedMaxYear));

          if (matchesRegion && matchesYear) {
            cellOpacity = 1;
          } else {
            cellOpacity = 0.25;
          }
        }

        const rect = g
          .append('rect')
          .attr('x', cellX)
          .attr('y', cellY)
          .attr('width', cellW)
          .attr('height', cellH)
          .attr('rx', 3)
          .attr('ry', 3)
          .attr('fill', cellFill)
          .attr('fill-opacity', cellOpacity)
          .attr('stroke', isCellSelected ? '#ECE9E2' : '#0B1220')
          .attr('stroke-width', isCellSelected ? 2 : 1)
          .style('cursor', hasData ? 'pointer' : 'default')
          .style('transition', 'all 0.15s ease-in-out');

        if (hasData) {
          rect
            .on('mouseenter', (event: MouseEvent) => {
              rect.attr('stroke', '#4FD1C5').attr('stroke-width', 2);
              const rectBounds = containerRef.current?.getBoundingClientRect();
              setTooltip({
                visible: true,
                x: event.clientX - (rectBounds?.left ?? 0) + 10,
                y: event.clientY - (rectBounds?.top ?? 0) - 15,
                region,
                year,
                avgIntensity: intensity,
                count,
              });
            })
            .on('mousemove', (event: MouseEvent) => {
              const rectBounds = containerRef.current?.getBoundingClientRect();
              setTooltip((prev) => ({
                ...prev,
                x: event.clientX - (rectBounds?.left ?? 0) + 10,
                y: event.clientY - (rectBounds?.top ?? 0) - 15,
              }));
            })
            .on('mouseleave', () => {
              rect
                .attr('stroke', isCellSelected ? '#ECE9E2' : '#0B1220')
                .attr('stroke-width', isCellSelected ? 2 : 1);
              setTooltip((prev) => ({ ...prev, visible: false }));
            })
            .on('click', () => {
              if (
                selectedRegion === region &&
                selectedMinYear === year &&
                selectedMaxYear === year
              ) {
                resetFilter('region');
                setYearRange(undefined, undefined);
              } else {
                setFilter('region', region);
                setYearRange(year, year);
              }
            });
        }
      });
    });
  }, [
    regions,
    years,
    rawHeatmap,
    maxIntensity,
    selectedRegion,
    selectedMinYear,
    selectedMaxYear,
    isEmpty,
    isLoading,
    setFilter,
    resetFilter,
    setYearRange,
  ]);

  return (
    <ChartContainer
      title="Region × Published Year Intensity Heatmap"
      caption={caption}
      icon={Flame}
      isLoading={isLoading}
      isEmpty={isEmpty}
      error={error ? error.message : aggregateResult?.error}
      skeletonType="bar"
    >
      <div className="w-full h-full flex flex-col justify-between" ref={containerRef}>
        {(selectedRegion || selectedMinYear) && (
          <div className="flex items-center gap-1.5 text-xs text-[#E8944A] mb-1 px-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            <span>
              Active Matrix: {selectedRegion ? <strong>{selectedRegion}</strong> : 'All'}{' '}
              {selectedMinYear ? `(${selectedMinYear})` : ''}
            </span>
          </div>
        )}

        <div className="w-full flex-1 min-h-0 relative">
          <svg ref={svgRef} className="w-full h-full" />

          {/* Tooltip Overlay */}
          {tooltip.visible && (
            <div
              className="absolute z-50 pointer-events-none rounded-lg bg-[#131B2E]/95 border border-[#26314A] p-2 shadow-2xl backdrop-blur-md text-xs space-y-1 transform -translate-x-1/2 -translate-y-full"
              style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
            >
              <div className="font-semibold text-[#ECE9E2] border-b border-[#26314A] pb-0.5">
                {tooltip.region} ({tooltip.year})
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-[#8B93A7]">Intensity:</span>
                <span className="font-semibold text-[#E8944A] tabular-nums">
                  {tooltip.avgIntensity.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-[#8B93A7]">Records:</span>
                <span className="font-semibold text-[#4FD1C5] tabular-nums">
                  {tooltip.count}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChartContainer>
  );
};
