"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCodeBlock = readCodeBlock;
exports.writeCode = writeCode;
exports.openInIde = openInIde;
exports.openFileInIde = openFileInIde;
exports.pickDirectory = pickDirectory;
const constants_1 = require("@onlook/models/constants");
const ide_1 = require("@onlook/models/ide");
const electron_1 = require("electron");
const __1 = require("..");
const helpers_1 = require("../run/helpers");
const storage_1 = require("../storage");
const helpers_2 = require("./diff/helpers");
const files_1 = require("./files");
const helpers_3 = require("./helpers");
const ide_2 = require("/common/ide");
async function readCodeBlock(templateNode, stripIds = false) {
    try {
        const filePath = templateNode.path;
        const startTag = templateNode.startTag;
        const startRow = startTag.start.line;
        const startColumn = startTag.start.column;
        const endTag = templateNode.endTag || startTag;
        const endRow = endTag.end.line;
        const endColumn = endTag.end.column;
        const fileContent = await (0, files_1.readFile)(filePath);
        if (fileContent == null) {
            console.error(`Failed to read file: ${filePath}`);
            return null;
        }
        const lines = fileContent.split('\n');
        const selectedText = lines
            .slice(startRow - 1, endRow)
            .map((line, index, array) => {
            if (index === 0 && array.length === 1) {
                // Only one line
                return line.substring(startColumn - 1, endColumn);
            }
            else if (index === 0) {
                // First line of multiple
                return line.substring(startColumn - 1);
            }
            else if (index === array.length - 1) {
                // Last line
                return line.substring(0, endColumn);
            }
            // Full lines in between
            return line;
        })
            .join('\n');
        if (stripIds) {
            const ast = (0, helpers_3.parseJsxCodeBlock)(selectedText, true);
            if (ast) {
                return (0, helpers_2.generateCode)(ast, helpers_1.GENERATE_CODE_OPTIONS, selectedText);
            }
        }
        return selectedText;
    }
    catch (error) {
        console.error('Error reading range from file:', error);
        throw error;
    }
}
async function writeCode(codeDiffs) {
    let success = true;
    for (const diff of codeDiffs) {
        try {
            const formattedContent = await (0, files_1.formatContent)(diff.path, diff.generated);
            await (0, files_1.writeFile)(diff.path, formattedContent);
        }
        catch (error) {
            console.error('Error writing content to file:', error);
            success = false;
        }
    }
    return success;
}
function getIdeFromUserSettings() {
    const userSettings = storage_1.PersistentStorage.USER_SETTINGS.read() || {};
    return ide_2.IDE.fromType(userSettings.editor?.ideType || ide_1.DEFAULT_IDE);
}
function openInIde(templateNode) {
    const ide = getIdeFromUserSettings();
    const command = ide.getCodeCommand(templateNode);
    if (ide.type === ide_1.IdeType.ONLOOK) {
        // Send an event to the renderer process to view the file in Onlook's internal IDE
        const startTag = templateNode.startTag;
        const endTag = templateNode.endTag || startTag;
        if (startTag && endTag) {
            __1.mainWindow?.webContents.send(constants_1.MainChannels.VIEW_CODE_IN_ONLOOK, {
                filePath: templateNode.path,
                startLine: startTag.start.line,
                startColumn: startTag.start.column,
                endLine: endTag.end.line,
                endColumn: endTag.end.column - 1,
            });
        }
        else {
            __1.mainWindow?.webContents.send(constants_1.MainChannels.VIEW_CODE_IN_ONLOOK, {
                filePath: templateNode.path,
            });
        }
        return;
    }
    electron_1.shell.openExternal(command);
}
function openFileInIde(filePath, line) {
    const ide = getIdeFromUserSettings();
    const command = ide.getCodeFileCommand(filePath, line);
    if (ide.type === ide_1.IdeType.ONLOOK) {
        // Send an event to the renderer process to view the file in Onlook's internal IDE
        __1.mainWindow?.webContents.send(constants_1.MainChannels.VIEW_CODE_IN_ONLOOK, {
            filePath,
            line,
            startLine: line,
        });
        return;
    }
    electron_1.shell.openExternal(command);
}
function pickDirectory() {
    return electron_1.dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory'],
    });
}
//# sourceMappingURL=index.js.map