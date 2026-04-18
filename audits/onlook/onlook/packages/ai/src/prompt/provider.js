"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemPrompt = getSystemPrompt;
exports.getCreatePageSystemPrompt = getCreatePageSystemPrompt;
exports.getSuggestionSystemPrompt = getSuggestionSystemPrompt;
exports.getAskModeSystemPrompt = getAskModeSystemPrompt;
exports.getExampleConversation = getExampleConversation;
exports.getHydratedUserMessage = getHydratedUserMessage;
exports.getLanguageFromFilePath = getLanguageFromFilePath;
exports.getBranchContent = getBranchContent;
exports.getSummaryPrompt = getSummaryPrompt;
const models_1 = require("@onlook/models");
const classes_1 = require("../contexts/classes");
const constants_1 = require("./constants");
const helpers_1 = require("./helpers");
function getSystemPrompt() {
    let prompt = '';
    prompt += (0, helpers_1.wrapXml)('role', constants_1.SYSTEM_PROMPT);
    prompt += (0, helpers_1.wrapXml)('shell', constants_1.SHELL_PROMPT);
    return prompt;
}
function getCreatePageSystemPrompt() {
    let prompt = getSystemPrompt() + '\n\n';
    prompt += (0, helpers_1.wrapXml)('create-system-prompt', constants_1.CREATE_NEW_PAGE_SYSTEM_PROMPT);
    return prompt;
}
function getSuggestionSystemPrompt() {
    let prompt = '';
    prompt += (0, helpers_1.wrapXml)('role', constants_1.SUGGESTION_SYSTEM_PROMPT);
    return prompt;
}
function getAskModeSystemPrompt() {
    let prompt = '';
    prompt += (0, helpers_1.wrapXml)('role', constants_1.ASK_MODE_SYSTEM_PROMPT);
    return prompt;
}
function getExampleConversation(conversation) {
    let prompt = '';
    for (const message of conversation) {
        prompt += `${message.role.toUpperCase()}: ${message.content}\n`;
    }
    return prompt;
}
function getHydratedUserMessage(id, parts, context, opt) {
    let userParts = [];
    const files = context.filter((c) => c.type === models_1.MessageContextType.FILE).map((c) => c);
    const highlights = context.filter((c) => c.type === models_1.MessageContextType.HIGHLIGHT).map((c) => c);
    const errors = context.filter((c) => c.type === models_1.MessageContextType.ERROR).map((c) => c);
    const agentRules = context.filter((c) => c.type === models_1.MessageContextType.AGENT_RULE).map((c) => c);
    const allImages = context.filter((c) => c.type === models_1.MessageContextType.IMAGE).map((c) => c);
    const externalImages = allImages.filter((img) => img.source === 'external');
    const localImages = allImages.filter((img) => img.source === 'local');
    const branches = context.filter((c) => c.type === models_1.MessageContextType.BRANCH).map((c) => c);
    // If there are 50 user messages in the contexts, we can trim all of them except
    // the last one. The logic could be adjusted to trim more or less messages.
    const truncateFileContext = opt.currentMessageIndex < opt.lastUserMessageIndex;
    // Should the code need to trim other types of contexts, it can be done here.
    let prompt = '';
    if (truncateFileContext) {
        const contextPrompt = classes_1.FileContext.getTruncatedFilesContent(files);
        if (contextPrompt) {
            prompt += (0, helpers_1.wrapXml)('truncated-context', contextPrompt);
        }
    }
    else {
        const contextPrompt = classes_1.FileContext.getFilesContent(files, highlights);
        if (contextPrompt) {
            prompt += (0, helpers_1.wrapXml)('context', contextPrompt);
        }
    }
    if (errors.length > 0) {
        const errorPrompt = classes_1.ErrorContext.getErrorsContent(errors);
        prompt += errorPrompt;
    }
    if (agentRules.length > 0) {
        const agentRulePrompt = classes_1.AgentRuleContext.getAgentRulesContent(agentRules);
        prompt += agentRulePrompt;
    }
    if (branches.length > 0) {
        const branchPrompt = classes_1.BranchContext.getBranchesContent(branches);
        prompt += branchPrompt;
    }
    if (localImages.length > 0) {
        const localImageList = localImages
            .map((img) => `- ${img.displayName}: ${img.path} (branch: ${img.branchId})`)
            .join('\n');
        prompt += (0, helpers_1.wrapXml)('local-images', 'These images already exist in the project at the specified paths. Reference them directly in your code without uploading:\n' + localImageList);
    }
    if (externalImages.length > 0) {
        const imageList = externalImages
            .map((img, idx) => `${idx + 1}. ${img.displayName} (ID: ${img.id || 'unknown'})`)
            .join('\n');
        prompt += (0, helpers_1.wrapXml)('available-images', 'These are new images that need to be uploaded to the project using the upload_image tool:\n' + imageList);
    }
    const textContent = parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text)
        .join('\n');
    prompt += (0, helpers_1.wrapXml)('instruction', textContent);
    userParts.push({ type: 'text', text: prompt });
    if (allImages.length > 0) {
        const fileParts = classes_1.ImageContext.toFileUIParts(allImages);
        userParts = userParts.concat(fileParts);
    }
    return {
        id,
        role: 'user',
        parts: userParts,
    };
}
function getLanguageFromFilePath(filePath) {
    return filePath.split('.').pop() ?? '';
}
function getBranchContent(id) {
    return (0, helpers_1.wrapXml)('branch', `id: "${id}"`);
}
function getSummaryPrompt() {
    let prompt = '';
    prompt += (0, helpers_1.wrapXml)('summary-rules', constants_1.SUMMARY_PROMPTS.rules);
    prompt += (0, helpers_1.wrapXml)('summary-guidelines', constants_1.SUMMARY_PROMPTS.guidelines);
    prompt += (0, helpers_1.wrapXml)('summary-format', constants_1.SUMMARY_PROMPTS.format);
    prompt += (0, helpers_1.wrapXml)('summary-reminder', constants_1.SUMMARY_PROMPTS.reminder);
    prompt += (0, helpers_1.wrapXml)('example-summary-output', 'EXAMPLE SUMMARY:\n' + constants_1.SUMMARY_PROMPTS.summary);
    return prompt;
}
//# sourceMappingURL=provider.js.map