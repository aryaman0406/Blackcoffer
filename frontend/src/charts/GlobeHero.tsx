import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Compass, FilterX, Globe as GlobeIcon, RotateCcw } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFilterContext } from '../context/index.js';
import { useAggregates } from '../hooks/index.js';
import type { CountryAggregate } from '../types/index.js';
import { getCountryCoordinates, isWebGLAvailable, latLngToVector3 } from '../utils/index.js';
import { WorldChoroplethMap } from './WorldChoroplethMap.js';

interface MarkerData {
  country: string;
  position: [number, number, number];
  lat: number;
  lng: number;
  avgIntensity: number;
  count: number;
  color: string;
  isLeading: boolean;
}

interface GlobeTooltipState {
  visible: boolean;
  x: number;
  y: number;
  country: string;
  avgIntensity: number;
  count: number;
}

const GLOBE_RADIUS = 2.0;

// Inner Earth Sphere with schematic dark grid and wireframe rings
const EarthSphere: React.FC = () => {
  const graticuleLines = useMemo(() => {
    const lines: THREE.LineSegments[] = [];
    const material = new THREE.LineBasicMaterial({
      color: '#1B273F',
      transparent: true,
      opacity: 0.45,
    });

    // Latitude rings (-60, -30, 0, 30, 60)
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = (90 - lat) * (Math.PI / 180);
      const ringRadius = GLOBE_RADIUS * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.cos(phi);

      const curve = new THREE.EllipseCurve(0, 0, ringRadius, ringRadius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(64).map((p) => new THREE.Vector3(p.x, y, p.y));
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(new THREE.LineSegments(geom, material));
    }

    return lines;
  }, []);

  return (
    <group>
      {/* Dark Base Sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS - 0.01, 48, 48]} />
        <meshStandardMaterial color="#0B1322" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Outer Wireframe Mesh */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 24, 24]} />
        <meshBasicMaterial color="#26314A" wireframe transparent opacity={0.22} />
      </mesh>

      {/* Atmospheric Rim Glow */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 1.05, 32, 32]} />
        <meshBasicMaterial color="#4FD1C5" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Schematic Graticule Rings */}
      {graticuleLines.map((line, idx) => (
        <primitive object={line} key={`graticule-${idx}`} />
      ))}
    </group>
  );
};

