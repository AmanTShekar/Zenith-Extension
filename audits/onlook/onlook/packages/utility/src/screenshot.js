"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreenshotPath = getScreenshotPath;
function getScreenshotPath(projectId, mimeType) {
    const extension = mimeType.split('/')[1];
    return `public/${projectId}/${Date.now()}.${extension}`;
}
//# sourceMappingURL=screenshot.js.map