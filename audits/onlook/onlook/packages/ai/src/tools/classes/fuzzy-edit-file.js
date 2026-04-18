"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuzzyEditFileTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const files_1 = require("../shared/helpers/files");
const type_1 = require("../shared/type");
class FuzzyEditFileTool extends client_1.ClientTool {
    static toolName = 'fuzzy_edit_file';
    static description = 'Edit a file using fuzzy matching and natural language instructions';
    static parameters = zod_1.z.object({
        file_path: zod_1.z.string().describe('The absolute path to the file to edit'),
        content: zod_1.z.string()
            .describe(`The edit to the file. You only need to include the parts of the code that are being edited instead of the entire file. A smaller model will handle implementing the rest of the code. You must leave comments to indicate the parts of the code that are not being edited such as:
// ... existing code
const foo = 'bar';
// ... existing code
Make sure there's enough context for the other model to understand where the changes are being made.`),
        instruction: zod_1.z
            .string()
            .describe('A single sentence instruction describing what you are going to do for the sketched edit. This is used to assist another model in applying the edit. Use the first person to describe what you are going to do. Use it to disambiguate uncertainty in the edit.'),
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.Pencil;
    async handle(args, editorEngine) {
        const fileSystem = await (0, files_1.getFileSystem)(args.branchId, editorEngine);
        const originalFile = await fileSystem.readFile(args.file_path);
        if (typeof originalFile !== 'string') {
            throw new Error('Binary files are not supported for editing');
        }
        const metadata = {
            projectId: editorEngine.projectId,
            conversationId: editorEngine.chat.conversation.current?.id,
        };
        const updatedContent = await editorEngine.api.applyDiff({
            originalCode: originalFile,
            updateSnippet: args.content,
            instruction: args.instruction,
            metadata,
        });
        if (!updatedContent.result) {
            throw new Error('Error applying code change: ' + updatedContent.error);
        }
        await fileSystem.writeFile(args.file_path, updatedContent.result);
        return 'File edited!';
    }
    static getLabel(input) {
        if (input?.file_path) {
            return 'Editing ' + (input.file_path.split('/').pop() || '');
        }
        return 'Editing file';
    }
}
exports.FuzzyEditFileTool = FuzzyEditFileTool;
//# sourceMappingURL=fuzzy-edit-file.js.map