// Interactive Country Marker
const CountryMarker: React.FC<{
  marker: MarkerData;
  isSelected: boolean;
  isDimmed: boolean;
  onHover: (data: MarkerData | null, clientX?: number, clientY?: number) => void;
  onClick: (data: MarkerData) => void;
}> = ({ marker, isSelected, isDimmed, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Normal vector pointing outwards from center
  const normal = useMemo(() => {
    return new THREE.Vector3(...marker.position).normalize();
  }, [marker.position]);

  const markerRadius = useMemo(() => {
    const base = Math.min(0.08, 0.035 + (marker.avgIntensity / 100) * 0.04);
    return isSelected ? base * 1.6 : hovered ? base * 1.4 : base;
  }, [marker.avgIntensity, isSelected, hovered]);

  const color = useMemo(() => {
    if (isSelected) return '#E8944A';
    if (hovered) return '#FFFFFF';
    return marker.color;
  }, [isSelected, hovered, marker.color]);

  const opacity = isDimmed ? 0.2 : isSelected || hovered ? 1.0 : 0.85;

  return (
    <group position={marker.position}>
      {/* Outer glowing halo ring for active / selected country */}
      {(isSelected || hovered || marker.isLeading) && (
        <mesh position={normal.clone().multiplyScalar(0.02).toArray()}>
          <ringGeometry args={[markerRadius * 1.2, markerRadius * 1.8, 24]} />
          <meshBasicMaterial
            color={isSelected || marker.isLeading ? '#E8944A' : '#4FD1C5'}
            transparent
            opacity={isSelected ? 0.9 : 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Main Signal Sphere Marker */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(marker, e.clientX, e.clientY);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(marker);
        }}
      >
        <sphereGeometry args={[markerRadius, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.5 : hovered ? 1.2 : 0.6}
          roughness={0.2}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

// Main Scene inside R3F Canvas
const GlobeScene: React.FC<{
  markers: MarkerData[];
  selectedCountry?: string;
  onSelectCountry: (country: string) => void;
  setTooltip: React.Dispatch<React.SetStateAction<GlobeTooltipState>>;
  targetRotation: [number, number] | null;
  reducedMotion: boolean;
}> = ({ markers, selectedCountry, onSelectCountry, setTooltip, targetRotation, reducedMotion }) => {
  const globeGroupRef = useRef<THREE.Group>(null);

  // Idle rotation & smooth camera fly-to animation
  useFrame((_, delta) => {
    if (!globeGroupRef.current) return;

    if (!targetRotation && !reducedMotion) {
      // Idle slow spin
      globeGroupRef.current.rotation.y += delta * 0.08;
    } else if (targetRotation) {
      // Smooth interpolation to target country lat/lng
      const targetY = -targetRotation[1] * (Math.PI / 180) + Math.PI / 2;
      const targetX = targetRotation[0] * (Math.PI / 180) * 0.5;

      globeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        globeGroupRef.current.rotation.y,
        targetY,
        delta * 3.5,
      );
      globeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        globeGroupRef.current.rotation.x,
        targetX,
        delta * 3.5,
      );
    }
  });

  const handleMarkerHover = useCallback(
    (data: MarkerData | null, clientX?: number, clientY?: number) => {
      if (!data || clientX === undefined || clientY === undefined) {
        setTooltip((prev) => ({ ...prev, visible: false }));
        return;
      }
      setTooltip({
        visible: true,
        x: clientX,
        y: clientY,
        country: data.country,
        avgIntensity: data.avgIntensity,
        count: data.count,
      });
    },
    [setTooltip],
  );

  const handleMarkerClick = useCallback(
    (data: MarkerData) => {
      onSelectCountry(data.country);
    },
    [onSelectCountry],
  );

  return (
    <>
      <WebGLContextHandler />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -5, -10]} intensity={0.5} color="#4FD1C5" />

      <group ref={globeGroupRef}>
        <EarthSphere />

        {/* Render glowing data markers */}
        {markers.map((marker) => {
          const isSelected =
            selectedCountry !== undefined &&
            selectedCountry.toLowerCase() === marker.country.toLowerCase();
          const isDimmed = selectedCountry !== undefined && !isSelected;

          return (
            <CountryMarker
              key={`marker-${marker.country}`}
              marker={marker}
              isSelected={isSelected}
              isDimmed={isDimmed}
              onHover={handleMarkerHover}
              onClick={handleMarkerClick}
            />
          );
        })}
      </group>

      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={6.5}
        rotateSpeed={0.5}
        zoomSpeed={0.7}
      />
    </>
  );
};

// WebGL Context Loss & Recovery listener
const WebGLContextHandler: React.FC = () => {
  const { gl } = useThree();

  useEffect(() => {
    console.count('canvas-mount');
    console.count('globe-canvas-mount');

    if (typeof window !== 'undefined') {
      window.__CANVAS_MOUNTS__ = window.__CANVAS_MOUNTS__ || { globe: 0, sector: 0 };
      window.__CANVAS_MOUNTS__.globe += 1;
      window.__globeCanvasMountCount = (window.__globeCanvasMountCount || 0) + 1;
    }

    const canvas = gl.domElement;
    if (!canvas) return;

    canvas.setAttribute('data-testid', 'globe-canvas');
    canvas.setAttribute('data-mount-count', String(window.__globeCanvasMountCount || 1));

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log('[WebGL Event] Globe webglcontextlost handled successfully');
    };

    const handleContextRestored = () => {
      console.log('[WebGL Event] Globe webglcontextrestored handled successfully');
      gl.renderLists.dispose();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  return null;
};

export const GlobeHero: React.FC = () => {
  const { filters, filterParams, setFilter, resetFilter } = useFilterContext();
  const [use3D, setUse3D] = useState<boolean>(true);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [targetRotation, setTargetRotation] = useState<[number, number] | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const [tooltip, setTooltip] = useState<GlobeTooltipState>({
    visible: false,
    x: 0,
    y: 0,
    country: '',
    avgIntensity: 0,
    count: 0,
  });

  // Check WebGL availability and media query for reduced motion
  useEffect(() => {
    const webglOk = isWebGLAvailable();
    setIsSupported(webglOk);
    if (!webglOk) setUse3D(false);

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      }
    }
  }, []);

  // Exclude country from own aggregate query so globe shows all signals
  const chartFilterParams = useMemo(
    () => ({ ...filterParams, country: undefined }),
    [filterParams],
  );

  const { data: aggregateResult, isLoading } = useAggregates(chartFilterParams);

  const rawCountryAggregates: CountryAggregate[] = useMemo(
    () => aggregateResult?.data?.byCountry ?? [],
    [aggregateResult],
  );

  // Compute markers and peak intensity country
  const { markers, leadingCountry, totalMonitored } = useMemo(() => {
    let max = 0;
    let leader: CountryAggregate | null = null;
    const items: MarkerData[] = [];

    for (const item of rawCountryAggregates) {
      if (!item.country || item.country === 'Unspecified') continue;

      if (item.avgIntensity > max) {
        max = item.avgIntensity;
        leader = item;
      }

      const coords = getCountryCoordinates(item.country);
      if (!coords) continue;

      const position = latLngToVector3(coords.lat, coords.lng, GLOBE_RADIUS + 0.02);

      // Color mapping: Amber (#E8944A) for peak signals, Teal (#4FD1C5) for low/med
      let color = '#4FD1C5';
      if (item.avgIntensity >= 25) {
        color = '#E8944A';
      } else if (item.avgIntensity < 10) {
        color = '#38B2AC';
      }

      items.push({
        country: item.country,
        position,
        lat: coords.lat,
        lng: coords.lng,
        avgIntensity: item.avgIntensity,
        count: item.count,
        color,
        isLeading: false,
      });
    }

    if (leader) {
      const found = items.find((m) => m.country.toLowerCase() === leader?.country.toLowerCase());
      if (found) found.isLeading = true;
    }

    return {
      markers: items,
      leadingCountry: leader,
      totalMonitored: items.length,
    };
  }, [rawCountryAggregates]);

  // Set camera target when active country filter changes
  useEffect(() => {
    if (filters.country) {
      const coords = getCountryCoordinates(filters.country);
      if (coords) {
        setTargetRotation([coords.lat, coords.lng]);
      }
    } else {
      setTargetRotation(null);
    }
  }, [filters.country]);

  const handleSelectCountry = useCallback(
    (country: string) => {
      if (filters.country === country) {
        resetFilter('country');
      } else {
        setFilter('country', country);
      }
    },
    [filters.country, setFilter, resetFilter],
  );

  return (
    <div className="relative w-full rounded-xl bg-[#131B2E]/90 border border-[#26314A] shadow-panel overflow-hidden backdrop-blur-md">
      {/* Top Instrument Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#26314A] px-5 py-3.5 bg-[#0E1524]/80">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E8944A]/10 text-[#E8944A] border border-[#E8944A]/25">
            <GlobeIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wide text-[#ECE9E2]">
                Global Signals Radar
              </span>
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium text-[#4FD1C5] bg-[#4FD1C5]/10 border border-[#4FD1C5]/20 tabular-nums">
                {totalMonitored} Nations Monitored
              </span>
            </div>
            <p className="text-[12px] text-[#8B93A7]">
              Interactive 3D geolocated signals. Amber indicates high intensity; teal denotes
              moderate frequency.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {filters.country && (
            <div className="flex items-center gap-1.5 rounded bg-[#E8944A]/15 border border-[#E8944A]/30 px-2.5 py-1 text-xs text-[#E8944A]">
              <span>
                Active: <strong>{filters.country}</strong>
              </span>
              <button
                type="button"
                onClick={() => resetFilter('country')}
                className="ml-1 hover:text-white"
                title="Clear country focus"
              >
                ×
              </button>
            </div>
          )}

          {leadingCountry && (
            <div className="hidden sm:flex items-center gap-1.5 rounded bg-[#1B273F] border border-[#26314A] px-2.5 py-1 text-xs text-[#ECE9E2]">
              <span className="text-[#8B93A7]">Peak Signal:</span>
              <span className="font-medium text-[#E8944A]">{leadingCountry.country}</span>
              <span className="text-[#8B93A7] tabular-nums">
                ({leadingCountry.avgIntensity.toFixed(1)})
              </span>
            </div>
          )}

          {/* Reset Camera View */}
          {use3D && isSupported && (
            <button
              type="button"
              onClick={() => setTargetRotation(null)}
              className="inline-flex items-center gap-1.5 rounded bg-[#18233C] hover:bg-[#1E2C4B] border border-[#26314A] px-2.5 py-1 text-xs text-[#ECE9E2] transition-colors focus-visible:ring-1 focus-visible:ring-[#E8944A]"
              title="Reset Globe Orientation"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#8B93A7]" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}

          {/* 3D / 2D Switcher */}
          {isSupported && (
            <div className="flex rounded bg-[#0B1220] p-0.5 border border-[#26314A]">
              <button
                type="button"
                onClick={() => setUse3D(true)}
                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                  use3D
                    ? 'bg-[#18233C] text-[#ECE9E2] shadow-sm border border-[#26314A]'
                    : 'text-[#8B93A7] hover:text-[#ECE9E2]'
                }`}
              >
                <Compass className="h-3 w-3" />
                3D Globe
              </button>
              <button
                type="button"
                onClick={() => setUse3D(false)}
                className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                  !use3D
                    ? 'bg-[#18233C] text-[#ECE9E2] shadow-sm border border-[#26314A]'
                    : 'text-[#8B93A7] hover:text-[#ECE9E2]'
                }`}
              >
                <GlobeIcon className="h-3 w-3" />
                2D Planar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Visual Canvas Area */}
      <div className="relative h-[440px] w-full bg-[#080D18] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0B1220]/80 z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E8944A] border-t-transparent" />
              <span className="text-xs text-[#8B93A7] tracking-wider">
                CALIBRATING SIGNALS RADAR...
              </span>
            </div>
          </div>
        )}

        {use3D && isSupported ? (
          <div
            data-testid="globe-hero-canvas-container"
            data-mount-count={
              typeof window !== 'undefined' ? window.__globeCanvasMountCount || 1 : 1
            }
            className="relative w-full h-full"
          >
            {markers.length === 0 && (
              <div
                data-testid="chart-empty-state"
                className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center rounded-lg bg-[#0B1220]/80 border border-[#26314A]/80 m-6"
              >
                <div className="w-10 h-10 rounded-full bg-[#18233C] flex items-center justify-center text-[#8B93A7] mb-2 border border-[#26314A]">
                  <FilterX className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-[#ECE9E2]">
                  No data matches these filters
                </p>
                <p className="text-xs text-[#8B93A7] mt-1 max-w-sm">
                  No signals match these filters — clear one to see more.
                </p>
              </div>
            )}
            <Canvas
              camera={{ position: [0, 0, 4.4], fov: 45 }}
              style={{ width: '100%', height: '100%' }}
              gl={{ antialias: true, alpha: true }}
            >
              <GlobeScene
                markers={markers}
                selectedCountry={filters.country}
                onSelectCountry={handleSelectCountry}
                setTooltip={setTooltip}
                targetRotation={targetRotation}
                reducedMotion={reducedMotion}
              />
            </Canvas>
          </div>
        ) : (
          <div className="w-full h-full p-4 overflow-hidden">
            <WorldChoroplethMap />
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-4 z-10 hidden sm:flex items-center gap-4 rounded-md bg-[#0B1220]/85 px-3 py-1.5 border border-[#26314A] text-[11px] text-[#8B93A7] backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E8944A]" />
            <span>High Intensity (&gt;25)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#4FD1C5]" />
            <span>Moderate Signal (&lt;25)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-[#4FD1C5]" />
            <span>Click marker to filter</span>
          </div>
        </div>

        {/* Floating 3D Tooltip */}
        {tooltip.visible && use3D && (
          <div
            className="fixed z-50 pointer-events-none rounded-lg bg-[#0E1626]/95 border border-[#26314A] p-2.5 shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y - 12}px` }}
          >
            <div className="text-xs font-semibold text-[#ECE9E2] mb-1">{tooltip.country}</div>
            <div className="flex items-center gap-3 text-[11px]">
              <div>
                <span className="text-[#8B93A7]">Intensity: </span>
                <span className="font-semibold text-[#E8944A] tabular-nums">
                  {tooltip.avgIntensity.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-[#8B93A7]">Records: </span>
                <span className="font-semibold text-[#4FD1C5] tabular-nums">{tooltip.count}</span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-[#8B93A7] border-t border-[#26314A]/60 pt-1">
              Click marker to focus filter
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
