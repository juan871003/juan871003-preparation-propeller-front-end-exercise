import React from "react";
import { getTilePath } from "./getTile";

const MAX_ZOOM = 3;
const VIEWPORT_SIZE = 400;
const TILE_SIZE = 256;

const Tiler: React.FC = () => {
  const [zoom, setZoom] = React.useState(1);
  const [isPanning, setPanning] = React.useState(false);
  const [origin, setOrigin] = React.useState([0, 0]);

  const handleScroll = (event: React.WheelEvent<HTMLDivElement>) => {
    const isZoomingIn = event.deltaY > -1;
    if (isZoomingIn && zoom !== MAX_ZOOM) {
      setZoom((zoom) => zoom + 1);
    }
    if (!isZoomingIn && zoom !== 0) {
      setZoom((zoom) => zoom - 1);
    }
  };

  const onPan = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isPanning) {
      return;
    }

    function clamp(value: number, min: number, max: number) {
      return Math.min(Math.max(value, min), max);
    }

    setOrigin(([originX, originY]) => {
      const tileWidth = TILE_SIZE * Math.pow(2, zoom);
      const isTileSmallerThanViewport = tileWidth < VIEWPORT_SIZE;
      if (isTileSmallerThanViewport) {
        const newOriginX = originX + event.movementX;
        const newOriginY = originY + event.movementY;
        const maxTileX = VIEWPORT_SIZE - tileWidth;
        const maxTileY = VIEWPORT_SIZE - tileWidth;
        const newOriginXClamped = clamp(newOriginX, 0, maxTileX);
        const newOriginYClamped = clamp(newOriginY, 0, maxTileY);
        return [newOriginXClamped, newOriginYClamped];
      }
      return [originX, originY];
    });
  };

  const rowsAndCols = [...Array(zoom + 1)].map((_, i) => i);

  return (
    <>
      <div
        style={{
          width: VIEWPORT_SIZE,
          height: VIEWPORT_SIZE,
          background: "#0009",
          overflow: "hidden",
        }}
        onMouseDown={() => setPanning(true)}
        onMouseUp={() => setPanning(false)}
        onMouseMove={onPan}
        onMouseLeave={() => setPanning(false)}
      >
        <div
          onWheel={handleScroll}
          style={{
            display: "flex",
            flexDirection: "row",
            position: "relative",
            left: origin[0],
            top: origin[1],
          }}
          draggable={false}
        >
          {rowsAndCols.map((col) => (
            <div
              draggable={false}
              style={{ display: "flex", flexDirection: "column" }}
            >
              {rowsAndCols.map((row) => (
                <img
                  draggable={false}
                  src={getTilePath(zoom, col, row)}
                  alt="1"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div>
        Zoom: {zoom}, Origin: {origin[0]}, {origin[1]}
      </div>
    </>
  );
};

export default Tiler;
