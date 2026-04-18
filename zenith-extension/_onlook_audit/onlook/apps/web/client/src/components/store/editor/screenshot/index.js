"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotManager = void 0;
const client_1 = require("@/trpc/client");
const date_fns_1 = require("date-fns");
const lodash_1 = require("lodash");
const mobx_1 = require("mobx");
class ScreenshotManager {
    editorEngine;
    _lastScreenshotTime = null;
    isCapturing = false;
    constructor(editorEngine) {
        this.editorEngine = editorEngine;
        (0, mobx_1.makeAutoObservable)(this);
    }
    get lastScreenshotAt() {
        return this._lastScreenshotTime;
    }
    set lastScreenshotAt(time) {
        this._lastScreenshotTime = time;
    }
    // 10 second debounce
    captureScreenshot = (0, lodash_1.debounce)(this.debouncedCaptureScreenshot, 10000);
    async debouncedCaptureScreenshot() {
        if (this.isCapturing) {
            return;
        }
        this.isCapturing = true;
        try {
            // If the screenshot was captured less than 30 minutes ago, skip capturing
            if (this.lastScreenshotAt) {
                const thirtyMinutesAgo = (0, date_fns_1.subMinutes)(new Date(), 30);
                if ((0, date_fns_1.isAfter)(this.lastScreenshotAt, thirtyMinutesAgo)) {
                    return;
                }
            }
            const result = await client_1.api.project.captureScreenshot.mutate({ projectId: this.editorEngine.projectId });
            if (!result || !result.success) {
                throw new Error('Failed to capture screenshot');
            }
            this.lastScreenshotAt = new Date();
        }
        catch (error) {
            console.error('Error capturing screenshot', error);
        }
        finally {
            this.isCapturing = false;
        }
    }
    clear() {
        this.lastScreenshotAt = null;
    }
}
exports.ScreenshotManager = ScreenshotManager;
//# sourceMappingURL=index.js.map