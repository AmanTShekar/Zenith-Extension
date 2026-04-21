export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapResult {
  x: number;
  y: number;
  guides: {
    x: number[];
    y: number[];
  };
}

const SNAP_THRESHOLD = 10;

/**
 * Snapping engine for Zenith.
 * @param rect The candidate rectangle
 * @param targets Other rectangles in the scene
 * @param excludeId ID to exclude from snapping
 * @param activeEdges Optional bitmask or list of edges to snap. 0=left, 1=center, 2=right
 */
export function getSnapping(
  rect: Rect,
  targets: Array<{ id: string; rect: Rect }>,
  excludeId: string | null,
  activeEdges?: { x?: number[], y?: number[] }
): SnapResult {
  const result: SnapResult = {
    x: rect.x,
    y: rect.y,
    guides: { x: [], y: [] }
  };

  const currentEdges = {
    x: [rect.x, rect.x + rect.width / 2, rect.x + rect.width],
    y: [rect.y, rect.y + rect.height / 2, rect.y + rect.height]
  };

  // Filter edges if requested (e.g. for resizing specific handles)
  const xEdgesToSnap = activeEdges?.x ?? [0, 1, 2];
  const yEdgesToSnap = activeEdges?.y ?? [0, 1, 2];

  let minDiffX = SNAP_THRESHOLD;
  let minDiffY = SNAP_THRESHOLD;
  let snapX: number | null = null;
  let snapY: number | null = null;

  for (const target of targets) {
    if (target.id === excludeId) continue;

    const t = target.rect;
    const targetEdges = {
      x: [t.x, t.x + t.width / 2, t.x + t.width],
      y: [t.y, t.y + t.height / 2, t.y + t.height]
    };

    // Horizontal Snapping
    for (const i of xEdgesToSnap) {
      for (let j = 0; j < targetEdges.x.length; j++) {
        const diff = Math.abs(currentEdges.x[i] - targetEdges.x[j]);
        if (diff < minDiffX) {
          minDiffX = diff;
          const offset = targetEdges.x[j] - currentEdges.x[i];
          snapX = rect.x + offset;
          result.guides.x = [targetEdges.x[j]];
        } else if (diff < SNAP_THRESHOLD && snapX !== null && Math.abs(diff - minDiffX) < 0.1) {
          result.guides.x.push(targetEdges.x[j]);
        }
      }
    }

    // Vertical Snapping
    for (const i of yEdgesToSnap) {
      for (let j = 0; j < targetEdges.y.length; j++) {
        const diff = Math.abs(currentEdges.y[i] - targetEdges.y[j]);
        if (diff < minDiffY) {
          minDiffY = diff;
          const offset = targetEdges.y[j] - currentEdges.y[i];
          snapY = rect.y + offset;
          result.guides.y = [targetEdges.y[j]];
        } else if (diff < SNAP_THRESHOLD && snapY !== null && Math.abs(diff - minDiffY) < 0.1) {
          result.guides.y.push(targetEdges.y[j]);
        }
      }
    }
  }

  if (snapX !== null) result.x = snapX;
  if (snapY !== null) result.y = snapY;

  return result;
}

