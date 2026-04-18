"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatContent = formatContent;
const constants_1 = require("@onlook/constants");
const path_1 = __importDefault(require("path"));
const estree_1 = __importDefault(require("prettier/plugins/estree"));
const typescript_1 = __importDefault(require("prettier/plugins/typescript"));
const standalone_1 = __importDefault(require("prettier/standalone"));
async function formatContent(filePath, content) {
    try {
        const extension = path_1.default.extname(filePath);
        if (!constants_1.NEXT_JS_FILE_EXTENSIONS.includes(extension)) {
            console.log('Skipping formatting for unsupported file extension:', filePath);
            return content;
        }
        const formattedContent = await standalone_1.default.format(content, {
            filepath: filePath,
            plugins: [estree_1.default, typescript_1.default],
            parser: 'typescript',
        });
        return formattedContent;
    }
    catch (error) {
        console.error('Error formatting file:', error);
        return content;
    }
}
//# sourceMappingURL=index.js.map