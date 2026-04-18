"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckErrorsTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const zod_1 = require("zod");
const client_1 = require("../models/client");
class CheckErrorsTool extends client_1.ClientTool {
    static toolName = 'check_errors';
    static description = 'Check for terminal errors similar to chat errors. Lists all current terminal errors from all branches.';
    static parameters = zod_1.z.object({});
    static icon = icons_1.Icons.MagnifyingGlass;
    async handle(_params, editorEngine) {
        const errors = editorEngine.branches.getAllErrors();
        if (errors.length === 0) {
            return {
                success: true,
                message: 'No errors found.',
                errors: [],
                count: 0,
            };
        }
        const errorSummary = errors.map((error) => ({
            sourceId: error.sourceId,
            type: error.type,
            content: error.content,
            branchId: error.branchId,
            branchName: error.branchName,
        }));
        return {
            success: true,
            message: `Found ${errors.length} error${errors.length > 1 ? 's' : ''}`,
            errors: errorSummary,
            count: errors.length,
        };
    }
    static getLabel(input) {
        return 'Checking for errors';
    }
}
exports.CheckErrorsTool = CheckErrorsTool;
//# sourceMappingURL=check-errors.js.map