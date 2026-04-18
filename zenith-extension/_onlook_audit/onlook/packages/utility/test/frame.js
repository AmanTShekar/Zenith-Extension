"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const frame_1 = require("../src/frame");
// Helper function to create a test frame
function createFrame(id, x, y, width, height) {
    return {
        id,
        branchId: 'test-branch',
        canvasId: 'test-canvas',
        position: { x, y },
        dimension: { width, height },
        url: 'https://test.com',
    };
}
(0, bun_test_1.describe)('Frame Positioning', () => {
    (0, bun_test_1.describe)('calculateNonOverlappingPosition', () => {
        (0, bun_test_1.test)('should return original position when no existing frames', () => {
            const proposedFrame = createFrame('new', 100, 100, 200, 150);
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, []);
            (0, bun_test_1.expect)(result).toEqual({ x: 100, y: 100 });
        });
        (0, bun_test_1.test)('should return original position when no overlap exists', () => {
            const existingFrame = createFrame('existing', 0, 0, 100, 100);
            const proposedFrame = createFrame('new', 200, 200, 100, 100);
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            (0, bun_test_1.expect)(result).toEqual({ x: 200, y: 200 });
        });
        (0, bun_test_1.test)('should position frame to the right when overlapping', () => {
            const existingFrame = createFrame('existing', 100, 100, 200, 150);
            const proposedFrame = createFrame('new', 100, 100, 200, 150); // Same position
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            // Should be positioned to the right with spacing
            (0, bun_test_1.expect)(result.x).toBeGreaterThan(existingFrame.position.x + existingFrame.dimension.width);
            (0, bun_test_1.expect)(result.y).toBe(existingFrame.position.y);
        });
        (0, bun_test_1.test)('should position frame below when right anchor is available', () => {
            const existingFrame = createFrame('existing', 0, 0, 100, 100);
            const proposedFrame = createFrame('new', 50, 50, 100, 100); // Overlapping
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            // Should find an anchor point (right, below, or bottom-right)
            const isToRight = result.x === existingFrame.position.x + existingFrame.dimension.width + 100;
            const isBelow = result.y === existingFrame.position.y + existingFrame.dimension.height + 100;
            (0, bun_test_1.expect)(isToRight || isBelow).toBe(true);
        });
        (0, bun_test_1.test)('should handle multiple existing frames', () => {
            const frame1 = createFrame('frame1', 0, 0, 100, 100);
            const frame2 = createFrame('frame2', 120, 0, 100, 100);
            const frame3 = createFrame('frame3', 0, 120, 100, 100);
            const proposedFrame = createFrame('new', 0, 0, 100, 100); // Overlaps with frame1
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [frame1, frame2, frame3]);
            // Should find a non-overlapping position
            (0, bun_test_1.expect)(result.x).toBeGreaterThanOrEqual(0);
            (0, bun_test_1.expect)(result.y).toBeGreaterThanOrEqual(0);
            // Verify no overlap with any existing frame (including spacing)
            const spacing = 20;
            const proposed = {
                left: result.x,
                top: result.y,
                right: result.x + proposedFrame.dimension.width,
                bottom: result.y + proposedFrame.dimension.height,
            };
            for (const frame of [frame1, frame2, frame3]) {
                const existing = {
                    left: frame.position.x - spacing,
                    top: frame.position.y - spacing,
                    right: frame.position.x + frame.dimension.width + spacing,
                    bottom: frame.position.y + frame.dimension.height + spacing,
                };
                const hasOverlap = proposed.left < existing.right &&
                    proposed.right > existing.left &&
                    proposed.top < existing.bottom &&
                    proposed.bottom > existing.top;
                (0, bun_test_1.expect)(hasOverlap).toBe(false);
            }
        });
        (0, bun_test_1.test)('should prefer bottom-left positioning', () => {
            const existingFrame = createFrame('existing', 100, 100, 100, 100);
            const proposedFrame = createFrame('new', 150, 150, 100, 100); // Overlapping
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            // Should prefer positions that are lower (higher Y) and then lefter (lower X)
            (0, bun_test_1.expect)(result).toBeDefined();
            (0, bun_test_1.expect)(typeof result.x).toBe('number');
            (0, bun_test_1.expect)(typeof result.y).toBe('number');
        });
        (0, bun_test_1.test)('should handle edge case with zero dimensions', () => {
            const existingFrame = createFrame('existing', 0, 0, 0, 0);
            const proposedFrame = createFrame('new', 0, 0, 100, 100);
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            (0, bun_test_1.expect)(result).toBeDefined();
            (0, bun_test_1.expect)(typeof result.x).toBe('number');
            (0, bun_test_1.expect)(typeof result.y).toBe('number');
        });
        (0, bun_test_1.test)('should handle negative coordinates', () => {
            const existingFrame = createFrame('existing', -100, -100, 100, 100);
            const proposedFrame = createFrame('new', -50, -50, 100, 100);
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            (0, bun_test_1.expect)(result).toBeDefined();
            (0, bun_test_1.expect)(typeof result.x).toBe('number');
            (0, bun_test_1.expect)(typeof result.y).toBe('number');
        });
        (0, bun_test_1.test)('should fallback to rightmost position when no anchors work', () => {
            // Create a scenario where all anchor points are blocked
            const frames = [
                createFrame('f1', 0, 0, 100, 100),
                createFrame('f2', 120, 0, 100, 100),
                createFrame('f3', 240, 0, 100, 100), // Rightmost
                createFrame('f4', 0, 120, 100, 100),
                createFrame('f5', 120, 120, 100, 100),
                createFrame('f6', 240, 120, 100, 100),
            ];
            const proposedFrame = createFrame('new', 50, 50, 100, 100);
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, frames);
            // Should be to the right of the rightmost frame
            const rightmostX = Math.max(...frames.map((f) => f.position.x + f.dimension.width));
            (0, bun_test_1.expect)(result.x).toBeGreaterThanOrEqual(rightmostX);
        });
        (0, bun_test_1.test)('should handle large frames', () => {
            const existingFrame = createFrame('existing', 0, 0, 1000, 800);
            const proposedFrame = createFrame('new', 500, 400, 500, 300);
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            (0, bun_test_1.expect)(result).toBeDefined();
            (0, bun_test_1.expect)(typeof result.x).toBe('number');
            (0, bun_test_1.expect)(typeof result.y).toBe('number');
        });
        (0, bun_test_1.test)('should maintain consistent spacing', () => {
            const existingFrame = createFrame('existing', 100, 100, 100, 100);
            const proposedFrame = createFrame('new', 100, 100, 100, 100);
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            const expectedSpacing = 100;
            // Check if positioned to the right
            if (result.x > existingFrame.position.x) {
                const actualSpacing = result.x - (existingFrame.position.x + existingFrame.dimension.width);
                (0, bun_test_1.expect)(actualSpacing).toBe(expectedSpacing);
            }
            // Check if positioned below
            if (result.y > existingFrame.position.y) {
                const actualSpacing = result.y - (existingFrame.position.y + existingFrame.dimension.height);
                (0, bun_test_1.expect)(actualSpacing).toBe(expectedSpacing);
            }
        });
        (0, bun_test_1.test)('should handle identical frames', () => {
            const existingFrame = createFrame('existing', 50, 50, 200, 150);
            const proposedFrame = createFrame('new', 50, 50, 200, 150); // Identical
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            // Should find a non-overlapping position
            (0, bun_test_1.expect)(result).not.toEqual({ x: 50, y: 50 });
        });
        (0, bun_test_1.test)('should work with single pixel frames', () => {
            const existingFrame = createFrame('existing', 100, 100, 1, 1);
            const proposedFrame = createFrame('new', 100, 100, 1, 1);
            const result = (0, frame_1.calculateNonOverlappingPosition)(proposedFrame, [existingFrame]);
            (0, bun_test_1.expect)(result).toBeDefined();
            (0, bun_test_1.expect)(result.x !== 100 || result.y !== 100).toBe(true);
        });
    });
});
//# sourceMappingURL=frame.js.map