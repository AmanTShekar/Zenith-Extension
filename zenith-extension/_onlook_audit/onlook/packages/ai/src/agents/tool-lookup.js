"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTools = exports.rootTools = exports.readOnlyRootTools = exports.allTools = void 0;
const tools_1 = require("../tools");
exports.allTools = [
    tools_1.ListFilesTool,
    tools_1.ReadFileTool,
    tools_1.BashReadTool,
    tools_1.OnlookInstructionsTool,
    tools_1.ReadStyleGuideTool,
    tools_1.ListBranchesTool,
    tools_1.ScrapeUrlTool,
    tools_1.WebSearchTool,
    tools_1.GlobTool,
    tools_1.GrepTool,
    tools_1.TypecheckTool,
    tools_1.CheckErrorsTool,
    tools_1.SearchReplaceEditTool,
    tools_1.SearchReplaceMultiEditFileTool,
    tools_1.FuzzyEditFileTool,
    tools_1.WriteFileTool,
    tools_1.BashEditTool,
    tools_1.SandboxTool,
    tools_1.TerminalCommandTool,
];
exports.readOnlyRootTools = [
    tools_1.ListFilesTool,
    tools_1.ReadFileTool,
    tools_1.BashReadTool,
    tools_1.OnlookInstructionsTool,
    tools_1.ReadStyleGuideTool,
    tools_1.ListBranchesTool,
    tools_1.ScrapeUrlTool,
    tools_1.WebSearchTool,
    tools_1.GlobTool,
    tools_1.GrepTool,
    tools_1.TypecheckTool,
    tools_1.CheckErrorsTool,
];
const editOnlyRootTools = [
    tools_1.SearchReplaceEditTool,
    tools_1.SearchReplaceMultiEditFileTool,
    tools_1.FuzzyEditFileTool,
    tools_1.WriteFileTool,
    tools_1.BashEditTool,
    tools_1.SandboxTool,
    tools_1.TerminalCommandTool,
];
exports.rootTools = [...exports.readOnlyRootTools, ...editOnlyRootTools];
exports.userTools = [
    tools_1.ListBranchesTool,
    tools_1.ListFilesTool,
];
//# sourceMappingURL=tool-lookup.js.map