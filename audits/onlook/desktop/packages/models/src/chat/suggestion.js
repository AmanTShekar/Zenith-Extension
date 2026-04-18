"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSuggestionSchema = void 0;
const zod_1 = require("zod");
exports.ChatSuggestionSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .describe('The display title of the suggestion. This will be shown to the user. Keep it concise but descriptive.'),
    prompt: zod_1.z
        .string()
        .describe('The prompt for the suggestion. This will be used to generate the suggestion. Make this as detailed and specific as possible.'),
});
//# sourceMappingURL=suggestion.js.map