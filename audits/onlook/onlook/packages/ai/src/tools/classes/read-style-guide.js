"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadStyleGuideTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
class ReadStyleGuideTool extends client_1.ClientTool {
    static toolName = 'read_style_guide';
    static description = 'Read the project style guide and coding conventions';
    static parameters = zod_1.z.object({});
    static icon = icons_1.Icons.Brand;
    async handle(_params, editorEngine) {
        const result = await editorEngine.theme.initializeTailwindColorContent();
        if (!result) {
            throw new Error('Style guide files not found');
        }
        return result;
    }
    static getLabel(input) {
        return 'Reading style guide';
    }
}
exports.ReadStyleGuideTool = ReadStyleGuideTool;
//# sourceMappingURL=read-style-guide.js.map