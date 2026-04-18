"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatToolSet = exports.getStrReplaceEditorTool = exports.onlookInstructionsTool = exports.readFilesTool = exports.listFilesTool = void 0;
const anthropic_1 = require("@ai-sdk/anthropic");
const ai_1 = require("ai");
const promises_1 = require("fs/promises");
const zod_1 = require("zod");
const onlook_1 = require("../prompt/onlook");
const helpers_1 = require("./helpers");
exports.listFilesTool = (0, ai_1.tool)({
    description: 'List all files in the current directory, including subdirectories',
    parameters: zod_1.z.object({
        path: zod_1.z
            .string()
            .describe('The absolute path to the directory to get files from. This should be the root directory of the project.'),
    }),
    execute: async ({ path }) => {
        const res = await (0, helpers_1.getAllFiles)(path);
        if (!res.success) {
            return { error: res.error };
        }
        return res.files;
    },
});
exports.readFilesTool = (0, ai_1.tool)({
    description: 'Read the contents of files',
    parameters: zod_1.z.object({
        paths: zod_1.z.array(zod_1.z.string()).describe('The absolute paths to the files to read'),
    }),
    execute: async ({ paths }) => {
        try {
            const files = await Promise.all(paths.map(async (path) => {
                const file = await (0, promises_1.readFile)(path, 'utf8');
                return { path, content: file };
            }));
            return files;
        }
        catch (error) {
            return `Error: ${error instanceof Error ? error.message : error}`;
        }
    },
});
exports.onlookInstructionsTool = (0, ai_1.tool)({
    description: 'Get the instructions for the Onlook AI',
    parameters: zod_1.z.object({}),
    execute: async () => {
        return onlook_1.ONLOOK_PROMPT;
    },
});
const getStrReplaceEditorTool = (handlers) => {
    const strReplaceEditorTool = anthropic_1.anthropic.tools.textEditor_20250124({
        execute: async ({ command, path, file_text, insert_line, new_str, old_str, view_range, }) => {
            try {
                switch (command) {
                    case 'view': {
                        const content = await handlers.readFile(path);
                        if (view_range) {
                            const lines = content.split('\n');
                            const [start, end] = view_range;
                            return lines.slice(start - 1, end).join('\n');
                        }
                        return content;
                    }
                    case 'create': {
                        if (!file_text) {
                            throw new Error('file_text is required for create command');
                        }
                        await handlers.writeFile(path, file_text);
                        return `File created successfully at ${path}`;
                    }
                    case 'str_replace': {
                        if (!old_str) {
                            throw new Error('old_str is required for str_replace command');
                        }
                        const content = await handlers.readFile(path);
                        const newContent = content.replace(old_str, new_str || '');
                        await handlers.writeFile(path, newContent);
                        return `String replaced successfully in ${path}`;
                    }
                    case 'insert': {
                        if (!new_str || insert_line === undefined) {
                            throw new Error('new_str and insert_line are required for insert command');
                        }
                        const content = await handlers.readFile(path);
                        const lines = content.split('\n');
                        lines.splice(insert_line, 0, new_str);
                        await handlers.writeFile(path, lines.join('\n'));
                        return `Content inserted successfully at line ${insert_line} in ${path}`;
                    }
                    case 'undo_edit': {
                        if (handlers.undoEdit) {
                            await handlers.undoEdit();
                            return 'Edit undone successfully';
                        }
                        return 'Undo operation not implemented';
                    }
                    default: {
                        throw new Error(`Unknown command: ${command}`);
                    }
                }
            }
            catch (error) {
                return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
        },
    });
    return strReplaceEditorTool;
};
exports.getStrReplaceEditorTool = getStrReplaceEditorTool;
exports.chatToolSet = {
    list_files: exports.listFilesTool,
    read_files: exports.readFilesTool,
    onlook_instructions: exports.onlookInstructionsTool,
};
//# sourceMappingURL=index.js.map