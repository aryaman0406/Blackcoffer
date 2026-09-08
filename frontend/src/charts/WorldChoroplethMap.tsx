import * as d3 from 'd3';
import { Globe, MousePointerClick, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { feature } from 'topojson-client';
import worldAtlasData from 'world-atlas/countries-110m.json';
import { useFilterContext } from '../context/index.js';
import { useAggregates } from '../hooks/index.js';
import { ChartContainer } from './ChartContainer.js';

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  countryName: string;
  avgIntensity: number | null;
  recordCount: number;
}

const COUNTRY_ALIASES: Record<string, string> = {
  'united states': 'United States of America',
  usa: 'United States of America',
  us: 'United States of America',
  'united kingdom': 'United Kingdom',
  uk: 'United Kingdom',
  'great britain': 'United Kingdom',
  russia: 'Russia',
  'russian federation': 'Russia',
  iran: 'Iran',
  'iran, islamic republic of': 'Iran',
  syria: 'Syria',
  'syrian arab republic': 'Syria',
  venezuela: 'Venezuela',
  'venezuela, bolivarian republic of': 'Venezuela',
  vietnam: 'Vietnam',
  'viet nam': 'Vietnam',
  'south korea': 'South Korea',
  'korea, republic of': 'South Korea',
  'czech republic': 'Czechia',
  czechia: 'Czechia',
  'tanzania, united republic of': 'Tanzania',
  'bolivia, plurinational state of': 'Bolivia',
  'moldova, republic of': 'Moldova',
  'democratic republic of the congo': 'Dem. Rep. Congo',
  'dr congo': 'Dem. Rep. Congo',
  congo: 'Congo',
  'congo, the democratic republic of the': 'Dem. Rep. Congo',
};

function normalizeCountryName(name: string): string {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  return COUNTRY_ALIASES[lower] || name.trim();
}

type GeoJsonFeature = d3.ExtendedFeature<d3.GeoGeometryObjects, { name?: string }>;

