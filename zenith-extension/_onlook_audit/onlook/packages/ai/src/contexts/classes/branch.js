"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchContext = void 0;
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const helpers_1 = require("../../prompt/helpers");
const base_1 = require("../models/base");
class BranchContext extends base_1.BaseContext {
    static contextType = models_1.MessageContextType.BRANCH;
    static displayName = 'Branch';
    static icon = icons_1.Icons.Branch;
    static getPrompt(context) {
        return `Branch: ${context.branch.name} (${context.branch.id})\nDescription: ${context.content}`;
    }
    static getLabel(context) {
        return context.displayName || context.branch.name;
    }
    /**
     * Generate multiple branches content
     */
    static getBranchesContent(branches) {
        let prompt = `I'm working on the following branches: \n`;
        prompt += branches.map((b) => b.branch.id).join(', ');
        prompt = (0, helpers_1.wrapXml)('branches', prompt);
        return prompt;
    }
}
exports.BranchContext = BranchContext;
//# sourceMappingURL=branch.js.map