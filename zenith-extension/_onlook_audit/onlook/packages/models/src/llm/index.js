"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_MAX_TOKENS = exports.OPENROUTER_MODELS = exports.LLMProvider = void 0;
var LLMProvider;
(function (LLMProvider) {
    LLMProvider["OPENROUTER"] = "openrouter";
})(LLMProvider || (exports.LLMProvider = LLMProvider = {}));
var OPENROUTER_MODELS;
(function (OPENROUTER_MODELS) {
    // Generate object does not work for Anthropic models https://github.com/OpenRouterTeam/ai-sdk-provider/issues/165
    OPENROUTER_MODELS["CLAUDE_4_5_SONNET"] = "anthropic/claude-sonnet-4.5";
    OPENROUTER_MODELS["CLAUDE_3_5_HAIKU"] = "anthropic/claude-3.5-haiku";
    OPENROUTER_MODELS["OPEN_AI_GPT_5"] = "openai/gpt-5";
    OPENROUTER_MODELS["OPEN_AI_GPT_5_MINI"] = "openai/gpt-5-mini";
    OPENROUTER_MODELS["OPEN_AI_GPT_5_NANO"] = "openai/gpt-5-nano";
})(OPENROUTER_MODELS || (exports.OPENROUTER_MODELS = OPENROUTER_MODELS = {}));
exports.MODEL_MAX_TOKENS = {
    [OPENROUTER_MODELS.CLAUDE_4_5_SONNET]: 200000,
    [OPENROUTER_MODELS.CLAUDE_3_5_HAIKU]: 200000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5_NANO]: 400000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5_MINI]: 400000,
    [OPENROUTER_MODELS.OPEN_AI_GPT_5]: 400000,
};
//# sourceMappingURL=index.js.map