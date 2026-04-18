"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapManager = void 0;
const mobx_1 = require("mobx");
const types_1 = require("./types");
const SNAP_CONFIG = {
    DEFAULT_THRESHOLD: 12,
    LINE_EXTENSION: 160,
};
class SnapManager {
    editorEngine;
    config = {
        threshold: SNAP_CONFIG.DEFAULT_THRESHOLD,
        enabled: true,
        showGuidelines: true,
    };
    activeSnapLines = [];
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    createSnapBounds(position, dimension) {
        const left = position.x;
        const top = position.y;
        const right = position.x + dimension.width;
        const bottom = position.y + dimension.height;
        const centerX = position.x + dimension.width / 2;
        const centerY = position.y + dimension.height / 2;
        return {
            left,
            top,
            right,
            bottom,
            centerX,
            centerY,
            width: dimension.width,
            height: dimension.height,
        };
    }
    getSnapFrames(excludeFrameId) {
        return this.editorEngine.frames.getAll()
            .filter(frameData => frameData.frame.id !== excludeFrameId)
            .map(frameData => {
            const frame = frameData.frame;
            return {
                id: frame.id,
                position: frame.position,
                dimension: frame.dimension,
                bounds: this.createSnapBounds(frame.position, frame.dimension),
            };
        });
    }
    calculateSnapTarget(dragFrameId, currentPosition, dimension) {
        if (!this.config.enabled) {
            return null;
        }
        const dragBounds = this.createSnapBounds(currentPosition, dimension);
        const otherFrames = this.getSnapFrames(dragFrameId);
        if (otherFrames.length === 0) {
            return null;
        }
        const snapCandidates = [];
        for (const otherFrame of otherFrames) {
            const candidates = this.calculateSnapCandidates(dragBounds, otherFrame);
            snapCandidates.push(...candidates);
        }
        if (snapCandidates.length === 0) {
            return null;
        }
        snapCandidates.sort((a, b) => a.distance - b.distance);
        const bestCandidate = snapCandidates[0];
        if (!bestCandidate || bestCandidate.distance > this.config.threshold) {
            return null;
        }
        const firstLine = bestCandidate.lines[0];
        if (!firstLine) {
            return null;
        }
        return {
            position: bestCandidate.position,
            snapLines: [firstLine],
            distance: bestCandidate.distance,
        };
    }
    calculateSnapCandidates(dragBounds, otherFrame) {
        const candidates = [];
        const edgeAlignments = [
            {
                type: types_1.SnapLineType.EDGE_LEFT,
                dragOffset: dragBounds.left,
                targetValue: otherFrame.bounds.left,
                orientation: 'vertical',
            },
            {
                type: types_1.SnapLineType.EDGE_LEFT,
                dragOffset: dragBounds.right,
                targetValue: otherFrame.bounds.left,
                orientation: 'vertical',
            },
            {
                type: types_1.SnapLineType.EDGE_RIGHT,
                dragOffset: dragBounds.left,
                targetValue: otherFrame.bounds.right,
                orientation: 'vertical',
            },
            {
                type: types_1.SnapLineType.EDGE_RIGHT,
                dragOffset: dragBounds.right,
                targetValue: otherFrame.bounds.right,
                orientation: 'vertical',
            },
            {
                type: types_1.SnapLineType.EDGE_TOP,
                dragOffset: dragBounds.top,
                targetValue: otherFrame.bounds.top,
                orientation: 'horizontal',
            },
            {
                type: types_1.SnapLineType.EDGE_TOP,
                dragOffset: dragBounds.bottom,
                targetValue: otherFrame.bounds.top,
                orientation: 'horizontal',
            },
            {
                type: types_1.SnapLineType.EDGE_BOTTOM,
                dragOffset: dragBounds.top,
                targetValue: otherFrame.bounds.bottom,
                orientation: 'horizontal',
            },
            {
                type: types_1.SnapLineType.EDGE_BOTTOM,
                dragOffset: dragBounds.bottom,
                targetValue: otherFrame.bounds.bottom,
                orientation: 'horizontal',
            },
            {
                type: types_1.SnapLineType.CENTER_HORIZONTAL,
                dragOffset: dragBounds.centerY,
                targetValue: otherFrame.bounds.centerY,
                orientation: 'horizontal',
            },
            {
                type: types_1.SnapLineType.CENTER_VERTICAL,
                dragOffset: dragBounds.centerX,
                targetValue: otherFrame.bounds.centerX,
                orientation: 'vertical',
            },
        ];
        for (const alignment of edgeAlignments) {
            const distance = Math.abs(alignment.dragOffset - alignment.targetValue);
            if (distance <= this.config.threshold) {
                const offset = alignment.targetValue - alignment.dragOffset;
                const newPosition = alignment.orientation === 'horizontal'
                    ? { x: dragBounds.left, y: dragBounds.top + offset }
                    : { x: dragBounds.left + offset, y: dragBounds.top };
                const snapLine = this.createSnapLine(alignment.type, alignment.orientation, alignment.targetValue, otherFrame, dragBounds);
                candidates.push({
                    position: newPosition,
                    lines: [snapLine],
                    distance,
                });
            }
        }
        return candidates;
    }
    createSnapLine(type, orientation, position, otherFrame, dragBounds) {
        let start;
        let end;
        if (orientation === 'horizontal') {
            start = Math.min(dragBounds.left, otherFrame.bounds.left) - SNAP_CONFIG.LINE_EXTENSION;
            end = Math.max(dragBounds.right, otherFrame.bounds.right) + SNAP_CONFIG.LINE_EXTENSION;
        }
        else {
            start = Math.min(dragBounds.top, otherFrame.bounds.top) - SNAP_CONFIG.LINE_EXTENSION;
            end = Math.max(dragBounds.bottom, otherFrame.bounds.bottom) + SNAP_CONFIG.LINE_EXTENSION;
        }
        return {
            id: `${type}-${otherFrame.id}-${Date.now()}`,
            type,
            orientation,
            position,
            start,
            end,
            frameIds: [otherFrame.id],
        };
    }
    showSnapLines(lines) {
        if (!this.config.showGuidelines) {
            return;
        }
        this.activeSnapLines = lines;
    }
    hideSnapLines() {
        this.activeSnapLines = [];
    }
    setConfig(config) {
        Object.assign(this.config, config);
    }
}
exports.SnapManager = SnapManager;
//# sourceMappingURL=index.js.map