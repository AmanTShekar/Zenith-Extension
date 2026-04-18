"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const gpt_tokenizer_1 = require("gpt-tokenizer");
const index_ts_1 = require("../src/tokens/index.ts");
function createMessage(parts, role = 'user') {
    return {
        id: 'test-id',
        createdAt: new Date(),
        role,
        threadId: 'test-thread',
        parts,
        metadata: { context: [], checkpoints: [] },
    };
}
(0, bun_test_1.describe)('countTokensWithRoles', () => {
    (0, bun_test_1.test)('counts tokens for single text message', async () => {
        const text = 'hello world';
        const messages = [createMessage([{ type: 'text', text }])];
        const result = await (0, index_ts_1.countTokensWithRoles)(messages);
        // perMessageExtra (4) + perReplyExtra (2)
        const expected = (0, gpt_tokenizer_1.encode)(text).length + 4 + 2;
        (0, bun_test_1.expect)(result).toBe(expected);
    });
    (0, bun_test_1.test)('counts tokens across multiple messages', async () => {
        const t1 = 'first';
        const t2 = 'second';
        const messages = [
            createMessage([{ type: 'text', text: t1 }], 'user'),
            createMessage([{ type: 'text', text: t2 }], 'assistant'),
        ];
        const result = await (0, index_ts_1.countTokensWithRoles)(messages);
        const expected = (0, gpt_tokenizer_1.encode)(t1).length + (0, gpt_tokenizer_1.encode)(t2).length + 4 * 2 + 2;
        (0, bun_test_1.expect)(result).toBe(expected);
    });
    (0, bun_test_1.test)('counts tokens for mixed parts (text + tool-invocation)', async () => {
        const text = 'compute sum';
        const invocation = { name: 'sum', args: { a: 1, b: 2 } };
        const messages = [
            createMessage([
                { type: 'text', text },
                { type: 'tool-sum', input: invocation },
            ]),
        ];
        const result = await (0, index_ts_1.countTokensWithRoles)(messages);
        const joined = text + JSON.stringify(invocation);
        const expected = (0, gpt_tokenizer_1.encode)(joined).length + 4 + 2;
        (0, bun_test_1.expect)(result).toBe(expected);
    });
    (0, bun_test_1.test)('ignores unknown part types', async () => {
        const text = 'visible text';
        const unknownPart = { type: 'image', url: 'http://example.com/image.png' };
        const messages = [createMessage([{ type: 'text', text }, unknownPart])];
        const result = await (0, index_ts_1.countTokensWithRoles)(messages);
        const expected = (0, gpt_tokenizer_1.encode)(text).length + 4 + 2;
        (0, bun_test_1.expect)(result).toBe(expected);
    });
    (0, bun_test_1.test)('handles empty parts array', async () => {
        const messages = [createMessage([])];
        const result = await (0, index_ts_1.countTokensWithRoles)(messages);
        // Only overheads: perMessageExtra (4) + perReplyExtra (2)
        const expected = 4 + 2;
        (0, bun_test_1.expect)(result).toBe(expected);
    });
});
//# sourceMappingURL=tokens.test.js.map