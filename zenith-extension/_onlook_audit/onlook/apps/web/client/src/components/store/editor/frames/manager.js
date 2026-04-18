"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FramesManager = void 0;
const client_1 = require("@/trpc/client");
const db_1 = require("@onlook/db");
const utility_1 = require("@onlook/utility");
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
const uuid_1 = require("uuid");
const dimension_1 = require("./dimension");
const navigation_1 = require("./navigation");
class FramesManager {
    editorEngine;
    _frameIdToData = new Map();
    _navigation = new navigation_1.FrameNavigationManager();
    _disposers = [];
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    updateFrameSelection(id, selected) {
        const data = this._frameIdToData.get(id);
        if (data) {
            data.selected = selected;
            this._frameIdToData.set(id, data);
        }
    }
    applyFrames(frames) {
        frames.forEach((frame, index) => {
            this._frameIdToData.set(frame.id, {
                frame,
                view: null,
                // Select the first frame
                selected: index === 0
            });
        });
    }
    get selected() {
        return Array.from(this._frameIdToData.values()).filter((w) => w.selected);
    }
    get navigation() {
        return this._navigation;
    }
    getAll() {
        return Array.from(this._frameIdToData.values());
    }
    getByBranchId(branchId) {
        return Array.from(this._frameIdToData.values()).filter((w) => w.frame.branchId === branchId);
    }
    get(id) {
        return this._frameIdToData.get(id) ?? null;
    }
    registerView(frame, view) {
        const isSelected = this.isSelected(frame.id);
        this._frameIdToData.set(frame.id, { frame, view, selected: isSelected });
        const framePathname = new URL(view.src).pathname;
        this._navigation.registerFrame(frame.id, framePathname);
    }
    deregister(frame) {
        this._frameIdToData.delete(frame.id);
    }
    deregisterAll() {
        this._frameIdToData.clear();
    }
    isSelected(id) {
        return this._frameIdToData.get(id)?.selected ?? false;
    }
    select(frames, multiselect = false) {
        if (!multiselect) {
            this.deselectAll();
            for (const frame of frames) {
                this.updateFrameSelection(frame.id, true);
            }
        }
        else {
            for (const frame of frames) {
                this.updateFrameSelection(frame.id, !this.isSelected(frame.id));
            }
        }
        this.notify();
    }
    deselect(frame) {
        this.updateFrameSelection(frame.id, false);
        this.notify();
    }
    deselectAll() {
        for (const [id] of this._frameIdToData) {
            this.updateFrameSelection(id, false);
        }
        this.notify();
    }
    notify() {
        this._frameIdToData = new Map(this._frameIdToData);
    }
    clear() {
        this.deregisterAll();
        this._disposers.forEach((dispose) => dispose());
        this._disposers = [];
        this._navigation.clearAllHistory();
    }
    disposeFrame(frameId) {
        this._frameIdToData.delete(frameId);
        this.editorEngine?.ast?.mappings?.remove(frameId);
        this._navigation.removeFrame(frameId);
    }
    reloadAllViews() {
        for (const frameData of this.getAll()) {
            frameData.view?.reload();
        }
    }
    reloadView(id) {
        const frameData = this.get(id);
        if (!frameData?.view) {
            console.error('Frame view not found for reload', id);
            return;
        }
        frameData.view.reload();
    }
    // Navigation history methods
    async goBack(frameId) {
        const previousPath = this._navigation.goBack(frameId);
        if (previousPath) {
            await this.navigateToPath(frameId, previousPath, false);
        }
    }
    async goForward(frameId) {
        const nextPath = this._navigation.goForward(frameId);
        if (nextPath) {
            await this.navigateToPath(frameId, nextPath, false);
        }
    }
    async navigateToPath(frameId, path, addToHistory = true) {
        const frameData = this.get(frameId);
        if (!frameData?.view) {
            console.warn('No frame view available for navigation');
            return;
        }
        try {
            const currentUrl = frameData.view.src;
            const baseUrl = currentUrl ? new URL(currentUrl).origin : null;
            if (!baseUrl) {
                console.warn('No base URL found');
                return;
            }
            await this.updateAndSaveToStorage(frameId, { url: `${baseUrl}${path}` });
            this.editorEngine.pages.setActivePath(frameId, path);
            this.editorEngine.posthog.capture('page_navigate', {
                path,
            });
            // Add to navigation history
            if (addToHistory) {
                this._navigation.addToHistory(frameId, path);
            }
        }
        catch (error) {
            console.error('Navigation failed:', error);
        }
    }
    async delete(id) {
        const frameData = this.get(id);
        if (!frameData?.view) {
            console.error('Frame not found for delete', id);
            return;
        }
        const success = await client_1.api.frame.delete.mutate({
            frameId: frameData.frame.id,
        });
        if (success) {
            this.disposeFrame(frameData.frame.id);
        }
        else {
            console.error('Failed to delete frame');
        }
    }
    async create(frame) {
        const success = await client_1.api.frame.create.mutate((0, db_1.toDbFrame)((0, dimension_1.roundDimensions)(frame)));
        if (success) {
            this._frameIdToData.set(frame.id, { frame, view: null, selected: false });
        }
        else {
            console.error('Failed to create frame');
        }
    }
    async duplicate(id) {
        const frameData = this.get(id);
        if (!frameData?.view) {
            console.error('Frame view not found for duplicate', id);
            return;
        }
        const frame = frameData.frame;
        const allFrames = this.getAll().map(frameData => frameData.frame);
        const proposedFrame = {
            ...frame,
            id: (0, uuid_1.v4)(),
            position: {
                x: frame.position.x + frame.dimension.width + 100,
                y: frame.position.y,
            },
        };
        const newPosition = (0, utility_1.calculateNonOverlappingPosition)(proposedFrame, allFrames);
        const newFrame = {
            ...proposedFrame,
            position: newPosition,
        };
        await this.create(newFrame);
    }
    async updateAndSaveToStorage(frameId, frame) {
        const existingFrame = this.get(frameId);
        if (existingFrame) {
            const newFrame = { ...existingFrame.frame, ...frame };
            this._frameIdToData.set(frameId, {
                ...existingFrame,
                frame: newFrame,
                selected: existingFrame.selected,
            });
        }
        await this.saveToStorage(frameId, frame);
    }
    saveToStorage = (0, lodash_1.debounce)(this.undebouncedSaveToStorage.bind(this), 1000);
    async undebouncedSaveToStorage(frameId, frame) {
        try {
            const frameToUpdate = (0, db_1.toDbPartialFrame)(frame);
            const success = await client_1.api.frame.update.mutate({
                ...frameToUpdate,
                id: frameId,
            });
            if (!success) {
                console.error('Failed to update frame');
            }
        }
        catch (error) {
            console.error('Failed to update frame', error);
        }
    }
    canDelete() {
        const selectedFrames = this.selected;
        if (selectedFrames.length > 0) {
            // Check if any selected frame is the last frame in its branch
            for (const selectedFrame of selectedFrames) {
                const branchId = selectedFrame.frame.branchId;
                const framesInBranch = this.getAll().filter(frameData => frameData.frame.branchId === branchId);
                if (framesInBranch.length <= 1) {
                    return false; // Cannot delete if this is the last frame in the branch
                }
            }
            return true;
        }
        // Fallback to checking total frames if none are selected
        return this.getAll().length > 1;
    }
    canDuplicate() {
        return this.selected.length > 0;
    }
    calculateNonOverlappingPosition(proposedFrame) {
        const allFrames = this.getAll().map(frameData => frameData.frame);
        return (0, utility_1.calculateNonOverlappingPosition)(proposedFrame, allFrames);
    }
    async duplicateSelected() {
        for (const frame of this.selected) {
            await this.duplicate(frame.frame.id);
        }
    }
    async deleteSelected() {
        if (!this.canDelete()) {
            console.error('Cannot delete the last frame');
            return;
        }
        for (const frame of this.selected) {
            await this.delete(frame.frame.id);
        }
    }
}
exports.FramesManager = FramesManager;
//# sourceMappingURL=manager.js.map