"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BRANCH_ID_SCHEMA = void 0;
const zod_1 = require("zod");
exports.BRANCH_ID_SCHEMA = zod_1.z
    .string()
    .trim()
    .min(1)
    .describe('Branch ID to run the command in. Only use the branch ID, not the branch name.');
//# sourceMappingURL=type.js.map