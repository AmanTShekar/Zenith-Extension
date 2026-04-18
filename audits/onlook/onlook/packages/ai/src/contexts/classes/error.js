"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorContext = void 0;
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const helpers_1 = require("../../prompt/helpers");
const base_1 = require("../models/base");
class ErrorContext extends base_1.BaseContext {
    static contextType = models_1.MessageContextType.ERROR;
    static displayName = 'Error';
    static icon = icons_1.Icons.InfoCircled;
    static errorsContentPrefix = `You are helping debug a Next.js React app, likely being set up for the first time. Common issues:
- Missing dependencies ("command not found" errors) → Suggest "bun install" to install the dependencies for the first time (this project uses Bun, not npm)
- Missing closing tags in JSX/TSX files. Make sure all the tags are closed.

The errors can be from terminal or browser and might have the same root cause. Analyze all the messages before suggesting solutions. If there is no solution, don't suggest a fix.
If the same error is being reported multiple times, the previous fix did not work. Try a different approach.

IMPORTANT: This project uses Bun as the package manager. Always use Bun commands:
- Use "bun install" instead of "npm install"
- Use "bun add" instead of "npm install <package>"
- Use "bun run" instead of "npm run"
- Use "bunx" instead of "npx"

NEVER SUGGEST THE "bun run dev" command. Assume the user is already running the app.`;
    static getPrompt(context) {
        const branchDisplay = ErrorContext.getBranchContent(context.branchId);
        const errorDisplay = (0, helpers_1.wrapXml)('error', context.content);
        return `${branchDisplay}\n${errorDisplay}\n`;
    }
    static getLabel(context) {
        return context.displayName || 'Error';
    }
    /**
     * Generate multiple errors content
     */
    static getErrorsContent(errors) {
        if (errors.length === 0) {
            return '';
        }
        let prompt = `${ErrorContext.errorsContentPrefix}\n`;
        for (const error of errors) {
            prompt += ErrorContext.getPrompt(error);
        }
        prompt = (0, helpers_1.wrapXml)('errors', prompt);
        return prompt;
    }
    static getBranchContent(id) {
        return (0, helpers_1.wrapXml)('branch', `id: "${id}"`);
    }
}
exports.ErrorContext = ErrorContext;
//# sourceMappingURL=error.js.map