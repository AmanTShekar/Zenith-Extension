"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListFilesTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const files_1 = require("../shared/helpers/files");
const type_1 = require("../shared/type");
class ListFilesTool extends client_1.ClientTool {
    static toolName = 'list_files';
    static description = 'List files and directories in a specified path. Supports both absolute and relative paths with fuzzy matching. Can filter by type and exclude patterns. Returns file paths with type information (file/directory). Only lists immediate children (non-recursive).';
    static parameters = zod_1.z.object({
        path: zod_1.z
            .string()
            .optional()
            .describe('The directory path to list files from. Can be absolute or relative. If not specified, uses current working directory. Supports fuzzy path matching if exact path is not found.'),
        show_hidden: zod_1.z
            .boolean()
            .optional()
            .default(false)
            .describe('Whether to include hidden files and directories (starting with .)'),
        file_types_only: zod_1.z
            .boolean()
            .optional()
            .default(false)
            .describe('Whether to only return files (exclude directories)'),
        ignore: zod_1.z
            .array(zod_1.z.string())
            .optional()
            .describe('Array of glob patterns to ignore (e.g., ["node_modules", "*.log", ".git"])'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.ListBullet;
    async handle(args, editorEngine) {
        const sandbox = editorEngine.branches.getSandboxById(args.branchId);
        if (!sandbox) {
            throw new Error(`Sandbox not found for branch ID: ${args.branchId}`);
        }
        try {
            // Resolve the directory path with fuzzy matching support
            const resolvedPath = await (0, files_1.resolveDirectoryPath)(args.path, sandbox);
            // Check if find command is available
            const hasFindCommand = await (0, files_1.isCommandAvailable)(sandbox, 'find');
            let result;
            if (hasFindCommand) {
                // Build the find command based on parameters
                let findCommand = `find "${resolvedPath}"`;
                // Always use non-recursive behavior (maxdepth 1)
                findCommand += ' -maxdepth 1';
                // Filter by type if specified
                if (args.file_types_only) {
                    findCommand += ' -type f';
                }
                else {
                    findCommand += ' -type f -o -type d';
                }
                // Handle hidden files
                if (!args.show_hidden) {
                    findCommand += ' ! -name ".*"';
                }
                // Add ignore patterns
                if (args.ignore && args.ignore.length > 0) {
                    for (const pattern of args.ignore) {
                        findCommand += ` ! -path "*/${pattern}" ! -name "${pattern}"`;
                    }
                }
                // Add formatting to get file info
                findCommand += ' -printf "%p|%y|%s|%TY-%Tm-%Td %TH:%TM\\n"';
                result = await (0, files_1.safeRunCommand)(sandbox, findCommand);
            }
            else {
                result = { success: false, output: '', isReliable: false };
            }
            if (!result.success) {
                // Fallback to the original method if find command fails or unavailable
                const fallbackResult = await sandbox.readDir(resolvedPath);
                if (!fallbackResult) {
                    throw new Error(`Cannot list directory: ${resolvedPath}`);
                }
                return fallbackResult.map((file) => ({
                    path: file.name,
                    type: file.type,
                }));
            }
            if (!result.output.trim()) {
                return [];
            }
            // Parse the find output
            const files = result.output.trim().split('\n')
                .filter((line) => line.trim())
                .map((line) => {
                const parts = line.split('|');
                const fullPath = parts[0] || '';
                const type = parts[1] || '';
                const size = parts[2] || '';
                const modified = parts[3] || '';
                const relativePath = fullPath.replace(resolvedPath + '/', '').replace(resolvedPath, '.');
                return {
                    path: relativePath === '.' ? '.' : relativePath,
                    type: type === 'f' ? 'file' : 'directory',
                    size: size ? parseInt(size, 10) : undefined,
                    modified: modified || undefined
                };
            })
                .filter((file) => file.path !== '.') // Remove the directory itself unless it's the only result
                .sort((a, b) => {
                // Sort directories first, then files, then alphabetically
                if (a.type !== b.type) {
                    return a.type === 'directory' ? -1 : 1;
                }
                return a.path.localeCompare(b.path);
            });
            return files;
        }
        catch (error) {
            throw new Error(`Cannot list directory: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    static getLabel(input) {
        if (input?.path) {
            return 'Reading directory ' + (input.path.split('/').pop() || '');
        }
        return 'Reading directory';
    }
}
exports.ListFilesTool = ListFilesTool;
//# sourceMappingURL=list-files.js.map