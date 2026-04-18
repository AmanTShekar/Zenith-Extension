"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFramesInSelection = getFramesInSelection;
exports.getSelectedFrameData = getSelectedFrameData;
/**
 * Calculates which frames intersect with a selection rectangle
 * @param editorEngine - The editor engine instance
 * @param dragStart - Start position of drag selection in canvas coordinates
 * @param dragEnd - End position of drag selection in canvas coordinates
 * @param canvasPosition - Current canvas position
 * @param canvasScale - Current canvas scale
 * @returns Array of frame IDs that intersect with the selection rectangle
 */
function getFramesInSelection(editorEngine, dragStart, dragEnd, canvasPosition, canvasScale) {
    const selectionRect = {
        left: Math.min(dragStart.x, dragEnd.x),
        top: Math.min(dragStart.y, dragEnd.y),
        right: Math.max(dragStart.x, dragEnd.x),
        bottom: Math.max(dragStart.y, dragEnd.y),
    };
    // Convert selection rect to canvas coordinates
    const canvasSelectionRect = {
        left: (selectionRect.left - canvasPosition.x) / canvasScale,
        top: (selectionRect.top - canvasPosition.y) / canvasScale,
        right: (selectionRect.right - canvasPosition.x) / canvasScale,
        bottom: (selectionRect.bottom - canvasPosition.y) / canvasScale,
    };
    // Find all frames that intersect with the selection rectangle
    const allFrames = editorEngine.frames.getAll();
    const intersectingFrameIds = [];
    allFrames.forEach(frameData => {
        const frame = frameData.frame;
        const frameLeft = frame.position.x;
        const frameTop = frame.position.y;
        const frameRight = frame.position.x + frame.dimension.width;
        const frameBottom = frame.position.y + frame.dimension.height;
        // Check if frame intersects with selection rectangle
        const intersects = !(frameLeft > canvasSelectionRect.right ||
            frameRight < canvasSelectionRect.left ||
            frameTop > canvasSelectionRect.bottom ||
            frameBottom < canvasSelectionRect.top);
        if (intersects) {
            intersectingFrameIds.push(frame.id);
        }
    });
    return intersectingFrameIds;
}
/**
 * Gets the actual frame objects for intersecting frames (used for final selection)
 * @param editorEngine - The editor engine instance
 * @param dragStart - Start position of drag selection in canvas coordinates
 * @param dragEnd - End position of drag selection in canvas coordinates
 * @param canvasPosition - Current canvas position
 * @param canvasScale - Current canvas scale
 * @returns Array of frame data objects that intersect with the selection rectangle
 */
function getSelectedFrameData(editorEngine, dragStart, dragEnd, canvasPosition, canvasScale) {
    const intersectingFrameIds = getFramesInSelection(editorEngine, dragStart, dragEnd, canvasPosition, canvasScale);
    const allFrames = editorEngine.frames.getAll();
    return allFrames.filter(frameData => intersectingFrameIds.includes(frameData.frame.id));
}
//# sourceMappingURL=selection-utils.js.map