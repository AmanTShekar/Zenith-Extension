"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListBranchesTool = void 0;
const icons_1 = require("@onlook/ui/icons");
const clone_1 = require("@onlook/utility/src/clone");
const zod_1 = require("zod");
const client_1 = require("../models/client");
class ListBranchesTool extends client_1.ClientTool {
    static toolName = 'list_branches';
    static description = 'List all available branches in the project';
    static parameters = zod_1.z.object({});
    static icon = icons_1.Icons.Branch;
    async handle(_params, editorEngine) {
        const branches = (0, clone_1.jsonClone)(editorEngine.branches.allBranches);
        return {
            branches,
            activeBranchId: editorEngine.branches.activeBranch?.id || null,
        };
    }
    static getLabel(input) {
        return 'Listing branches';
    }
}
exports.ListBranchesTool = ListBranchesTool;
//# sourceMappingURL=list-branches.js.map