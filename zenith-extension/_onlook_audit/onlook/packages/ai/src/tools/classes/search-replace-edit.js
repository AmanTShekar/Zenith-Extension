"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchReplaceEditTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const files_1 = require("../shared/helpers/files");
const type_1 = require("../shared/type");
class SearchReplaceEditTool extends client_1.ClientTool {
    static toolName = 'search_replace_edit_file';
    static description = 'Performs exact string replacements in files. The edit will FAIL if `old_string` is not unique in the file. Either provide a larger string with more surrounding context to make it unique or use `replace_all` to change every instance of `old_string`.';
    static parameters = zod_1.z.object({
        file_path: zod_1.z.string().describe('Absolute path to file'),
        old_string: zod_1.z.string().describe('Text to replace'),
        new_string: zod_1.z.string().describe('Replacement text'),
        replace_all: zod_1.z.boolean().optional().default(false).describe('Replace all occurrences'),
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
            let newContent;
            if (args.replace_all) {
                newContent = file.replaceAll(args.old_string, args.new_string);
            }
            else {
                const firstIndex = file.indexOf(args.old_string);
                if (firstIndex === -1) {
                    throw new Error(`String not found in file: ${args.old_string}`);
                }
                const secondIndex = file.indexOf(args.old_string, firstIndex + args.old_string.length);
                if (secondIndex !== -1) {
                    throw new Error(`Multiple occurrences found. Use replace_all=true or provide more context.`);
                }
                newContent = file.replace(args.old_string, args.new_string);
            }
            await fileSystem.writeFile(args.file_path, newContent);
            return `File ${args.file_path} edited successfully`;
        }
        catch (error) {
            throw new Error(`Cannot edit file ${args.file_path}: ${error}`);
        }
    }
    static getLabel(input) {
        if (input?.file_path) {
            return 'Editing ' + (input.file_path.split('/').pop() || '');
        }
        return 'Editing file';
    }
}
exports.SearchReplaceEditTool = SearchReplaceEditTool;
//# sourceMappingURL=search-replace-edit.js.map