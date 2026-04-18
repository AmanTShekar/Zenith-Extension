"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FastApplyProvider = void 0;
exports.applyCodeChangeWithMorph = applyCodeChangeWithMorph;
exports.applyCodeChangeWithRelace = applyCodeChangeWithRelace;
exports.applyCodeChange = applyCodeChange;
const openai_1 = __importDefault(require("openai"));
const createPrompt = (originalCode, updateSnippet, instruction) => `<instruction>${instruction}</instruction>\n<code>${originalCode}</code>\n<update>${updateSnippet}</update>`;
var FastApplyProvider;
(function (FastApplyProvider) {
    FastApplyProvider["MORPH"] = "morph";
    FastApplyProvider["RELACE"] = "relace";
})(FastApplyProvider || (exports.FastApplyProvider = FastApplyProvider = {}));
async function applyCodeChangeWithMorph(originalCode, updateSnippet, instruction) {
    const apiKey = process.env.MORPH_API_KEY;
    if (!apiKey) {
        throw new Error('MORPH_API_KEY is not set');
    }
    const client = new openai_1.default({
        apiKey,
        baseURL: 'https://api.morphllm.com/v1',
    });
    const response = await client.chat.completions.create({
        model: 'morph-v3-large',
        messages: [
            {
                role: 'user',
                content: createPrompt(originalCode, updateSnippet, instruction),
            },
        ],
    });
    return response.choices[0]?.message.content || null;
}
async function applyCodeChangeWithRelace(originalCode, updateSnippet, instruction, metadata) {
    const apiKey = process.env.RELACE_API_KEY;
    if (!apiKey) {
        throw new Error('RELACE_API_KEY is not set');
    }
    const url = 'https://instantapply.endpoint.relace.run/v1/code/apply';
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
    };
    const data = {
        initialCode: originalCode,
        editSnippet: updateSnippet,
        instructions: instruction,
        relaceMetadata: metadata
            ? {
                onlookUserId: metadata.userId,
                onlookProjectId: metadata.projectId,
                onlookConversationId: metadata.conversationId,
            }
            : undefined,
    };
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`Failed to apply code change: ${response.status}`);
    }
    const result = await response.json();
    return result.mergedCode;
}
async function applyCodeChange(originalCode, updateSnippet, instruction, metadata, preferredProvider = FastApplyProvider.MORPH) {
    const providerAttempts = [
        {
            provider: preferredProvider,
            applyFn: preferredProvider === FastApplyProvider.MORPH
                ? applyCodeChangeWithMorph
                : applyCodeChangeWithRelace,
        },
        {
            provider: preferredProvider === FastApplyProvider.MORPH
                ? FastApplyProvider.RELACE
                : FastApplyProvider.MORPH,
            applyFn: preferredProvider === FastApplyProvider.MORPH
                ? applyCodeChangeWithRelace
                : applyCodeChangeWithMorph,
        },
    ];
    // Run provider attempts in order of preference
    for (const { provider, applyFn } of providerAttempts) {
        try {
            const result = provider === FastApplyProvider.MORPH
                ? await applyFn(originalCode, updateSnippet, instruction)
                : await applyFn(originalCode, updateSnippet, instruction, metadata);
            if (result)
                return result;
        }
        catch (error) {
            console.warn(`Code application failed with provider ${provider}:`, error);
            throw error;
        }
    }
    return null;
}
//# sourceMappingURL=client.js.map