"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSummarySchema = void 0;
const zod_1 = require("zod");
exports.ChatSummarySchema = zod_1.z.object({
    filesDiscussed: zod_1.z
        .array(zod_1.z.string())
        .describe('List of file paths mentioned in the conversation'),
    projectContext: zod_1.z
        .string()
        .describe('Summary of what the user is building and their overall goals'),
    implementationDetails: zod_1.z
        .string()
        .describe('Summary of key code decisions, patterns, and important implementation details'),
    userPreferences: zod_1.z
        .string()
        .describe('Specific preferences the user has expressed about implementation, design, etc.'),
    currentStatus: zod_1.z.string().describe('Current state of the project and any pending work'),
});
//# sourceMappingURL=summary.js.map