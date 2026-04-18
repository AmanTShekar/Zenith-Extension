"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveManager = void 0;
const mobx_1 = require("mobx");
var DragState;
(function (DragState) {
    DragState["PREPARING"] = "preparing";
    DragState["IN_PROGRESS"] = "in_progress";
})(DragState || (DragState = {}));
class MoveManager {
    editorEngine;
    state = null;
    MIN_DRAG_DISTANCE = 10;
    MIN_DRAG_PREPARATION_TIME = 150;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    get shouldDrag() {
        return this.state !== null && this.state.originalIndex !== null;
    }
    get isPreparing() {
        return this.state?.dragState === DragState.PREPARING;
    }
    get isDragInProgress() {
        return this.state?.dragState === DragState.IN_PROGRESS;
    }
    setDragState(dragState) {
        if (this.state) {
            this.state.dragState = dragState;
        }
    }
    dragPreparationTimer = null;
    startDragPreparation(el, pos, frameData) {
        if (this.dragPreparationTimer) {
            clearTimeout(this.dragPreparationTimer);
        }
        this.state = {
            dragOrigin: pos,
            dragTarget: el,
            originalIndex: null,
            dragState: DragState.PREPARING,
        };
        this.dragPreparationTimer = setTimeout(() => {
            void (async () => {
                if (this.isPreparing) {
                    await this.prepareDrag(el, frameData);
                }
                this.dragPreparationTimer = null;
            })();
        }, this.MIN_DRAG_PREPARATION_TIME);
    }
    cancelDragPreparation() {
        if (this.dragPreparationTimer) {
            clearTimeout(this.dragPreparationTimer);
            this.dragPreparationTimer = null;
        }
        if (this.state?.dragState === DragState.PREPARING) {
            this.clear();
        }
    }
    async prepareDrag(el, frameData) {
        if (!this.state || this.state.dragState !== DragState.PREPARING) {
            console.warn('Cannot prepare drag without preparation state');
            return;
        }
        if (!this.editorEngine.elements.selected.some((selected) => selected.domId === el.domId)) {
            console.warn('Element not selected, cannot start drag');
            this.clear();
            return;
        }
        const positionType = el.styles?.computed?.position;
        if (positionType === 'absolute') {
            console.warn('Absolute mode dragging is disabled');
            this.clear();
            return;
        }
        if (!frameData.view) {
            console.error('No frame view found');
            this.clear();
            return;
        }
        const originalIndex = await frameData.view.startDrag(el.domId);
        if (originalIndex === null || originalIndex === -1) {
            console.error('Element not found in frame');
            this.clear();
            return;
        }
        this.state.originalIndex = originalIndex;
    }
    async drag(e, getRelativeMousePositionToWebview) {
        if (!this.state) {
            return;
        }
        const frameData = this.editorEngine.frames.get(this.state.dragTarget.frameId);
        if (!frameData?.view) {
            console.error('No frameView found for drag');
            return;
        }
        const { x, y } = getRelativeMousePositionToWebview(e);
        const dx = x - this.state.dragOrigin.x;
        const dy = y - this.state.dragOrigin.y;
        if (!this.isDragInProgress) {
            const distance = Math.max(Math.abs(dx), Math.abs(dy));
            if (distance < this.MIN_DRAG_DISTANCE) {
                return;
            }
            this.setDragState(DragState.IN_PROGRESS);
        }
        try {
            this.editorEngine.overlay.clearUI();
            const positionType = this.state.dragTarget.styles?.computed?.position;
            if (positionType === 'absolute') {
                await frameData.view.dragAbsolute(this.state.dragTarget.domId, x, y, this.state.dragOrigin);
            }
            else {
                await frameData.view.drag(this.state.dragTarget.domId, dx, dy, x, y);
            }
        }
        catch (error) {
            console.error('Error during drag:', error);
        }
    }
    async end(_e) {
        if (!this.state) {
            console.warn('No drag state to end');
            return;
        }
        const savedState = this.state;
        this.clear();
        if (savedState?.dragState !== DragState.IN_PROGRESS) {
            console.warn('Drag was not in progress, ending early');
            await this.endAllDrag();
            return;
        }
        const frameData = this.editorEngine.frames.get(savedState.dragTarget.frameId);
        if (!frameData?.view) {
            console.error('No frameView found for drag end');
            await this.endAllDrag();
            return;
        }
        try {
            const targetDomId = savedState.dragTarget.domId;
            // Handle absolute positioning
            const position = savedState.dragTarget.styles?.computed?.position;
            if (position === 'absolute') {
                const res = await frameData.view.endDragAbsolute(targetDomId);
                if (res) {
                    const { left, top } = res;
                    this.editorEngine.style.updateMultiple({
                        left: left,
                        top: top,
                        transform: 'none',
                    });
                }
            }
            else {
                // Handle regular drag with index changes
                const res = await frameData.view.endDrag(targetDomId);
                if (res && savedState.originalIndex !== null) {
                    const { child, parent, newIndex } = res;
                    if (newIndex !== savedState.originalIndex) {
                        const moveAction = this.createMoveAction(frameData.frame.id, child, parent, newIndex, savedState.originalIndex);
                        await this.editorEngine.action.run(moveAction);
                    }
                }
            }
        }
        catch (error) {
            console.error('Error ending drag:', error);
        }
        finally {
            this.clear();
        }
    }
    async endAllDrag() {
        const promises = [];
        this.editorEngine.frames.getAll().forEach((frameData) => {
            try {
                if (!frameData.view) {
                    console.error('No frame view found');
                    return;
                }
                const promise = frameData.view.endAllDrag();
                promises.push(promise);
            }
            catch (error) {
                console.error('Error in endAllDrag:', error);
            }
        });
        await Promise.all(promises);
    }
    async moveSelected(direction) {
        const selected = this.editorEngine.elements.selected;
        if (selected.length === 1 && selected[0]) {
            await this.shiftElement(selected[0], direction);
        }
        else {
            if (selected.length > 1) {
                console.error('Multiple elements selected, cannot shift');
            }
            else {
                console.error('No elements selected, cannot shift');
            }
        }
    }
    async shiftElement(element, direction) {
        const frameData = this.editorEngine.frames.get(element.frameId);
        if (!frameData?.view) {
            return;
        }
        try {
            // Get current index and parent
            const currentIndex = await frameData.view.getElementIndex(element.domId);
            if (currentIndex === -1) {
                return;
            }
            const parent = await frameData.view.getParentElement(element.domId);
            if (!parent) {
                return;
            }
            // Get filtered children count for accurate index calculation
            const childrenCount = await frameData.view.getChildrenCount(parent.domId);
            // Calculate new index based on direction and bounds
            const newIndex = direction === 'up'
                ? Math.max(0, currentIndex - 1)
                : Math.min(childrenCount - 1, currentIndex + 1);
            if (newIndex === currentIndex) {
                return;
            }
            // Create and run move action
            const moveAction = this.createMoveAction(frameData.frame.id, element, parent, newIndex, currentIndex);
            await this.editorEngine.action.run(moveAction);
        }
        catch (error) {
            console.error('Error shifting element:', error);
        }
    }
    createMoveAction(frameId, child, parent, newIndex, originalIndex) {
        return {
            type: 'move-element',
            location: {
                type: 'index',
                targetDomId: parent.domId,
                targetOid: parent.instanceId ?? parent.oid,
                index: newIndex,
                originalIndex: originalIndex,
            },
            targets: [
                {
                    frameId: frameId,
                    branchId: child.branchId,
                    domId: child.domId,
                    oid: child.instanceId ?? child.oid,
                },
            ],
        };
    }
    clear() {
        if (this.dragPreparationTimer) {
            clearTimeout(this.dragPreparationTimer);
            this.dragPreparationTimer = null;
        }
        this.state = null;
    }
}
exports.MoveManager = MoveManager;
//# sourceMappingURL=index.js.map