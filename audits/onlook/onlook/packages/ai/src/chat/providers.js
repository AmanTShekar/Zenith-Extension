"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = initModel;
const models_1 = require("@onlook/models");
const utility_1 = require("@onlook/utility");
const ai_sdk_provider_1 = require("@openrouter/ai-sdk-provider");
function initModel({ provider: requestedProvider, model: requestedModel, }) {
    let model;
    let providerOptions;
    let headers;
    let maxOutputTokens = models_1.MODEL_MAX_TOKENS[requestedModel];
    switch (requestedProvider) {
        case models_1.LLMProvider.OPENROUTER:
            model = getOpenRouterProvider(requestedModel);
            headers = {
                'HTTP-Referer': 'https://onlook.com',
                'X-Title': 'Onlook',
            };
            providerOptions = {
                openrouter: { transforms: ['middle-out'] },
            };
            const isAnthropic = requestedModel === models_1.OPENROUTER_MODELS.CLAUDE_4_5_SONNET || requestedModel === models_1.OPENROUTER_MODELS.CLAUDE_3_5_HAIKU;
            providerOptions = isAnthropic
                ? { ...providerOptions, anthropic: { cacheControl: { type: 'ephemeral' } } }
                : providerOptions;
            break;
        default:
            (0, utility_1.assertNever)(requestedProvider);
    }
    return {
        model,
        providerOptions,
        headers,
        maxOutputTokens,
    };
}
function getOpenRouterProvider(model) {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY must be set');
    }
    const openrouter = (0, ai_sdk_provider_1.createOpenRouter)({ apiKey: process.env.OPENROUTER_API_KEY });
    return openrouter(model);
}
//# sourceMappingURL=providers.js.map