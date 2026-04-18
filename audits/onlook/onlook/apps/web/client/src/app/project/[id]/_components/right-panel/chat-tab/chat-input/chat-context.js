"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatContextWindow = void 0;
const models_1 = require("@onlook/models");
const context_1 = require("@onlook/ui/ai-elements/context");
const react_1 = require("react");
const ChatContextWindow = ({ usage }) => {
    const showCost = false;
    // Hardcoded for now, but should be dynamic based on the model used
    const maxTokens = models_1.MODEL_MAX_TOKENS[models_1.OPENROUTER_MODELS.CLAUDE_4_5_SONNET];
    const usedTokens = (0, react_1.useMemo)(() => {
        if (!usage)
            return 0;
        const input = usage.inputTokens ?? 0;
        const cached = usage.cachedInputTokens ?? 0;
        return input + cached;
    }, [usage]);
    return (<context_1.Context maxTokens={maxTokens} usedTokens={usedTokens} usage={usage}>
            <context_1.ContextTrigger />
            <context_1.ContextContent>
                <context_1.ContextContentHeader />
                <context_1.ContextContentBody>
                    <context_1.ContextInputUsage />
                    <context_1.ContextOutputUsage />
                    <context_1.ContextReasoningUsage />
                    <context_1.ContextCacheUsage />
                </context_1.ContextContentBody>
                {showCost && <context_1.ContextContentFooter />}
            </context_1.ContextContent>
        </context_1.Context>);
};
exports.ChatContextWindow = ChatContextWindow;
//# sourceMappingURL=chat-context.js.map