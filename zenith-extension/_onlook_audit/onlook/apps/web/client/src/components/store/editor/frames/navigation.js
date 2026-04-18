"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrameNavigationManager = void 0;
const mobx_1 = require("mobx");
class FrameNavigationManager {
    frameIdToNavigationObject = new Map();
    maxHistorySize = 50;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
    }
    registerFrame(frameId, framePathname) {
        if (this.getNavigationHistory(frameId).length === 0) {
            this.addToHistory(frameId, framePathname);
        }
    }
    canGoBack(frameId) {
        const navigationObject = this.frameIdToNavigationObject.get(frameId);
        if (!navigationObject) {
            return false;
        }
        return navigationObject.currentIndex > 0;
    }
    canGoForward(frameId) {
        const navigationObject = this.frameIdToNavigationObject.get(frameId);
        if (!navigationObject) {
            return false;
        }
        return navigationObject.currentIndex < navigationObject.history.length - 1;
    }
    getHistoryLength(frameId) {
        const navigationObject = this.frameIdToNavigationObject.get(frameId);
        return navigationObject ? navigationObject.history.length : 0;
    }
    getCurrentHistoryIndex(frameId) {
        const navigationObject = this.frameIdToNavigationObject.get(frameId);
        return navigationObject ? navigationObject.currentIndex : -1;
    }
    getNavigationHistory(frameId) {
        const navigationObject = this.frameIdToNavigationObject.get(frameId);
        return navigationObject ? navigationObject.history : [];
    }
    addToHistory(frameId, path) {
        const navigationObject = this.frameIdToNavigationObject.get(frameId) ?? {
            history: [],
            currentIndex: 0,
        };
        if (navigationObject.history[navigationObject.currentIndex] === path) {
            return;
        }
        // Remove forward history if we're not at the end
        if (navigationObject.currentIndex < navigationObject.history.length - 1) {
            navigationObject.history = navigationObject.history.slice(0, navigationObject.currentIndex + 1);
        }
        // Add new path to history if it's not the same as the previous path
        navigationObject.history.push(path);
        navigationObject.currentIndex = navigationObject.history.length - 1;
        // Trim history if it exceeds max size
        if (navigationObject.history.length > this.maxHistorySize) {
            navigationObject.history = navigationObject.history.slice(-this.maxHistorySize);
            navigationObject.currentIndex = navigationObject.history.length - 1;
        }
        this.frameIdToNavigationObject.set(frameId, navigationObject);
    }
    goBack(frameId) {
        if (!this.canGoBack(frameId)) {
            return null;
        }
        const navigationObject = this.frameIdToNavigationObject.get(frameId);
        if (!navigationObject) {
            return null;
        }
        const previousIndex = navigationObject.currentIndex - 1;
        if (previousIndex < 0 || previousIndex >= navigationObject.history.length) {
            return null;
        }
        navigationObject.currentIndex = previousIndex;
        return navigationObject.history[previousIndex] ?? null;
    }
    goForward(frameId) {
        if (!this.canGoForward(frameId)) {
            return null;
        }
        const navigationObject = this.frameIdToNavigationObject.get(frameId);
        if (!navigationObject) {
            return null;
        }
        const nextIndex = navigationObject.currentIndex + 1;
        if (nextIndex < 0 || nextIndex >= navigationObject.history.length) {
            return null;
        }
        navigationObject.currentIndex = nextIndex;
        return navigationObject.history[nextIndex] ?? null;
    }
    clearHistory(frameId) {
        this.frameIdToNavigationObject.delete(frameId);
    }
    clearAllHistory() {
        this.frameIdToNavigationObject.clear();
    }
    removeFrame(frameId) {
        this.clearHistory(frameId);
    }
}
exports.FrameNavigationManager = FrameNavigationManager;
//# sourceMappingURL=navigation.js.map