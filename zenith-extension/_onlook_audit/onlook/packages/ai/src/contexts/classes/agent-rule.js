"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuleContext = void 0;
const models_1 = require("@onlook/models");
const icons_1 = require("@onlook/ui/icons");
const helpers_1 = require("../../prompt/helpers");
const base_1 = require("../models/base");
class AgentRuleContext extends base_1.BaseContext {
    static contextType = models_1.MessageContextType.AGENT_RULE;
    static displayName = 'Agent Rule';
    static icon = icons_1.Icons.Cube;
    static agentRulesContextPrefix = `These are user provided rules for the project`;
    static getPrompt(context) {
        return `${context.path}\n${context.content}`;
    }
    static getLabel(context) {
        return context.displayName || context.path;
    }
    /**
     * Generate multiple agent rules content
     */
    static getAgentRulesContent(agentRules) {
        let content = `${AgentRuleContext.agentRulesContextPrefix}\n`;
        const rulePrompts = agentRules.map(agentRule => AgentRuleContext.getPrompt(agentRule));
        content += rulePrompts.join('\n');
        return (0, helpers_1.wrapXml)('agent-rules', content);
    }
}
exports.AgentRuleContext = AgentRuleContext;
//# sourceMappingURL=agent-rule.js.map