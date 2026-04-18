"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDE = void 0;
const ide_1 = require("@onlook/models/ide");
const utility_1 = require("@onlook/utility");
class IDE {
    displayName;
    type;
    command;
    icon;
    static VS_CODE = new IDE('VSCode', ide_1.IdeType.VS_CODE, 'vscode', 'VSCodeLogo');
    static CURSOR = new IDE('Cursor', ide_1.IdeType.CURSOR, 'cursor', 'CursorLogo');
    static ZED = new IDE('Zed', ide_1.IdeType.ZED, 'zed', 'ZedLogo');
    static WINDSURF = new IDE('Windsurf', ide_1.IdeType.WINDSURF, 'windsurf', 'WindsurfLogo');
    static ONLOOK = new IDE('Code Panel', ide_1.IdeType.ONLOOK, 'onlook', 'OnlookLogo');
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
                (0, utility_1.assertNever)(type);
        }
    }
    static getAll() {
        return [this.VS_CODE, this.CURSOR, this.ZED, this.WINDSURF];
    }
    getCodeFileCommand(filePath, line) {
        let command = `${this.command}://file/${filePath}`;
        if (line) {
            command += `:${line}`;
        }
        return command;
    }
}
exports.IDE = IDE;
//# sourceMappingURL=ide.js.map