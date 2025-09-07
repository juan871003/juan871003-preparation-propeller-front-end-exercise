import {
  tilesPerSide,
  getVisibleTileRange,
  clampOffset,
  worldSizePx,
} from "./math";

// Basic unit tests for the pure math helpers. These validate the core tiling math
// without involving React rendering.

describe("tilesPerSide", () => {
  it("doubles each level", () => {
    expect(tilesPerSide(0)).toBe(1);
    expect(tilesPerSide(1)).toBe(2);
    expect(tilesPerSide(2)).toBe(4);
    expect(tilesPerSide(3)).toBe(8);
  });
});

describe("getVisibleTileRange", () => {
  it("computes visible range at origin", () => {
    const vr = getVisibleTileRange(2, 0, 0, 400, 400); // zoom 2 => 4x4 tiles
    expect(vr.startCol).toBe(0);
    expect(vr.startRow).toBe(0);
    // 400px viewport shows at most 2 tiles of 256px fully (indexes 0 & 1), partially 2 -> floor picks 1.
    expect(vr.endCol).toBe(1);
    expect(vr.endRow).toBe(1);
  });

  it("computes correct range near bottom-right", () => {
    const size = worldSizePx(2); // 4 * 256 = 1024
    const offset = -(size - 400); // maximum pan to show bottom-right corner
    const vr = getVisibleTileRange(2, offset, offset, 400, 400);
    // Last two tiles should be visible (indices 2 & 3) -> end index clamped to 3
    expect(vr.startCol).toBe(2);
    expect(vr.endCol).toBe(3);
    expect(vr.startRow).toBe(2);
    expect(vr.endRow).toBe(3);
  });
});

describe("clampOffset", () => {
  it("clamps so we cannot pan beyond world", () => {
    // Zoom 1 => 2 * 256 = 512 world size
    // With 400 viewport, max negative offset = -(512-400) = -112
    const clampedLeft = clampOffset({ x: -5000, y: -5000 }, 1, 400);
    expect(clampedLeft.x).toBe(-112);
    expect(clampedLeft.y).toBe(-112);

    const clampedRight = clampOffset({ x: 999, y: 999 }, 1, 400);
    expect(clampedRight.x).toBe(0);
    expect(clampedRight.y).toBe(0);
  });
});
