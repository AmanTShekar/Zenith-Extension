"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDE = void 0;
const ide_1 = require("@onlook/models/ide");
class IDE {
    displayName;
    type;
    command;
    icon;
    static VS_CODE = new IDE('VSCode', ide_1.IdeType.VS_CODE, 'vscode', 'VSCodeLogo');
    static CURSOR = new IDE('Cursor', ide_1.IdeType.CURSOR, 'cursor', 'CursorLogo');
    static ZED = new IDE('Zed', ide_1.IdeType.ZED, 'zed', 'ZedLogo');
    static WINDSURF = new IDE('Windsurf', ide_1.IdeType.WINDSURF, 'windsurf', 'WindsurfLogo');
    static ONLOOK = new IDE('Onlook', ide_1.IdeType.ONLOOK, 'onlook', 'Code');
    constructor(displayName, type, command, icon) {
        this.displayName = displayName;
        this.type = type;
        this.command = command;
        this.icon = icon;
    }
    toString() {
        return this.displayName;
    }
    static fromType(type) {
        switch (type) {
            case ide_1.IdeType.VS_CODE:
                return IDE.VS_CODE;
            case ide_1.IdeType.CURSOR:
                return IDE.CURSOR;
            case ide_1.IdeType.ZED:
                return IDE.ZED;
            case ide_1.IdeType.WINDSURF:
                return IDE.WINDSURF;
            case ide_1.IdeType.ONLOOK:
                return IDE.ONLOOK;
            default:
                throw new Error(`Unknown IDE type: ${type}`);
        }
    }
    static getAll() {
        return [this.VS_CODE, this.CURSOR, this.ZED, this.WINDSURF, this.ONLOOK];
    }
    getCodeCommand(templateNode) {
        const filePath = templateNode.path;
        const startTag = templateNode.startTag;
        const endTag = templateNode.endTag || startTag;
        if (this.type === ide_1.IdeType.ONLOOK) {
            return `internal://${filePath}`;
        }
        let codeCommand = `${this.command}://file/${filePath}`;
        if (startTag && endTag) {
            const startRow = startTag.start.line;
            const startColumn = startTag.start.column;
            const endRow = endTag.end.line;
            const endColumn = endTag.end.column - 1;
            codeCommand += `:${startRow}:${startColumn}`;
            // Note: Zed API doesn't seem to handle end row/column (ref: https://github.com/zed-industries/zed/issues/18520)
            if (this.type !== ide_1.IdeType.ZED) {
                codeCommand += `:${endRow}:${endColumn}`;
            }
        }
        return codeCommand;
    }
    getCodeFileCommand(filePath, line) {
        if (this.type === ide_1.IdeType.ONLOOK) {
            return `internal://${filePath}`;
        }
        let command = `${this.command}://file/${filePath}`;
        if (line) {
            command += `:${line}`;
        }
        return command;
    }
}
exports.IDE = IDE;
//# sourceMappingURL=ide.js.map