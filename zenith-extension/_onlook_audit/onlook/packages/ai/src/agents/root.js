"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairToolCall = exports.createRootAgentStream = void 0;
const models_1 = require("@onlook/models");
const ai_1 = require("ai");
const index_1 = require("../index");
const createRootAgentStream = ({ chatType, conversationId, projectId, userId, traceId, messages, }) => {
    const modelConfig = getModelFromType(chatType);
    const systemPrompt = getSystemPromptFromType(chatType);
    const toolSet = (0, index_1.getToolSetFromType)(chatType);
    return (0, ai_1.streamText)({
        providerOptions: modelConfig.providerOptions,
        messages: (0, index_1.convertToStreamMessages)(messages),
        model: modelConfig.model,
        system: systemPrompt,
        tools: toolSet,
        headers: modelConfig.headers,
        stopWhen: (0, ai_1.stepCountIs)(20),
        experimental_repairToolCall: exports.repairToolCall,
        experimental_transform: (0, ai_1.smoothStream)(),
        experimental_telemetry: {
            isEnabled: true,
            metadata: {
                conversationId,
                projectId,
                userId,
                chatType: chatType,
                tags: ['chat'],
                langfuseTraceId: traceId,
                sessionId: conversationId,
            },
        },
    });
};
exports.createRootAgentStream = createRootAgentStream;
const getSystemPromptFromType = (chatType) => {
    switch (chatType) {
        case models_1.ChatType.CREATE:
            return (0, index_1.getCreatePageSystemPrompt)();
        case models_1.ChatType.ASK:
            return (0, index_1.getAskModeSystemPrompt)();
        case models_1.ChatType.EDIT:
        default:
            return (0, index_1.getSystemPrompt)();
    }
};
const getModelFromType = (chatType) => {
    switch (chatType) {
        case models_1.ChatType.CREATE:
        case models_1.ChatType.FIX:
            return (0, index_1.initModel)({
                provider: models_1.LLMProvider.OPENROUTER,
                model: models_1.OPENROUTER_MODELS.OPEN_AI_GPT_5,
            });
        case models_1.ChatType.ASK:
        case models_1.ChatType.EDIT:
        default:
            return (0, index_1.initModel)({
                provider: models_1.LLMProvider.OPENROUTER,
                model: models_1.OPENROUTER_MODELS.CLAUDE_4_5_SONNET,
            });
    }
};
const repairToolCall = async ({ toolCall, tools, error }) => {
    if (ai_1.NoSuchToolError.isInstance(error)) {
        throw new Error(`Tool "${toolCall.toolName}" not found. Available tools: ${Object.keys(tools).join(', ')}`);
    }
    const tool = tools[toolCall.toolName];
    if (!tool?.inputSchema) {
        throw new Error(`Tool "${toolCall.toolName}" has no input schema`);
    }
    console.warn(`Invalid parameter for tool ${toolCall.toolName} with args ${JSON.stringify(toolCall.input)}, attempting to fix`);
    const { model } = (0, index_1.initModel)({
        provider: models_1.LLMProvider.OPENROUTER,
        model: models_1.OPENROUTER_MODELS.OPEN_AI_GPT_5_NANO,
    });
    const { object: repairedArgs } = await (0, ai_1.generateObject)({
        model,
        schema: tool.inputSchema,
        prompt: [
            `The model tried to call the tool "${toolCall.toolName}"` +
                ` with the following arguments:`,
            JSON.stringify(toolCall.input),
            `The tool accepts the following schema:`,
            JSON.stringify(tool?.inputSchema),
            'Please fix the inputs. Return the fixed inputs as a JSON object, DO NOT include any other text.',
        ].join('\n'),
    });
    return {
        type: 'tool-call',
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        input: JSON.stringify(repairedArgs),
    };
};
exports.repairToolCall = repairToolCall;
//# sourceMappingURL=root.js.map