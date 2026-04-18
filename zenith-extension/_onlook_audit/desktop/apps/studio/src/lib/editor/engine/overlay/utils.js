"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelativeOffset = getRelativeOffset;
exports.adaptRectToCanvas = adaptRectToCanvas;
exports.adaptValueToCanvas = adaptValueToCanvas;
exports.getRelativeMousePositionToWebview = getRelativeMousePositionToWebview;
const constants_1 = require("@onlook/models/constants");
/**
 * Calculates the cumulative offset between an element and its ancestor,
 * taking into account CSS transforms and offset positions.
 */
function getRelativeOffset(element, ancestor) {
    let top = 0, left = 0;
    let currentElement = element;
    while (currentElement && currentElement !== ancestor) {
        // Handle CSS transforms
        const transform = window.getComputedStyle(currentElement).transform;
        if (transform && transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            top += matrix.m42; // translateY
            left += matrix.m41; // translateX
        }
        // Add offset positions
        top += currentElement.offsetTop || 0;
        left += currentElement.offsetLeft || 0;
        // Move up to parent
        const offsetParent = currentElement.offsetParent;
        if (!offsetParent || offsetParent === ancestor) {
            break;
        }
        currentElement = offsetParent;
    }
    return { top, left };
}
/**
 * Adapts a rectangle from a webview element to the overlay coordinate space.
 * This ensures that overlay rectangles perfectly match the source elements,
 * similar to design tools like Figma/Framer.
 */
function adaptRectToCanvas(rect, webview, inverse = false) {
    const canvasContainer = document.getElementById(constants_1.EditorAttributes.CANVAS_CONTAINER_ID);
    if (!canvasContainer) {
        console.error('Canvas container not found');
        return rect;
    }
    // Get canvas transform matrix to handle scaling and translation
    const canvasTransform = new DOMMatrix(getComputedStyle(canvasContainer).transform);
    const scale = inverse ? 1 / canvasTransform.a : canvasTransform.a; // Get scale from transform matrix
    // Calculate offsets relative to canvas container
    const sourceOffset = getRelativeOffset(webview, canvasContainer);
    // Transform coordinates to fixed overlay space
    return {
        width: rect.width * scale,
        height: rect.height * scale,
        top: (rect.top + sourceOffset.top + canvasTransform.f / scale) * scale,
        left: (rect.left + sourceOffset.left + canvasTransform.e / scale) * scale,
    };
}
function adaptValueToCanvas(value, inverse = false) {
    const canvasContainer = document.getElementById(constants_1.EditorAttributes.CANVAS_CONTAINER_ID);
    if (!canvasContainer) {
        console.error('Canvas container not found');
        return value;
    }
    const canvasTransform = new DOMMatrix(getComputedStyle(canvasContainer).transform);
    const scale = inverse ? 1 / canvasTransform.a : canvasTransform.a; // Get scale from transform matrix
    return value * scale;
}
/**
 * Get the relative mouse position a webview element inside the canvas container.
 */
function getRelativeMousePositionToWebview(e, webview, inverse = false) {
    const rect = webview.getBoundingClientRect();
    const canvasContainer = document.getElementById(constants_1.EditorAttributes.CANVAS_CONTAINER_ID);
    if (!canvasContainer) {
        console.error('Canvas container not found');
        return rect;
    }
    // Get canvas transform matrix to handle scaling and translation
    const canvasTransform = new DOMMatrix(getComputedStyle(canvasContainer).transform);
    const scale = inverse ? 1 / canvasTransform.a : canvasTransform.a; // Get scale from transform matrix
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
}
//# sourceMappingURL=utils.js.map