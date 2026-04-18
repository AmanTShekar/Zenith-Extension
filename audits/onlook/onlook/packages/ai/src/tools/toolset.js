"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOLS_MAP = exports.allToolset = exports.readOnlyToolset = void 0;
exports.getToolClassesFromType = getToolClassesFromType;
exports.getToolSetFromType = getToolSetFromType;
const models_1 = require("@onlook/models");
const classes_1 = require("./classes");
// Helper function to convert tool classes to ToolSet
function createToolSet(toolClasses) {
    return toolClasses.reduce((acc, toolClass) => {
        acc[toolClass.toolName] = toolClass.getAITool();
        return acc;
    }, {});
}
const readOnlyToolClasses = [
    classes_1.ListFilesTool,
    classes_1.ReadFileTool,
    classes_1.BashReadTool,
    classes_1.OnlookInstructionsTool,
    classes_1.ReadStyleGuideTool,
    classes_1.ListBranchesTool,
    classes_1.ScrapeUrlTool,
    classes_1.WebSearchTool,
    classes_1.GlobTool,
    classes_1.GrepTool,
    classes_1.TypecheckTool,
    classes_1.CheckErrorsTool,
];
const editOnlyToolClasses = [
    classes_1.SearchReplaceEditTool,
    classes_1.SearchReplaceMultiEditFileTool,
    classes_1.FuzzyEditFileTool,
    classes_1.WriteFileTool,
    classes_1.BashEditTool,
    classes_1.SandboxTool,
    classes_1.TerminalCommandTool,
    classes_1.UploadImageTool,
];
const allToolClasses = [...readOnlyToolClasses, ...editOnlyToolClasses];
exports.readOnlyToolset = createToolSet(readOnlyToolClasses);
exports.allToolset = createToolSet(allToolClasses);
exports.TOOLS_MAP = new Map(allToolClasses.map(toolClass => [toolClass.toolName, toolClass]));
function getToolClassesFromType(chatType) {
    return chatType === models_1.ChatType.ASK ? readOnlyToolClasses : allToolClasses;
}
function getToolSetFromType(chatType) {
    return chatType === models_1.ChatType.ASK ? exports.readOnlyToolset : exports.allToolset;
}
//# sourceMappingURL=toolset.js.map