"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypecheckTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
const type_1 = require("../shared/type");
class TypecheckTool extends client_1.ClientTool {
    static toolName = 'typecheck';
    static description = 'Run TypeScript type checking. use to check after code edits, when type changes are suspected.';
    static parameters = zod_1.z.object({
        branchId: type_1.BRANCH_ID_SCHEMA,
    });
    static icon = icons_1.Icons.MagnifyingGlass;
    async handle(args, editorEngine) {
        try {
            const sandbox = editorEngine.branches.getSandboxById(args.branchId);
            if (!sandbox) {
                return {
                    success: false,
                    error: `Sandbox not found for branch ID: ${args.branchId}`
                };
            }
            // Run Next.js typecheck command
            const result = await sandbox.session.runCommand('bunx tsc --noEmit');
            if (result.success) {
                return {
                    success: true
                };
            }
            else {
                return {
                    success: false,
                    error: result.error || result.output || 'Typecheck failed with unknown error'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error.message || error.toString()
            };
        }
    }
    static getLabel(input) {
        return 'Checking types';
    }
}
exports.TypecheckTool = TypecheckTool;
//# sourceMappingURL=typecheck.js.map