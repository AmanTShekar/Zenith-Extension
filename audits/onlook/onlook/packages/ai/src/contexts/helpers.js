"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContextClass = getContextClass;
exports.getContextPrompt = getContextPrompt;
exports.getContextLabel = getContextLabel;
const models_1 = require("@onlook/models");
const classes_1 = require("./classes");
const CONTEXT_CLASSES_MAP = new Map(Object.entries({
    [models_1.MessageContextType.FILE]: classes_1.FileContext,
    [models_1.MessageContextType.HIGHLIGHT]: classes_1.HighlightContext,
    [models_1.MessageContextType.ERROR]: classes_1.ErrorContext,
    [models_1.MessageContextType.BRANCH]: classes_1.BranchContext,
    [models_1.MessageContextType.IMAGE]: classes_1.ImageContext,
    [models_1.MessageContextType.AGENT_RULE]: classes_1.AgentRuleContext,
}));
function getContextClass(type) {
    return CONTEXT_CLASSES_MAP.get(type);
}
// Utility functions for cases where type is determined at runtime
function getContextPrompt(context) {
    try {
        const contextClass = getContextClass(context.type);
        if (!contextClass) {
            throw new Error(`No context class found for type: ${context.type}`);
        }
        return contextClass.getPrompt(context);
    }
    catch (error) {
        console.error('Error getting context prompt:', error);
        return 'unknown context';
    }
}
function getContextLabel(context) {
    try {
        const contextClass = getContextClass(context.type);
        if (!contextClass) {
            throw new Error(`No context class found for type: ${context.type}`);
        }
        return contextClass.getLabel(context);
    }
    catch (error) {
        console.error('Error getting context label:', error);
        return 'unknown context';
    }
}
//# sourceMappingURL=helpers.js.map