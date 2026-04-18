"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listenForCodeMessages = listenForCodeMessages;
const constants_1 = require("@onlook/models/constants");
const electron_1 = require("electron");
const index_1 = require("../assets/fonts/index");
const watcher_1 = require("../assets/fonts/watcher");
const styles_1 = require("../assets/styles");
const code_1 = require("../code/");
const classes_1 = require("../code/classes");
const components_1 = require("../code/components");
const diff_1 = require("../code/diff");
const text_1 = require("../code/diff/text");
const files_1 = require("../code/files");
const fileWatcher_1 = require("../code/fileWatcher");
const props_1 = require("../code/props");
const templateNode_1 = require("../code/templateNode");
const run_1 = __importDefault(require("../run"));
const cleanup_1 = require("../run/cleanup");
const fontFileWatcher = new watcher_1.FontFileWatcher();
function listenForCodeMessages() {
    electron_1.ipcMain.handle(constants_1.MainChannels.VIEW_SOURCE_CODE, (e, args) => {
        const oid = args;
        const templateNode = run_1.default.getTemplateNode(oid);
        if (!templateNode) {
            console.error('Failed to get code block. No template node found.');
            return;
        }
        (0, code_1.openInIde)(templateNode);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.VIEW_SOURCE_FILE, (e, args) => {
        const { filePath, line } = args;
        (0, code_1.openFileInIde)(filePath, line);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_CODE_BLOCK, (e, args) => {
        const { oid, stripIds } = args;
        const templateNode = run_1.default.getTemplateNode(oid);
        if (!templateNode) {
            console.error('Failed to get code block. No template node found.');
            return null;
        }
        return (0, code_1.readCodeBlock)(templateNode, stripIds);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_FILE_CONTENT, (e, args) => {
        const { filePath, stripIds } = args;
        if (stripIds) {
            return (0, cleanup_1.getFileContentWithoutIds)(filePath);
        }
        return (0, files_1.readFile)(filePath);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_TEMPLATE_NODE_CLASS, (e, args) => {
        const templateNode = args;
        return (0, classes_1.getTemplateNodeClass)(templateNode);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.WRITE_CODE_DIFFS, async (e, args) => {
        const codeResults = args;
        const res = await (0, code_1.writeCode)(codeResults);
        return res;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_AND_WRITE_CODE_DIFFS, async (e, args) => {
        const { requests, write } = args;
        const codeDiffs = await (0, diff_1.getCodeDiffs)(requests);
        if (write) {
            return (0, code_1.writeCode)(codeDiffs);
        }
        return codeDiffs;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_TEMPLATE_NODE_CHILD, (e, args) => {
        const { parent, child, index } = args;
        return (0, templateNode_1.getTemplateNodeChild)(parent, child, index);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.PICK_COMPONENTS_DIRECTORY, async () => {
        const result = await (0, code_1.pickDirectory)();
        if (result.canceled) {
            return null;
        }
        return result.filePaths.at(0) ?? null;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_COMPONENTS, async (_, args) => {
        if (typeof args !== 'string') {
            throw new Error('`args` must be a string');
        }
        const result = (0, components_1.extractComponentsFromDirectory)(args);
        return result;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.IS_CHILD_TEXT_EDITABLE, async (e, args) => {
        const { oid } = args;
        return (0, text_1.isChildTextEditable)(oid);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_TEMPLATE_NODE_PROPS, (e, args) => {
        const templateNode = args;
        return (0, props_1.getTemplateNodeProps)(templateNode);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SCAN_TAILWIND_CONFIG, async (e, args) => {
        const { projectRoot } = args;
        return (0, styles_1.scanTailwindConfig)(projectRoot);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.UPDATE_TAILWIND_CONFIG, async (e, args) => {
        const { projectRoot, originalKey, newColor, newName, parentName, theme } = args;
        return (0, styles_1.updateTailwindColorConfig)(projectRoot, originalKey, newColor, newName, theme, parentName);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.DELETE_TAILWIND_CONFIG, async (_, args) => {
        const { projectRoot, groupName, colorName } = args;
        return (0, styles_1.deleteTailwindColorGroup)(projectRoot, groupName, colorName);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SCAN_FONTS, async (_, args) => {
        const { projectRoot } = args;
        return (0, index_1.scanFonts)(projectRoot);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.ADD_FONT, async (_, args) => {
        const { projectRoot, font } = args;
        return (0, index_1.addFont)(projectRoot, font);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.REMOVE_FONT, async (_, args) => {
        const { projectRoot, font } = args;
        return (0, index_1.removeFont)(projectRoot, font);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.SET_FONT, async (_, args) => {
        const { projectRoot, font } = args;
        return (0, index_1.setDefaultFont)(projectRoot, font);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.GET_DEFAULT_FONT, async (_, args) => {
        const { projectRoot } = args;
        return (0, index_1.getDefaultFont)(projectRoot);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.UPLOAD_FONTS, async (_, args) => {
        const { projectRoot, fontFiles } = args;
        return (0, index_1.addLocalFont)(projectRoot, fontFiles);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.WATCH_FONT_FILE, async (_, args) => {
        const { projectRoot } = args;
        return fontFileWatcher.watch(projectRoot);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.WATCH_FILE, async (e, args) => {
        const { filePath } = args;
        return fileWatcher_1.fileWatcher.watchFile(filePath);
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.UNWATCH_FILE, (e, args) => {
        const { filePath } = args;
        fileWatcher_1.fileWatcher.unwatchFile(filePath);
        return true;
    });
    electron_1.ipcMain.handle(constants_1.MainChannels.MARK_FILE_MODIFIED, (e, args) => {
        const { filePath } = args;
        fileWatcher_1.fileWatcher.markFileAsModified(filePath);
        return true;
    });
}
//# sourceMappingURL=code.js.map