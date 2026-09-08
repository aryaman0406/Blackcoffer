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

    return `Peak concentration: ${peak.region} in ${peak.year} (Avg Intensity: ${peak.avgIntensity}, ${peak.count} records). Click any cell to cross-filter.`;
  }, [rawHeatmap]);

  // D3 Render Effect with full cleanup
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || isEmpty || isLoading) {
      return;
    }

    const svg = d3.select(svgRef.current);
    // Remove previous render elements to avoid React / D3 DOM conflicts
    svg.selectAll('*').remove();

    const containerWidth = containerRef.current.clientWidth || 600;
    const containerHeight = Math.max(regions.length * 32 + 80, 260);

    const margin = { top: 30, right: 30, bottom: 40, left: 130 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    svg.attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand<number>().domain(years).range([0, width]).padding(0.08);

    const yScale = d3.scaleBand<string>().domain(regions).range([0, height]).padding(0.08);

    // Color Interpolator (Slate -> Deep Cyan -> Electric Sky Blue -> Bright Amber)
    const colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, maxIntensity]);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => String(d)))
      .call((axis) => {
        axis.select('.domain').attr('stroke', '#475569');
        axis.selectAll('.tick line').attr('stroke', '#475569');
        axis.selectAll('.tick text').attr('fill', '#94a3b8').attr('font-size', '11px');
      });

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale))
      .call((axis) => {
        axis.select('.domain').attr('stroke', '#475569');
        axis.selectAll('.tick line').attr('stroke', '#475569');
        axis
          .selectAll('.tick text')
          .attr('fill', '#cbd5e1')
          .attr('font-size', '11px')
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

        const cellFill = hasData ? colorScale(intensity) : '#1e293b';
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
            cellOpacity = 0.35;
          }
        }

        const rect = g
          .append('rect')
          .attr('x', cellX)
          .attr('y', cellY)
          .attr('width', cellW)
          .attr('height', cellH)
          .attr('rx', 4)
          .attr('ry', 4)
          .attr('fill', cellFill)
          .attr('fill-opacity', cellOpacity)
          .attr('stroke', isCellSelected ? '#ffffff' : '#0f172a')
          .attr('stroke-width', isCellSelected ? 2.5 : 1.5)
          .style('cursor', hasData ? 'pointer' : 'default')
          .style('transition', 'all 0.15s ease-in-out');

        if (hasData) {
          rect
            .on('mouseenter', (event: MouseEvent) => {
              rect.attr('stroke', '#38bdf8').attr('stroke-width', 2.5);
              const rectBounds = containerRef.current?.getBoundingClientRect();
              setTooltip({
                visible: true,
                x: event.clientX - (rectBounds?.left ?? 0) + 12,
                y: event.clientY - (rectBounds?.top ?? 0) - 20,
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
                x: event.clientX - (rectBounds?.left ?? 0) + 12,
                y: event.clientY - (rectBounds?.top ?? 0) - 20,
              }));
            })
            .on('mouseleave', () => {
              rect
                .attr('stroke', isCellSelected ? '#ffffff' : '#0f172a')
                .attr('stroke-width', isCellSelected ? 2.5 : 1.5);
              setTooltip((prev) => ({ ...prev, visible: false }));
            })
            .on('click', () => {
              // Toggle cross-filter region and year
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

    return () => {
      svg.selectAll('*').remove();
    };
  }, [
    regions,
    years,
    rawHeatmap,
    maxIntensity,
    isEmpty,
    isLoading,
    selectedRegion,
    selectedMinYear,
    selectedMaxYear,
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
      className="col-span-full"
    >
      <div className="w-full h-full flex flex-col justify-between" ref={containerRef}>
        {/* Heatmap Instructions & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-sky-400">
            <MousePointerClick className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              Click any cell to cross-filter dashboard by Region & Year
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">0 (Low)</span>
            <div className="w-24 h-2 rounded-full bg-gradient-to-r from-slate-800 via-sky-600 to-amber-400 border border-slate-700" />
            <span className="text-[10px] text-slate-400">{maxIntensity} (High)</span>
          </div>
        </div>

        {/* SVG Container */}
        <div className="w-full relative flex-1 min-h-[260px] overflow-x-auto overflow-y-hidden">
          <svg ref={svgRef} className="w-full h-full min-w-[550px]" />

          {/* Floating D3 Tooltip */}
          {tooltip.visible && (
            <div
              className="absolute pointer-events-none z-50 rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl text-xs space-y-1"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: 'translateY(-50%)',
              }}
            >
              <div className="font-bold text-white border-b border-slate-800 pb-1">
                {tooltip.region} ({tooltip.year})
              </div>
              <div className="flex justify-between gap-3 text-slate-300">
                <span className="text-slate-400">Avg Intensity:</span>
                <span className="font-bold text-sky-400">
                  {Number.isFinite(tooltip.avgIntensity) ? tooltip.avgIntensity.toFixed(1) : '0.0'}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-slate-300">
                <span className="text-slate-400">Record Count:</span>
                <span className="font-bold text-slate-100">{tooltip.count}</span>
              </div>
              <div className="text-[10px] text-sky-400/80 pt-0.5">Click cell to filter/reset</div>
            </div>
          )}
        </div>
      </div>
    </ChartContainer>
  );
};