export const WorldChoroplethMap: React.FC = () => {
  const { filters, filterParams, setFilter } = useFilterContext();

  // Exclude country from own aggregate query so map retains global perspective
  const chartFilterParams = useMemo(
    () => ({ ...filterParams, country: undefined }),
    [filterParams],
  );

  const { data: aggregateResult, isLoading, error } = useAggregates(chartFilterParams);

  const selectedCountry = filters.country;

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    countryName: '',
    avgIntensity: null,
    recordCount: 0,
  });

  const rawCountryAggregates = useMemo(
    () => aggregateResult?.data?.byCountry ?? [],
    [aggregateResult],
  );

  const isEmpty = rawCountryAggregates.length === 0;

  // Build lookup map for country data
  const { countryDataMap, maxIntensity, leadingCountry } = useMemo(() => {
    const map = new Map<string, { avgIntensity: number; count: number; originalName: string }>();
    let max = 0;
    let leader: { country: string; avgIntensity: number; count: number } | null = null;

    for (const item of rawCountryAggregates) {
      if (!item.country || item.country === 'Unspecified') continue;

      const normalized = normalizeCountryName(item.country).toLowerCase();
      map.set(normalized, {
        avgIntensity: item.avgIntensity,
        count: item.count,
        originalName: item.country,
      });

      if (item.avgIntensity > max) {
        max = item.avgIntensity;
      }

      if (!leader || item.avgIntensity > leader.avgIntensity) {
        leader = {
          country: item.country,
          avgIntensity: item.avgIntensity,
          count: item.count,
        };
      }
    }

    return {
      countryDataMap: map,
      maxIntensity: Math.max(max, 10),
      leadingCountry: leader,
    };
  }, [rawCountryAggregates]);

  // Generate GeoJSON country features from TopoJSON
  const countryFeatures = useMemo(() => {
    const atlas = worldAtlasData as unknown as Parameters<typeof feature>[0] & {
      objects: { countries: Parameters<typeof feature>[1] };
    };
    const countriesTopo = atlas.objects.countries;
    const geoCollection = feature(atlas, countriesTopo) as unknown as {
      features: GeoJsonFeature[];
    };
    return geoCollection.features ?? [];
  }, []);

  // Map projection and path generator
  const mapWidth = 960;
  const mapHeight = 460;

  const { pathGenerator } = useMemo(() => {
    const projection = d3
      .geoNaturalEarth1()
      .scale(155)
      .translate([mapWidth / 2, mapHeight / 2 + 15]);

    const generator = d3.geoPath(projection);
    return { pathGenerator: generator };
  }, [mapWidth, mapHeight]);

  // Color interpolator for countries with data
  const colorScale = useMemo(() => {
    return d3.scaleSequential(d3.interpolateYlGnBu).domain([0, maxIntensity]);
  }, [maxIntensity]);

  // Auto-generate caption
  const caption = useMemo(() => {
    if (rawCountryAggregates.length === 0) return undefined;
    if (leadingCountry) {
      const avgStr = Number.isFinite(leadingCountry.avgIntensity)
        ? leadingCountry.avgIntensity.toFixed(1)
        : '0.0';
      return `Peak country intensity: ${leadingCountry.country} (Avg: ${avgStr}, ${leadingCountry.count} records). Neutral grey indicates unrepresented regions. Click country to cross-filter.`;
    }
    return 'World country distribution shaded by average intensity. Click country to cross-filter.';
  }, [rawCountryAggregates, leadingCountry]);

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.4, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.4, 0.8));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleCountryClick = (countryName: string) => {
    if (selectedCountry === countryName) {
      setFilter('country', undefined);
    } else {
      setFilter('country', countryName);
    }
  };

  return (
    <ChartContainer
      title="Global Intensity Distribution Map"
      caption={caption}
      icon={Globe}
      isLoading={isLoading}
      isEmpty={isEmpty}
      error={error ? error.message : aggregateResult?.error}
      className="col-span-full"
    >
      <div className="w-full h-full flex flex-col justify-between relative select-none">
        {/* Map Controls & Legend Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sky-400">
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>
                {selectedCountry ? (
                  <span>
                    Filtered by <strong>{selectedCountry}</strong> (Click country or chip to reset)
                  </span>
                ) : (
                  <span className="text-[11px]">Click country to cross-filter dashboard</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Intensity Scale Legend */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">0 (Low)</span>
              <div className="w-24 h-2 rounded-full bg-gradient-to-r from-emerald-200 via-sky-500 to-blue-900 border border-slate-700" />
              <span className="text-[10px] text-slate-400">{maxIntensity} (High)</span>
            </div>

            {/* No Data Legend Swatch */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
              <span className="text-[10px] text-slate-400">No Data (Neutral Grey)</span>
            </div>

            {/* Map Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Map SVG Container */}
        <div className="w-full relative min-h-[380px] flex-1 bg-slate-950/60 rounded-xl border border-slate-800/60 overflow-hidden flex items-center justify-center">
          <svg
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="w-full h-full max-h-[460px] object-contain transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
            {/* Graticule Background Grid lines */}
            <defs>
              <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
              </radialGradient>
            </defs>

            <rect width={mapWidth} height={mapHeight} fill="url(#oceanGlow)" />

            {/* Country Features */}
            <g className="countries-layer">
              {countryFeatures.map((geoFeature, idx) => {
                const countryName = geoFeature.properties?.name ?? `Country-${idx}`;
                const normName = normalizeCountryName(countryName).toLowerCase();
                const matchedData = countryDataMap.get(normName);

                const hasData = matchedData !== undefined && matchedData.count > 0;
                const pathD = pathGenerator(geoFeature) ?? '';

                if (!pathD) return null;

                const isThisSelected =
                  selectedCountry !== undefined &&
                  matchedData !== undefined &&
                  (matchedData.originalName === selectedCountry ||
                    normName === selectedCountry.toLowerCase());

                const fillColor = hasData ? colorScale(matchedData.avgIntensity) : '#1e293b'; // Distinct Neutral Grey

                let fillOpacity = 1;
                if (selectedCountry && hasData) {
                  fillOpacity = isThisSelected ? 1 : 0.4;
                }

                return (
                  <path
                    key={`geo-${geoFeature.id ?? countryName}-${idx}`}
                    d={pathD}
                    fill={fillColor}
                    fillOpacity={fillOpacity}
                    stroke={isThisSelected ? '#38bdf8' : '#334155'}
                    strokeWidth={isThisSelected ? 2 : hasData ? 0.8 : 0.4}
                    className={`transition-all duration-150 ${
                      hasData
                        ? 'cursor-pointer hover:stroke-sky-300 hover:stroke-[1.8] hover:opacity-100'
                        : 'cursor-default hover:stroke-slate-500 hover:stroke-[0.8]'
                    }`}
                    onMouseEnter={(event) => {
                      const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                      setTooltip({
                        visible: true,
                        x: event.clientX - (rect?.left ?? 0) + 12,
                        y: event.clientY - (rect?.top ?? 0) - 15,
                        countryName,
                        avgIntensity: hasData ? matchedData.avgIntensity : null,
                        recordCount: hasData ? matchedData.count : 0,
                      });
                    }}
                    onMouseMove={(event) => {
                      const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                      setTooltip((prev) => ({
                        ...prev,
                        x: event.clientX - (rect?.left ?? 0) + 12,
                        y: event.clientY - (rect?.top ?? 0) - 15,
                      }));
                    }}
                    onMouseLeave={() => {
                      setTooltip((prev) => ({ ...prev, visible: false }));
                    }}
                    onClick={() => {
                      if (hasData) {
                        handleCountryClick(matchedData.originalName);
                      }
                    }}
                  />
                );
              })}
            </g>
          </svg>

          {/* Map Hover Tooltip */}
          {tooltip.visible && (
            <div
              className="absolute pointer-events-none z-50 rounded-xl border border-slate-700/80 bg-slate-900/95 backdrop-blur-xl p-3 shadow-2xl text-xs space-y-1"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: 'translateY(-50%)',
              }}
            >
              <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
                <span>{tooltip.countryName}</span>
                {tooltip.avgIntensity !== null && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-normal">
                    Active Data
                  </span>
                )}
              </div>

              {tooltip.avgIntensity !== null ? (
                <>
                  <div className="flex justify-between gap-4 text-slate-300">
                    <span className="text-slate-400">Avg Intensity:</span>
                    <span className="font-bold text-cyan-400">
                      {Number.isFinite(tooltip.avgIntensity)
                        ? tooltip.avgIntensity.toFixed(1)
                        : '0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-slate-300">
                    <span className="text-slate-400">Record Count:</span>
                    <span className="font-bold text-slate-100">{tooltip.recordCount}</span>
                  </div>
                  <div className="text-[10px] text-sky-400/80 pt-0.5">
                    Click to filter/reset country
                  </div>
                </>
              ) : (
                <div className="text-slate-400 italic py-0.5">No data available (0 records)</div>
              )}
            </div>
          )}
        </div>
      </div>
    </ChartContainer>
  );
};
