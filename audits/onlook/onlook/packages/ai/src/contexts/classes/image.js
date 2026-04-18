"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageContext = void 0;
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const base_1 = require("../models/base");
class ImageContext extends base_1.BaseContext {
    static contextType = models_1.MessageContextType.IMAGE;
    static displayName = 'Image';
    static icon = icons_1.Icons.Image;
    static getPrompt(context) {
        // Images don't generate text prompts - they're handled as file attachments
        return `[Image: ${context.mimeType}]`;
    }
    static getLabel(context) {
        return context.displayName || 'Image';
    }
    /**
     * Convert image contexts to file UI parts for AI SDK
     */
    static toFileUIParts(images) {
        return images.map((i) => ({
            type: 'file',
            mediaType: i.mimeType,
            url: i.content,
        }));
    }
}
exports.ImageContext = ImageContext;
//# sourceMappingURL=image.js.map