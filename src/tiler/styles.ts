import { CSSProperties } from "react";
import { VIEWPORT_SIZE } from "./constants";
import { TILE_SIZE } from "./math";

// Tiler component styles
export const tilerStyles = {
  /** Main viewport container styles */
  viewport: (isPanning: boolean): CSSProperties => ({
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
    position: "relative",
    background: "#222",
    overflow: "hidden",
    border: "1px solid #444",
    cursor: isPanning ? "grabbing" : "grab",
    userSelect: "none",
    outline: "none",
    fontFamily: "sans-serif",
    margin: "20px auto",
  }),

  /** World container that holds all tiles */
  worldContainer: (
    offsetX: number,
    offsetY: number,
    worldSize: number
  ): CSSProperties => ({
    position: "absolute",
    left: offsetX,
    top: offsetY,
    width: worldSize,
    height: worldSize,
  }),

  /** Individual tile image styles */
  tileImage: (column: number, row: number): CSSProperties => ({
    position: "absolute",
    left: column * TILE_SIZE,
    top: row * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
    imageRendering: "pixelated", // keeps sharp edges when scaling
  }),

  /** HUD overlay for debugging info */
  hudOverlay: {
    position: "absolute",
    bottom: 4,
    left: 6,
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    padding: "2px 6px",
    fontSize: 12,
    borderRadius: 4,
  } as CSSProperties,
};
