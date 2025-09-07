import React from "react";
import { getTilePath } from "./getTile";
import { MIN_ZOOM, MAX_ZOOM, getVisibleTileRange, clampOffset } from "./math";
import ZoomControls from "./ZoomControls";
import { useZoom } from "./useZoom";
import { VIEWPORT_SIZE, PAN_DELTA } from "./constants";
import { tilerStyles } from "./styles";

/**
 * Tiler component
 * Responsibilities:
 *  - Keep track of zoom (discrete integer) & pan offset.
 *  - On wheel: change zoom while keeping the cursor point stable in world coords.
 *  - On drag: pan (clamped so empty space is not shown).
 *  - Render ONLY the tiles intersecting the viewport (basic culling).
 *  - Provide keyboard accessibility (arrow keys pan, +/- zoom).
 *  - Expose rich inline comments to explain the math.
 */
const Tiler: React.FC = () => {
  const [isPanning, setIsPanning] = React.useState(false);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);

  // Use the custom zoom hook
  const { zoom, offset, setOffset, zoomByStep } = useZoom({
    initialZoom: 1,
    viewportRef,
  });

  /** Begin panning */
  const handleMouseDown = () => {
    setIsPanning(true);
  };

  /** Pan while dragging */
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isPanning) return;
    setOffset((currentOffset) => {
      const nextOffset = {
        x: currentOffset.x + event.movementX,
        y: currentOffset.y + event.movementY,
      };
      return clampOffset(nextOffset, zoom, VIEWPORT_SIZE);
    });
  };

  const endPan = () => setIsPanning(false);

  /** Handle zoom in button click */
  const handleZoomIn = () => {
    zoomByStep(1); // Zoom in by 1 level, centered on viewport
  };

  /** Handle zoom out button click */
  const handleZoomOut = () => {
    zoomByStep(-1); // Zoom out by 1 level, centered on viewport
  };

  /** Keyboard accessibility */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    console.log(event.key);
    if (event.key === "+" || event.key === "=") {
      zoomByStep(1); // Zoom in, centered on viewport
    } else if (event.key === "-") {
      zoomByStep(-1); // Zoom out, centered on viewport
    } else if (event.key.startsWith("Arrow")) {
      event.preventDefault();
      setOffset((currentOffset) => {
        let nextOffset = currentOffset;
        if (event.key === "ArrowLeft")
          nextOffset = { x: currentOffset.x + PAN_DELTA, y: currentOffset.y };
        if (event.key === "ArrowRight")
          nextOffset = { x: currentOffset.x - PAN_DELTA, y: currentOffset.y };
        if (event.key === "ArrowUp")
          nextOffset = { x: currentOffset.x, y: currentOffset.y + PAN_DELTA };
        if (event.key === "ArrowDown")
          nextOffset = { x: currentOffset.x, y: currentOffset.y - PAN_DELTA };
        return clampOffset(nextOffset, zoom, VIEWPORT_SIZE);
      });
    }
  };

  // Compute which tiles intersect the viewport using current zoom & offset.
  const visibleRange = getVisibleTileRange(
    zoom,
    offset.x,
    offset.y,
    VIEWPORT_SIZE,
    VIEWPORT_SIZE
  );

  const tiles: Array<{ column: number; row: number; key: string }> = [];
  for (
    let column = visibleRange.startCol;
    column <= visibleRange.endCol;
    column++
  ) {
    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      tiles.push({ column, row, key: `${zoom}-${column}-${row}` });
    }
  }

  return (
    <div
      ref={viewportRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endPan}
      onMouseLeave={endPan}
      style={tilerStyles.viewport(isPanning)}
      aria-label="Tiled image viewer"
    >
      {/* World container positioned by current offset */}
      <div
        style={tilerStyles.worldContainer(
          offset.x,
          offset.y,
          visibleRange.worldSize
        )}
        draggable={false}
      >
        {tiles.map(({ column, row, key }) => (
          <img
            key={key}
            src={getTilePath(zoom, column, row)}
            alt={`tile z${zoom} x${column} y${row}`}
            draggable={false}
            style={tilerStyles.tileImage(column, row)}
            onError={(errorEvent) => {
              // Hide missing tiles to avoid broken icon; keeps layout stable.
              errorEvent.currentTarget.style.visibility = "hidden";
            }}
          />
        ))}
      </div>

      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Simple HUD overlay for debugging / learning purposes */}
      <div style={tilerStyles.hudOverlay}>
        z {zoom} | tiles {tiles.length} | offset ({Math.round(offset.x)},{" "}
        {Math.round(offset.y)})
      </div>
    </div>
  );
};

export default Tiler;
