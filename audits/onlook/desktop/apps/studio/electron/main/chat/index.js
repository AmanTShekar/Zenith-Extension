"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const provider_1 = require("@onlook/ai/src/prompt/provider");
const tools_1 = require("@onlook/ai/src/tools");
const models_1 = require("@onlook/models");
const chat_1 = require("@onlook/models/chat");
const constants_1 = require("@onlook/models/constants");
const ai_1 = require("ai");
const __1 = require("..");
const storage_1 = require("../storage");
const llmProvider_1 = require("./llmProvider");
class LlmManager {
    static instance;
    abortController = null;
    useAnalytics = true;
    promptProvider;
    constructor() {
        this.restoreSettings();
        this.promptProvider = new provider_1.PromptProvider();
    }
    restoreSettings() {
        const settings = storage_1.PersistentStorage.USER_SETTINGS.read() || {};
        const enable = settings.enableAnalytics !== undefined ? settings.enableAnalytics : true;
        if (enable) {
            this.useAnalytics = true;
        }
        else {
            this.useAnalytics = false;
        }
    }
    toggleAnalytics(enable) {
        this.useAnalytics = enable;
    }
    static getInstance() {
        if (!LlmManager.instance) {
            LlmManager.instance = new LlmManager();
        }
        return LlmManager.instance;
    }
    async stream(messages, requestType, options) {
        const { abortController, skipSystemPrompt } = options || {};
        this.abortController = abortController || new AbortController();
        try {
            if (!skipSystemPrompt) {
                const systemMessage = {
                    role: 'system',
                    content: this.promptProvider.getSystemPrompt(process.platform),
                    experimental_providerMetadata: {
                        anthropic: { cacheControl: { type: 'ephemeral' } },
                    },
                };
                messages = [systemMessage, ...messages];
            }
            const model = await (0, llmProvider_1.initModel)(models_1.LLMProvider.ANTHROPIC, models_1.CLAUDE_MODELS.SONNET_4, {
                requestType,
            });
            const { usage, fullStream, text, response } = await (0, ai_1.streamText)({
                model,
                messages,
                abortSignal: this.abortController?.signal,
                maxSteps: 10,
                tools: tools_1.chatToolSet,
                maxTokens: 64000,
                onStepFinish: ({ toolResults }) => {
                    for (const toolResult of toolResults) {
                        this.emitMessagePart(toolResult);
                    }
                },
                onError: (error) => {
                    throw error;
                },
                experimental_repairToolCall: async ({ toolCall, tools, parameterSchema, error, }) => {
                    if (ai_1.NoSuchToolError.isInstance(error)) {
                        console.error('Invalid tool name', toolCall.toolName);
                        return null; // do not attempt to fix invalid tool names
                    }
                    const tool = tools[toolCall.toolName];
                    console.warn(`Invalid parameter for tool ${toolCall.toolName} with args ${JSON.stringify(toolCall.args)}, attempting to fix`);
                    const { object: repairedArgs } = await (0, ai_1.generateObject)({
                        model,
                        schema: tool.parameters,
                        prompt: [
                            `The model tried to call the tool "${toolCall.toolName}"` +
                                ` with the following arguments:`,
                            JSON.stringify(toolCall.args),
                            `The tool accepts the following schema:`,
                            JSON.stringify(parameterSchema(toolCall)),
                            'Please fix the arguments.',
                        ].join('\n'),
                    });
                    return { ...toolCall, args: JSON.stringify(repairedArgs) };
                },
            });
            const streamParts = [];
            for await (const partialStream of fullStream) {
                this.emitMessagePart(partialStream);
                streamParts.push(partialStream);
            }
            return {
                payload: (await response).messages,
                type: 'full',
                usage: await usage,
                text: await text,
            };
        }
        catch (error) {
            try {
                if (error?.error?.statusCode) {
                    if (error?.error?.statusCode === 403) {
                        const rateLimitError = JSON.parse(error.error.responseBody);
                        return {
                            type: 'rate-limited',
                            rateLimitResult: rateLimitError,
                        };
                    }
                }
                if (ai_1.RetryError.isInstance(error.error)) {
                    const parsed = JSON.parse(error.error.lastError.responseBody);
                    return { message: parsed.error.message, type: 'error' };
                }
                if (error.error instanceof DOMException) {
                    return { message: 'Request aborted', type: 'error' };
                }
                if (error.name === 'AbortError') {
                    return { message: 'Request aborted', type: 'error' };
                }
                return { message: JSON.stringify(error), type: 'error' };
            }
            catch (parseError) {
                console.error('Error parsing error', parseError);
                return { message: JSON.stringify(parseError), type: 'error' };
            }
            finally {
                this.abortController?.abort();
                this.abortController = null;
            }
        }
    }
    abortStream() {
        if (this.abortController) {
            this.abortController.abort();
            return true;
        }
        return false;
    }
    emitMessagePart(streamPart) {
        const res = {
            type: 'partial',
            payload: streamPart,
        };
        __1.mainWindow?.webContents.send(constants_1.MainChannels.CHAT_STREAM_PARTIAL, res);
    }
    async generateSuggestions(messages) {
        try {
            const model = await (0, llmProvider_1.initModel)(models_1.LLMProvider.ANTHROPIC, models_1.CLAUDE_MODELS.HAIKU, {
                requestType: chat_1.StreamRequestType.SUGGESTIONS,
            });
            const { object } = await (0, ai_1.generateObject)({
                model,
                output: 'array',
                schema: chat_1.ChatSuggestionSchema,
                messages,
            });
            return object;
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }
    async generateChatSummary(messages) {
        try {
            const model = await (0, llmProvider_1.initModel)(models_1.LLMProvider.ANTHROPIC, models_1.CLAUDE_MODELS.HAIKU, {
                requestType: chat_1.StreamRequestType.SUMMARY,
            });
            const systemMessage = {
                role: 'system',
                content: this.promptProvider.getSummaryPrompt(),
                experimental_providerMetadata: {
                    anthropic: { cacheControl: { type: 'ephemeral' } },
                },
            };
            // Transform messages to emphasize they are historical content
            const conversationMessages = messages
                .filter((msg) => msg.role !== 'tool')
                .map((msg) => {
                const prefix = '[HISTORICAL CONTENT] ';
                const content = typeof msg.content === 'string' ? prefix + msg.content : msg.content;
                return {
                    ...msg,
                    content,
                };
            });
            const { object } = await (0, ai_1.generateObject)({
                model,
                schema: chat_1.ChatSummarySchema,
                messages: [
                    { role: 'system', content: systemMessage.content },
                    ...conversationMessages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                ],
            });
            const { filesDiscussed, projectContext, implementationDetails, userPreferences, currentStatus, } = object;
            // Formats the structured object into the desired text format
            const summary = `# Files Discussed
${filesDiscussed.join('\n')}

# Project Context
${projectContext}

# Implementation Details
${implementationDetails}

# User Preferences
${userPreferences}

# Current Status
${currentStatus}`;
            return summary;
        }
        catch (error) {
            console.error('Error generating summary:', error);
            return null;
        }
    }
}
exports.default = LlmManager.getInstance();
//# sourceMappingURL=index.js.map