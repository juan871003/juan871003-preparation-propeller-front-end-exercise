import { useState, useEffect, useCallback } from "react";
import {
  MIN_ZOOM,
  MAX_ZOOM,
  tilesPerSide,
  clampOffset,
  wheelDeltaToZoomStep,
} from "./math";
import { VIEWPORT_SIZE } from "./constants";

interface UseZoomProps {
  initialZoom?: number;
  viewportRef?: React.RefObject<HTMLDivElement>; // Optional ref to the viewport element
}

interface ZoomOptions {
  /** X coordinate within viewport where zoom should be centered */
  centerX?: number;
  /** Y coordinate within viewport where zoom should be centered */
  centerY?: number;
}

interface UseZoomReturn {
  zoom: number;
  offset: { x: number; y: number };
  setOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  /** Zoom to a specific level with optional center point */
  zoomTo: (newZoom: number, options?: ZoomOptions) => void;
  /** Zoom in by one level */
  zoomIn: (options?: ZoomOptions) => void;
  /** Zoom out by one level */
  zoomOut: (options?: ZoomOptions) => void;
  /** Zoom by a step amount (+1 for in, -1 for out) */
  zoomByStep: (step: number, options?: ZoomOptions) => void;
}

/**
 * Custom hook that manages zoom state and provides zoom functionality.
 * Encapsulates the complex cursor-centered zoom logic so it can be reused
 * across different input methods (wheel, buttons, keyboard).
 */
export function useZoom({
  initialZoom = 1,
  viewportRef,
}: UseZoomProps): UseZoomReturn {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Re-clamp offset whenever zoom changes (world size changes).
  useEffect(() => {
    setOffset((currentOffset) =>
      clampOffset(currentOffset, zoom, VIEWPORT_SIZE)
    );
  }, [zoom]);

  /**
   * Core zoom function that handles cursor-centered zooming.
   * @param newZoom - Target zoom level
   * @param options - Optional center point for zoom
   */
  const zoomTo = useCallback(
    (newZoom: number, options: ZoomOptions = {}) => {
      // Clamp to valid zoom range
      const clampedZoom = Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
      if (clampedZoom === zoom) return; // No change needed

      const {
        centerX = VIEWPORT_SIZE / 2, // Default to center of viewport
        centerY = VIEWPORT_SIZE / 2,
      } = options;

      // Convert center point to world coordinates (before zoom change).
      const worldXBefore = -offset.x + centerX;
      const worldYBefore = -offset.y + centerY;

      // Calculate scale factor between old and new zoom levels
      const scale = tilesPerSide(clampedZoom) / tilesPerSide(zoom);
      const worldXAfter = worldXBefore * scale;
      const worldYAfter = worldYBefore * scale;

      // Calculate new offset to keep the center point stable
      let newOffset = {
        x: centerX - worldXAfter,
        y: centerY - worldYAfter,
      };

      // Clamp the new offset to valid bounds
      newOffset = clampOffset(newOffset, clampedZoom, VIEWPORT_SIZE);

      setZoom(clampedZoom);
      setOffset(newOffset);
    },
    [zoom, offset]
  );

  /**
   * Zoom by a step amount (+1 for zoom in, -1 for zoom out)
   */
  const zoomByStep = useCallback(
    (step: number, options?: ZoomOptions) => {
      const newZoom = zoom + step;
      zoomTo(newZoom, options);
    },
    [zoom, zoomTo]
  );

  // Native wheel event listener to prevent passive event issues
  useEffect(() => {
    const viewport = viewportRef?.current;
    if (!viewport) return;

    const handleWheelNative = (event: WheelEvent) => {
      event.preventDefault(); // This will work with passive: false
      const step = wheelDeltaToZoomStep(event.deltaY);
      if (step === 0) return;

      const rect = viewport.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;

      zoomByStep(step, { centerX: cursorX, centerY: cursorY });
    };

    // Register with { passive: false } to allow preventDefault
    viewport.addEventListener("wheel", handleWheelNative, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", handleWheelNative);
    };
  }, [zoomByStep]);

  /**
   * Zoom in by one level
   */
  const zoomIn = useCallback(
    (options?: ZoomOptions) => {
      zoomByStep(1, options);
    },
    [zoomByStep]
  );

  /**
   * Zoom out by one level
   */
  const zoomOut = useCallback(
    (options?: ZoomOptions) => {
      zoomByStep(-1, options);
    },
    [zoomByStep]
  );

  return {
    zoom,
    offset,
    setOffset,
    zoomTo,
    zoomIn,
    zoomOut,
    zoomByStep,
  };
}
