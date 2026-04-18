"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureToolCallResults = exports.extractTextFromParts = exports.toStreamMessage = void 0;
exports.convertToStreamMessages = convertToStreamMessages;
const ai_1 = require("ai");
const prompt_1 = require("../prompt");
function convertToStreamMessages(messages) {
    const totalMessages = messages.length;
    const lastUserMessageIndex = messages.findLastIndex((message) => message.role === 'user');
    const lastAssistantMessageIndex = messages.findLastIndex((message) => message.role === 'assistant');
    const streamMessages = messages.map((message, index) => {
        const opt = {
            totalMessages,
            currentMessageIndex: index,
            lastUserMessageIndex,
            lastAssistantMessageIndex,
        };
        return (0, exports.toStreamMessage)(message, opt);
    });
    return (0, ai_1.convertToModelMessages)(streamMessages);
}
const toStreamMessage = (message, opt) => {
    if (message.role === 'assistant') {
        return {
            ...message,
            parts: (0, exports.ensureToolCallResults)(message.parts),
        };
    }
    else if (message.role === 'user') {
        const hydratedMessage = (0, prompt_1.getHydratedUserMessage)(message.id, message.parts, message.metadata?.context ?? [], opt);
        return hydratedMessage;
    }
    return message;
};
exports.toStreamMessage = toStreamMessage;
const extractTextFromParts = (parts) => {
    return parts
        ?.map((part) => {
        if (part.type === 'text') {
            return part.text;
        }
        return '';
    })
        .join('');
};
exports.extractTextFromParts = extractTextFromParts;
const ensureToolCallResults = (parts) => {
    if (!parts)
        return parts;
    const toolResultIds = new Set();
    // First pass: identify which tool calls already have results
    parts.forEach((part) => {
        if (part.type?.startsWith('tool-')) {
            const toolPart = part;
            if (toolPart.toolCallId && toolPart.state === 'output-available') {
                toolResultIds.add(toolPart.toolCallId);
            }
        }
    });
    // Second pass: update parts that need stub results
    return parts.map((part) => {
        if (part.type?.startsWith('tool-')) {
            const toolPart = part;
            if (toolPart.toolCallId &&
                (toolPart.state === 'input-available' || toolPart.state === 'input-streaming') &&
                !toolResultIds.has(toolPart.toolCallId)) {
                // Update existing part to have stub result
                return {
                    ...toolPart,
                    state: 'output-available',
                    output: 'No tool result returned',
                };
            }
        }
        return part;
    });
};
exports.ensureToolCallResults = ensureToolCallResults;
//# sourceMappingURL=index.js.map