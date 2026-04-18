"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadFileTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const files_1 = require("../shared/helpers/files");
const type_1 = require("../shared/type");
class ReadFileTool extends client_1.ClientTool {
    static toolName = 'read_file';
    static description = "Reads a file from the local filesystem. You can access any file directly by using this tool. By default, it reads up to 2000 lines starting from the beginning of the file. You can optionally specify a line offset and limit (especially handy for long files), but it's recommended to read the whole file by not providing these parameters. Results are returned using cat -n format, with line numbers starting at 1. Supports fuzzy path matching when exact paths are not found.";
    static parameters = zod_1.z.object({
        file_path: zod_1.z
            .string()
            .min(1)
            .describe('The absolute path to the file to read. Supports fuzzy path matching if exact path is not found.'),
        offset: zod_1.z
            .number()
            .optional()
            .describe('The line number to start reading from. Only provide if the file is too large to read at once'),
        limit: zod_1.z
            .number()
            .optional()
            .describe('The number of lines to read. Only provide if the file is too large to read at once.'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.EyeOpen;
    async handle(args, editorEngine) {
        try {
            const fileSystem = await (0, files_1.getFileSystem)(args.branchId, editorEngine);
            let file = await fileSystem.readFile(args.file_path);
            if (typeof file !== 'string') {
                throw new Error(`Cannot read file ${args.file_path}: file is not text`);
            }
            const lines = file.split('\n');
            const totalLines = lines.length;
            if (args.offset || args.limit) {
                const start = Math.max(0, (args.offset || 1) - 1); // Convert to 0-based indexing
                const end = args.limit ? start + args.limit : lines.length;
                const selectedLines = lines.slice(start, end);
                return {
                    content: selectedLines.map((line, index) => `${start + index + 1}→${line}`).join('\n'),
                    lines: selectedLines.length,
                };
            }
            // Limit to 2000 lines by default to match Claude's behavior
            const maxLines = 2000;
            if (lines.length > maxLines) {
                const selectedLines = lines.slice(0, maxLines);
                return {
                    content: selectedLines.map((line, index) => `${index + 1}→${line}`).join('\n') + `\n... (truncated, showing first ${maxLines} of ${totalLines} lines)`,
                    lines: maxLines,
                };
            }
            return {
                content: lines.map((line, index) => `${index + 1}→${line}`).join('\n'),
                lines: lines.length,
            };
        }
        catch (error) {
            throw new Error(`Cannot read file ${args.file_path}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    static getLabel(input) {
        if (input?.file_path) {
            return 'Reading file ' + (input.file_path.split('/').pop() || '');
        }
        return 'Reading file';
    }
}
exports.ReadFileTool = ReadFileTool;
//# sourceMappingURL=read-file.js.map