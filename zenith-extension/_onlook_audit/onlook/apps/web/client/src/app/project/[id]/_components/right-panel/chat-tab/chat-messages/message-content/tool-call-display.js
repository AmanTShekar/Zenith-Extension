"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallDisplay = void 0;
const ai_1 = require("@onlook/ai");
const mobx_react_lite_1 = require("mobx-react-lite");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const bash_code_display_1 = require("../../code-display/bash-code-display");
const collapsible_code_block_1 = require("../../code-display/collapsible-code-block");
const search_sources_display_1 = require("../../code-display/search-sources-display");
const tool_call_simple_1 = require("./tool-call-simple");
const ToolCallDisplayComponent = ({ messageId, toolPart, isStream, applied }) => {
    const toolName = toolPart.type.split('-')[1];
    if (isStream || (toolPart.state !== 'output-available' && toolPart.state !== 'input-available')) {
        return (<tool_call_simple_1.ToolCallSimple toolPart={toolPart} key={toolPart.toolCallId} loading={true}/>);
    }
    if (toolName === ai_1.TerminalCommandTool.toolName) {
        const args = toolPart.input;
        const result = toolPart.output;
        if (!args?.command) {
            return (<tool_call_simple_1.ToolCallSimple toolPart={toolPart} key={toolPart.toolCallId}/>);
        }
        return (<bash_code_display_1.BashCodeDisplay key={toolPart.toolCallId} content={args.command} isStream={isStream} defaultStdOut={toolPart.state === 'output-available' ? result?.output ?? null : null} defaultStdErr={toolPart.state === 'output-available' ? result?.error ?? null : null}/>);
    }
    if (toolName === ai_1.WebSearchTool.toolName && toolPart.state === 'output-available') {
        const searchResult = toolPart.output;
        const args = toolPart.input;
        if (args?.query && searchResult?.result && searchResult.result.length > 0) {
            return (<search_sources_display_1.SearchSourcesDisplay query={String(args.query)} results={Array.isArray(searchResult.result) ? searchResult.result.map((result) => ({
                    title: String(result.title ?? result.url ?? ''),
                    url: String(result.url ?? '')
                })) : []}/>);
        }
    }
    if (toolName === ai_1.WriteFileTool.toolName) {
        const args = toolPart.input;
        const filePath = args?.file_path;
        const codeContent = args?.content;
        const branchId = args?.branchId;
        if (!filePath || !codeContent) {
            return (<tool_call_simple_1.ToolCallSimple toolPart={toolPart} key={toolPart.toolCallId}/>);
        }
        return (<collapsible_code_block_1.CollapsibleCodeBlock path={filePath} content={codeContent} messageId={messageId} applied={applied} isStream={isStream} branchId={branchId}/>);
    }
    if (toolName === ai_1.FuzzyEditFileTool.toolName) {
        const args = toolPart.input;
        const filePath = args?.file_path;
        const codeContent = args?.content;
        const branchId = args?.branchId;
        if (!filePath || !codeContent) {
            return (<tool_call_simple_1.ToolCallSimple toolPart={toolPart} key={toolPart.toolCallId}/>);
        }
        return (<collapsible_code_block_1.CollapsibleCodeBlock path={filePath} content={codeContent} messageId={messageId} applied={applied} isStream={isStream} branchId={branchId}/>);
    }
    if (toolName === ai_1.SearchReplaceEditTool.toolName) {
        const args = toolPart.input;
        const filePath = args?.file_path;
        const codeContent = args?.new_string;
        const branchId = args?.branchId;
        if (!filePath || !codeContent) {
            return (<tool_call_simple_1.ToolCallSimple toolPart={toolPart} key={toolPart.toolCallId}/>);
        }
        return (<collapsible_code_block_1.CollapsibleCodeBlock path={filePath} content={codeContent} messageId={messageId} applied={applied} isStream={isStream} branchId={branchId}/>);
    }
    if (toolName === ai_1.SearchReplaceMultiEditFileTool.toolName) {
        const args = toolPart.input;
        const filePath = args?.file_path;
        const codeContent = args?.edits?.map((edit) => edit.new_string).join('\n...\n');
        const branchId = args?.branchId;
        if (!filePath || !codeContent) {
            return (<tool_call_simple_1.ToolCallSimple toolPart={toolPart} key={toolPart.toolCallId}/>);
        }
        return (<collapsible_code_block_1.CollapsibleCodeBlock path={filePath} content={codeContent} messageId={messageId} applied={applied} isStream={isStream} branchId={branchId}/>);
    }
    // if (toolName === TodoWriteTool.toolName) {
    //     const args = toolPart.input as z.infer<typeof TodoWriteTool.parameters> | null;
    //     const todos = args?.todos;
    //     if (!todos || todos.length === 0) {
    //         return (
    //             <ToolCallSimple
    //                 toolPart={toolPart}
    //                 key={toolPart.toolCallId}
    //                 loading={loading}
    //             />
    //         );
    //     }
    //     return (
    //         <div>
    //             {todos.map((todo) => (
    //                 <div className="flex items-center gap-2 text-sm" key={todo.content}>
    //                     <div className="flex items-center justify-center w-4 h-4 min-w-4">
    //                         {
    //                             todo.status === 'completed' ?
    //                                 <Icons.SquareCheck className="w-4 h-4" /> :
    //                                 <Icons.Square className="w-4 h-4" />
    //                         }
    //                     </div>
    //                     <p className={cn(
    //                         todo.status === 'completed' ? 'line-through text-green-500' : '',
    //                         todo.status === 'in_progress' ? 'text-yellow-500' : '',
    //                         todo.status === 'pending' ? 'text-gray-500' : '',
    //                     )}>{todo.content}</p>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // }
    if (toolName === ai_1.TypecheckTool.toolName) {
        const result = toolPart.output;
        const error = (0, strip_ansi_1.default)(result?.error || '');
        return (<bash_code_display_1.BashCodeDisplay key={toolPart.toolCallId} content={'bunx tsc --noEmit'} isStream={isStream} defaultStdOut={(result?.success ? '✅ Typecheck passed!' : result?.error) ?? null} defaultStdErr={error ?? null}/>);
    }
    return (<tool_call_simple_1.ToolCallSimple toolPart={toolPart} key={toolPart.toolCallId}/>);
};
exports.ToolCallDisplay = (0, mobx_react_lite_1.observer)(ToolCallDisplayComponent);
//# sourceMappingURL=tool-call-display.js.map