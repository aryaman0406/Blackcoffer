import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFilterContext } from '../context/index.js';
import { useAggregates } from '../hooks/index.js';
import type { SectorAggregate } from '../types/index.js';
import { isWebGLAvailable } from '../utils/index.js';
import { SectorRelevanceBarChart } from './SectorRelevanceBarChart.js';

interface BarData {
  sector: string;
  count: number;
  avgRelevance: number;
  avgIntensity: number;
  height: number;
  targetHeight: number;
  x: number;
  z: number;
}

interface SectorTooltipState {
  visible: boolean;
  x: number;
  y: number;
  sector: string;
  count: number;
  avgRelevance: number;
}

// Single Extruded 3D Bar
const SectorExtrudedBar: React.FC<{
  data: BarData;
  isSelected: boolean;
  isDimmed: boolean;
  maxHeight: number;
  onHover: (data: BarData | null, clientX?: number, clientY?: number) => void;
  onClick: (data: BarData) => void;
}> = ({ data, isSelected, isDimmed, onHover, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const currentHeightRef = useRef<number>(data.height);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Smooth lerp transition for height changes
    currentHeightRef.current = THREE.MathUtils.lerp(
      currentHeightRef.current,
      data.targetHeight,
      delta * 5,
    );

    const h = Math.max(0.08, currentHeightRef.current);
    meshRef.current.scale.set(0.7, h, 0.7);
    meshRef.current.position.y = h / 2;
  });

  const barColor = useMemo(() => {
    if (isSelected) return '#E8944A';
    if (hovered) return '#FFFFFF';
    return '#4FD1C5';
  }, [isSelected, hovered]);

  const opacity = isDimmed ? 0.25 : isSelected || hovered ? 1.0 : 0.85;

  return (
    <group position={[data.x, 0, data.z]}>
      {/* Top glowing cap */}
      {(isSelected || hovered) && (
        <mesh position={[0, Math.max(0.1, currentHeightRef.current) + 0.01, 0]}>
          <boxGeometry args={[0.74, 0.04, 0.74]} />
          <meshBasicMaterial
            color={isSelected ? '#E8944A' : '#4FD1C5'}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}

      {/* Main Extruded Bar Body */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(data, e.clientX, e.clientY);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(data);
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={barColor}
          emissive={barColor}
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : 0.15}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

// 3D Scene containing the plane and the extruded bars
const SectorGridScene: React.FC<{
  sectors: BarData[];
  selectedSector?: string;
  onSelectSector: (sector: string) => void;
  setTooltip: React.Dispatch<React.SetStateAction<SectorTooltipState>>;
}> = ({ sectors, selectedSector, onSelectSector, setTooltip }) => {
  const handleHover = useCallback(
    (data: BarData | null, clientX?: number, clientY?: number) => {
      if (!data || clientX === undefined || clientY === undefined) {
        setTooltip((prev) => ({ ...prev, visible: false }));
        return;
      }
      setTooltip({
        visible: true,
        x: clientX,
        y: clientY,
        sector: data.sector,
        count: data.count,
        avgRelevance: data.avgRelevance,
      });
    },
    [setTooltip],
  );

  const handleClick = useCallback(
    (data: BarData) => {
      onSelectSector(data.sector);
    },
    [onSelectSector],
  );

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} />
      <directionalLight position={[-10, 10, -10]} intensity={0.4} color="#4FD1C5" />

      {/* Base Grid Plane */}
      <group position={[0, -0.01, 0]}>
        <gridHelper
          args={[14, 14, '#4FD1C5', '#1B273F']}
          position={[0, 0, 0]}
        />
      </group>

      {/* Bars Grid */}
      <group position={[0, 0, 0]}>
        {sectors.map((bar) => {
          const isSelected =
            selectedSector !== undefined &&
            selectedSector.toLowerCase() === bar.sector.toLowerCase();
          const isDimmed = selectedSector !== undefined && !isSelected;

          return (
            <SectorExtrudedBar
              key={`sector-bar-${bar.sector}`}
              data={bar}
              isSelected={isSelected}
              isDimmed={isDimmed}
              maxHeight={3}
              onHover={handleHover}
              onClick={handleClick}
            />
          );
        })}
      </group>

      <OrbitControls
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={6}
        maxDistance={14}
      />
    </>
  );
};

