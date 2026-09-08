/// <reference types="vite/client" />

interface Window {
  __CANVAS_MOUNTS__?: { globe: number; sector: number };
  __globeCanvasMountCount?: number;
  __sectorCanvasMountCount?: number;
}
