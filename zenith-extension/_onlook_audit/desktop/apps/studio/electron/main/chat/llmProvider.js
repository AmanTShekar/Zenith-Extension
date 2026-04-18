"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = initModel;
const anthropic_1 = require("@ai-sdk/anthropic");
const constants_1 = require("@onlook/models/constants");
const llm_1 = require("@onlook/models/llm");
const auth_1 = require("../auth");
async function initModel(provider, model, payload) {
    switch (provider) {
        case llm_1.LLMProvider.ANTHROPIC:
            return await getAnthropicProvider(model, payload);
        default:
            throw new Error(`Unsupported provider: ${provider}`);
    }
}
async function getAnthropicProvider(model, payload) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const proxyUrl = `${import.meta.env.VITE_SUPABASE_API_URL}${constants_1.FUNCTIONS_ROUTE}${constants_1.BASE_PROXY_ROUTE}${constants_1.ProxyRoutes.ANTHROPIC}`;
    const config = {};
    if (apiKey) {
        config.apiKey = apiKey;
    }
    else {
        const authTokens = await (0, auth_1.getRefreshedAuthTokens)();
        if (!authTokens) {
            throw new Error('No auth tokens found');
        }
        config.apiKey = '';
        config.baseURL = proxyUrl;
        config.headers = {
            Authorization: `Bearer ${authTokens.accessToken}`,
            'X-Onlook-Request-Type': payload.requestType,
            'anthropic-beta': 'output-128k-2025-02-19',
        };
    }
    const anthropic = (0, anthropic_1.createAnthropic)(config);
    return anthropic(model, {
        cacheControl: true,
    });
}
//# sourceMappingURL=llmProvider.js.map