export const SectorBarGrid3D: React.FC = () => {
  const { filters, filterParams, setFilter, resetFilter } = useFilterContext();
  const [use3D, setUse3D] = useState<boolean>(true);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const [tooltip, setTooltip] = useState<SectorTooltipState>({
    visible: false,
    x: 0,
    y: 0,
    sector: '',
    count: 0,
    avgRelevance: 0,
  });

  useEffect(() => {
    const ok = isWebGLAvailable();
    setIsSupported(ok);
    if (!ok) setUse3D(false);
  }, []);

  // Exclude sector from own aggregate query so comparison shows all sectors
  const chartFilterParams = useMemo(
    () => ({ ...filterParams, sector: undefined }),
    [filterParams],
  );

  const { data: aggregateResult, isLoading } = useAggregates(chartFilterParams);

  const rawSectors: SectorAggregate[] = useMemo(
    () => aggregateResult?.data?.bySector ?? [],
    [aggregateResult],
  );

  // Compute 3D grid layout coordinates
  const barData = useMemo(() => {
    const valid = rawSectors.filter((s) => s.sector && s.sector !== 'Unspecified');
    const sorted = [...valid].sort((a, b) => b.count - a.count).slice(0, 16);

    const max = sorted.length > 0 ? Math.max(...sorted.map((s) => s.count)) : 1;
    const cols = 4;
    const spacing = 1.6;

    const bars: BarData[] = sorted.map((s, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const x = (col - (cols - 1) / 2) * spacing;
      const z = (row - (Math.ceil(sorted.length / cols) - 1) / 2) * spacing;
      const targetHeight = Math.max(0.2, (s.count / max) * 2.8);

      return {
        sector: s.sector,
        count: s.count,
        avgRelevance: s.avgRelevance,
        avgIntensity: s.avgIntensity,
        height: 0.1,
        targetHeight,
        x,
        z,
      };
    });

    return bars;
  }, [rawSectors]);

  const handleSelectSector = useCallback(
    (sector: string) => {
      if (filters.sector === sector) {
        resetFilter('sector');
      } else {
        setFilter('sector', sector);
      }
    },
    [filters.sector, setFilter, resetFilter],
  );

  return (
    <div className="relative w-full h-full rounded-xl bg-[#131B2E]/90 border border-[#26314A] shadow-panel overflow-hidden backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#26314A] px-4 py-3 bg-[#0E1524]/80">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#4FD1C5]/10 text-[#4FD1C5] border border-[#4FD1C5]/20">
            <Box className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wide text-[#ECE9E2]">
              Sector Volume Matrix
            </span>
            <span className="ml-2 text-[11px] text-[#8B93A7] tabular-nums">
              ({barData.length} active sectors)
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {filters.sector && (
            <div className="flex items-center gap-1 rounded bg-[#E8944A]/15 border border-[#E8944A]/30 px-2 py-0.5 text-[11px] text-[#E8944A]">
              <span>Active: {filters.sector}</span>
              <button
                type="button"
                onClick={() => resetFilter('sector')}
                className="hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          {isSupported && (
            <div className="flex rounded bg-[#0B1220] p-0.5 border border-[#26314A]">
              <button
                type="button"
                onClick={() => setUse3D(true)}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                  use3D
                    ? 'bg-[#18233C] text-[#ECE9E2] border border-[#26314A]'
                    : 'text-[#8B93A7] hover:text-[#ECE9E2]'
                }`}
              >
                3D Grid
              </button>
              <button
                type="button"
                onClick={() => setUse3D(false)}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                  !use3D
                    ? 'bg-[#18233C] text-[#ECE9E2] border border-[#26314A]'
                    : 'text-[#8B93A7] hover:text-[#ECE9E2]'
                }`}
              >
                2D Chart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visual Canvas Area */}
      <div className="relative flex-1 min-h-[300px] w-full bg-[#080D18] flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0B1220]/75 z-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4FD1C5] border-t-transparent" />
          </div>
        )}

        {use3D && isSupported ? (
          <Canvas
            camera={{ position: [5, 6, 7], fov: 38 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
          >
            <SectorGridScene
              sectors={barData}
              selectedSector={filters.sector}
              onSelectSector={handleSelectSector}
              setTooltip={setTooltip}
            />
          </Canvas>
        ) : (
          <div className="w-full h-full p-2">
            <SectorRelevanceBarChart />
          </div>
        )}

        {/* Tooltip Overlay */}
        {tooltip.visible && use3D && (
          <div
            className="fixed z-50 pointer-events-none rounded-lg bg-[#0E1626]/95 border border-[#26314A] p-2.5 shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y - 10}px` }}
          >
            <div className="text-xs font-semibold text-[#ECE9E2] mb-1">{tooltip.sector}</div>
            <div className="flex items-center gap-3 text-[11px]">
              <div>
                <span className="text-[#8B93A7]">Signals: </span>
                <span className="font-semibold text-[#4FD1C5] tabular-nums">
                  {tooltip.count}
                </span>
              </div>
              <div>
                <span className="text-[#8B93A7]">Relevance: </span>
                <span className="font-semibold text-[#E8944A] tabular-nums">
                  {tooltip.avgRelevance.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="mt-1 text-[10px] text-[#8B93A7] border-t border-[#26314A]/60 pt-1">
              Click column to cross-filter
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
