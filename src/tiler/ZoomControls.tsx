import React from "react";

interface ZoomControlsProps {
  /** Current zoom level */
  zoom: number;
  /** Minimum allowed zoom level */
  minZoom: number;
  /** Maximum allowed zoom level */
  maxZoom: number;
  /** Callback when zoom in button is clicked */
  onZoomIn: () => void;
  /** Callback when zoom out button is clicked */
  onZoomOut: () => void;
}

/**
 * Isolated zoom control buttons component
 * Provides + and - buttons for zooming in and out
 */
const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
}) => {
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  const buttonBaseStyle = {
    width: 32,
    height: 32,
    border: "1px solid #666",
    borderRadius: 4,
    fontSize: 16,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
  } as const;

  const getButtonStyle = (enabled: boolean) => ({
    ...buttonBaseStyle,
    background: enabled ? "#555" : "#333",
    color: enabled ? "#fff" : "#666",
    cursor: enabled ? "pointer" : "not-allowed",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        style={getButtonStyle(canZoomIn)}
        title="Zoom in (+)"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        style={getButtonStyle(canZoomOut)}
        title="Zoom out (-)"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
};

export default ZoomControls;
