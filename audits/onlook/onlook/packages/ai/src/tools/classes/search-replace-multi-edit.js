"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchReplaceMultiEditFileTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const files_1 = require("../shared/helpers/files");
const type_1 = require("../shared/type");
class SearchReplaceMultiEditFileTool extends client_1.ClientTool {
    static toolName = 'search_replace_multi_edit_file';
    static description = 'Perform multiple search and replace operations in a file';
    static parameters = zod_1.z.object({
        file_path: zod_1.z.string().describe('Absolute path to file'),
        edits: zod_1.z
            .array(zod_1.z.object({
            old_string: zod_1.z.string().describe('Text to replace'),
            new_string: zod_1.z.string().describe('Replacement text'),
            replace_all: zod_1.z
                .boolean()
                .optional()
                .default(false)
                .describe('Replace all occurrences'),
        }))
            .describe('Array of edit operations'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.Pencil;
    async handle(args, editorEngine) {
        try {
            const fileSystem = await (0, files_1.getFileSystem)(args.branchId, editorEngine);
            const file = await fileSystem.readFile(args.file_path);
            if (typeof file !== 'string') {
                throw new Error(`Cannot read file ${args.file_path}: file is not text`);
            }
            const originalContent = file;
            let content = originalContent;
            // Validate only the first non-replace_all edit against original content
            // Sequential edits will be validated during application
            let tempContent = originalContent;
            for (const edit of args.edits) {
                if (!edit.replace_all) {
                    const firstIndex = tempContent.indexOf(edit.old_string);
                    if (firstIndex === -1) {
                        throw new Error(`String not found in file: ${edit.old_string}`);
                    }
                    const secondIndex = tempContent.indexOf(edit.old_string, firstIndex + edit.old_string.length);
                    if (secondIndex !== -1) {
                        throw new Error(`Multiple occurrences found for "${edit.old_string}". Use replace_all=true or provide more context.`);
                    }
                    // Simulate the edit for next validation
                    tempContent = tempContent.replace(edit.old_string, edit.new_string);
                }
                else {
                    tempContent = tempContent.replaceAll(edit.old_string, edit.new_string);
                }
            }
            // Apply edits sequentially in the order provided
            // Each edit operates on the result of the previous edit
            for (const edit of args.edits) {
                if (edit.replace_all) {
                    content = content.replaceAll(edit.old_string, edit.new_string);
                }
                else {
                    const index = content.indexOf(edit.old_string);
                    if (index === -1) {
                        throw new Error(`String not found in file after previous edits: ${edit.old_string}`);
                    }
                    content = content.replace(edit.old_string, edit.new_string);
                }
            }
            await fileSystem.writeFile(args.file_path, content);
            return `File ${args.file_path} edited with ${args.edits.length} changes`;
        }
        catch (error) {
            throw new Error(`Cannot multi-edit file ${args.file_path}: ${error.message}`);
        }
    }
    static getLabel(input) {
        if (input?.file_path) {
            return 'Editing ' + (input.file_path.split('/').pop() || '');
        }
        return 'Editing files';
    }
}
exports.SearchReplaceMultiEditFileTool = SearchReplaceMultiEditFileTool;
//# sourceMappingURL=search-replace-multi-edit.js.map