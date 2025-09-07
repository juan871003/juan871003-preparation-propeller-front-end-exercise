// math.ts
// Centralised tile/map math helpers so they can be unit tested independently
// of the React component. Keeping these pure makes behaviour easier to reason about.

export const TILE_SIZE = 256; // Assumed tile pixel dimension (square). Adjust if your assets differ.
export const MIN_ZOOM = 0; // Smallest zoom folder available.
export const MAX_ZOOM = 3; // Largest zoom folder available (based on provided assets).

/** Number of tiles along one edge for a given zoom level. */
export function tilesPerSide(zoom: number): number {
  // Typical web map scheme doubles tiles each level (power of two quadtree).
  return 2 ** zoom;
}

/** Total pixel size of the square world at a zoom level. */
export function worldSizePx(zoom: number): number {
  return tilesPerSide(zoom) * TILE_SIZE;
}

/** Clamp helper.
 * value: number we want to bound within [min, max].
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface Offset {
  x: number;
  y: number;
}

/**
 * Constrains the world offset so the viewport never shows empty space.
 * Offsets are defined as world-left/top relative to viewport (<= 0, >= negative limit).
 * If the world is smaller than the viewport (not expected here) we centre it.
 */
export function clampOffset(
  offset: Offset,
  zoom: number,
  viewportSize: number
): Offset {
  const size = worldSizePx(zoom);
  const min = -(size - viewportSize);
  if (size <= viewportSize) {
    const centred = (viewportSize - size) / 2;
    return { x: centred, y: centred };
  }
  return {
    x: clamp(offset.x, min, 0),
    y: clamp(offset.y, min, 0),
  };
}

interface VisibleRange {
  startCol: number;
  endCol: number;
  startRow: number;
  endRow: number;
  worldSize: number;
}

/**
 * Computes the inclusive range of tile indices that intersect the viewport.
 * offsetX/offsetY: world position relative to viewport (negative when panned left/up).
 */
export function getVisibleTileRange(
  zoom: number,
  offsetX: number,
  offsetY: number,
  viewportW: number,
  viewportH: number
): VisibleRange {
  const tps = tilesPerSide(zoom);
  const size = worldSizePx(zoom);

  const startCol = Math.floor(-offsetX / TILE_SIZE);
  const startRow = Math.floor(-offsetY / TILE_SIZE);
  const endCol = Math.floor((-offsetX + viewportW - 1) / TILE_SIZE);
  const endRow = Math.floor((-offsetY + viewportH - 1) / TILE_SIZE);

  return {
    startCol: clamp(startCol, 0, tps - 1),
    startRow: clamp(startRow, 0, tps - 1),
    endCol: clamp(endCol, 0, tps - 1),
    endRow: clamp(endRow, 0, tps - 1),
    worldSize: size,
  };
}

/**
 * Given a mouse wheel delta, returns +1 zoom step (in) or -1 (out) respecting sign convention.
 * Browsers produce negative deltaY for scrolling up (wheel away) which we interpret as zoom in.
 */
export function wheelDeltaToZoomStep(deltaY: number): number {
  console.log("deltaY", deltaY);
  // if (deltaY === 0) return 0;
  if (deltaY < -1) return 1; // Zoom in
  if (deltaY > 1) return -1; // Zoom out
  return 0;
  // return deltaY < 5 ? 1 : -1;
}
