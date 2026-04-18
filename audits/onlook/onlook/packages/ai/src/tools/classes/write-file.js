"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteFileTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const files_1 = require("../shared/helpers/files");
const type_1 = require("../shared/type");
class WriteFileTool extends client_1.ClientTool {
    static toolName = 'write_file';
    static description = 'Write content to a new file or overwrite an existing file';
    static parameters = zod_1.z.object({
        file_path: zod_1.z.string().describe('Path to the file to write'),
        content: zod_1.z.string().describe('Content to write to the file'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.FilePlus;
    async handle(args, editorEngine) {
        try {
            const fileSystem = await (0, files_1.getFileSystem)(args.branchId, editorEngine);
            await fileSystem.writeFile(args.file_path, args.content);
            return `File ${args.file_path} written successfully`;
        }
        catch (error) {
            throw new Error(`Cannot write file ${args.file_path}: ${error}`);
        }
    }
    static getLabel(input) {
        if (input?.file_path) {
            return 'Writing file ' + (input.file_path.split('/').pop() || '');
        }
        return 'Writing file';
    }
}
exports.WriteFileTool = WriteFileTool;
//# sourceMappingURL=write-file.js.map