"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const stream_1 = require("../../src/stream");
function createMessage(id, role, parts, context = []) {
    return {
        id,
        role: role === 'user' ? 'user' : 'assistant',
        threadId: 't1',
        parts,
        metadata: { context, snapshots: [] },
    };
}
(0, bun_test_1.describe)('convertToStreamMessages', () => {
    (0, bun_test_1.test)('converts ChatMessage array to ModelMessage array', () => {
        const userMessage = createMessage('u1', 'user', [{ type: 'text', text: 'Hello' }], []);
        const assistantMessage = createMessage('a1', 'assistant', [
            { type: 'text', text: 'Hi there!' },
        ]);
        const result = (0, stream_1.convertToStreamMessages)([userMessage, assistantMessage]);
        (0, bun_test_1.expect)(result).toBeDefined();
        (0, bun_test_1.expect)(Array.isArray(result)).toBe(true);
        (0, bun_test_1.expect)(result.length).toBe(2);
    });
    (0, bun_test_1.test)('preserves assistant message parts unchanged', () => {
        const assistantMessage = createMessage('a1', 'assistant', [
            { type: 'text', text: 'Found results' },
        ]);
        const result = (0, stream_1.convertToStreamMessages)([assistantMessage]);
        const resultMessage = result[0];
        (0, bun_test_1.expect)(resultMessage).toBeDefined();
        (0, bun_test_1.expect)(resultMessage?.role).toBe('assistant');
        (0, bun_test_1.expect)(resultMessage?.content).toBeDefined();
    });
    (0, bun_test_1.test)('hydrates user messages with context information', () => {
        const fileCtx = (path, content) => ({
            type: 'file',
            path,
            content,
            displayName: path,
        });
        const userMessage = createMessage('u1', 'user', [{ type: 'text', text: 'Update this file' }], [fileCtx('test.ts', 'console.log("test");')]);
        const result = (0, stream_1.convertToStreamMessages)([userMessage]);
        const resultMessage = result[0];
        (0, bun_test_1.expect)(resultMessage).toBeDefined();
        (0, bun_test_1.expect)(resultMessage?.role).toBe('user');
        (0, bun_test_1.expect)(resultMessage?.content).toBeDefined();
        // The content should contain the file context
        (0, bun_test_1.expect)(resultMessage?.content).toBeDefined();
    });
    (0, bun_test_1.test)('handles empty context arrays', () => {
        const userMessage = createMessage('u1', 'user', [{ type: 'text', text: 'Simple message' }], []);
        const result = (0, stream_1.convertToStreamMessages)([userMessage]);
        const resultMessage = result[0];
        (0, bun_test_1.expect)(resultMessage).toBeDefined();
        (0, bun_test_1.expect)(resultMessage?.role).toBe('user');
        (0, bun_test_1.expect)(resultMessage?.content).toBeDefined();
    });
    (0, bun_test_1.test)('handles mixed message types in sequence', () => {
        const user1 = createMessage('u1', 'user', [{ type: 'text', text: 'First question' }], []);
        const assistant1 = createMessage('a1', 'assistant', [
            { type: 'text', text: 'First answer' },
        ]);
        const user2 = createMessage('u2', 'user', [{ type: 'text', text: 'Second question' }], []);
        const result = (0, stream_1.convertToStreamMessages)([user1, assistant1, user2]);
        (0, bun_test_1.expect)(result.length).toBe(3);
        (0, bun_test_1.expect)(result[0]?.role).toBe('user');
        (0, bun_test_1.expect)(result[1]?.role).toBe('assistant');
        (0, bun_test_1.expect)(result[2]?.role).toBe('user');
    });
    (0, bun_test_1.test)('handles messages with various part types', () => {
        const userMessage = createMessage('u1', 'user', [{ type: 'text', text: 'Hello world' }], []);
        const result = (0, stream_1.convertToStreamMessages)([userMessage]);
        (0, bun_test_1.expect)(result).toBeDefined();
        (0, bun_test_1.expect)(Array.isArray(result)).toBe(true);
        (0, bun_test_1.expect)(result.length).toBe(1);
        (0, bun_test_1.expect)(result[0]?.role).toBe('user');
    });
});
(0, bun_test_1.describe)('extractTextFromParts', () => {
    (0, bun_test_1.test)('extracts text from text parts', () => {
        const parts = [
            { type: 'text', text: 'Hello' },
            { type: 'text', text: 'World' },
        ];
        const result = (0, stream_1.extractTextFromParts)(parts);
        (0, bun_test_1.expect)(result).toBe('HelloWorld');
    });
    (0, bun_test_1.test)('handles non-text parts by returning empty string', () => {
        const parts = [
            { type: 'reasoning', reasoning: 'Some reasoning' },
            { type: 'text', text: 'Hello' },
        ];
        const result = (0, stream_1.extractTextFromParts)(parts);
        (0, bun_test_1.expect)(result).toBe('Hello');
    });
    (0, bun_test_1.test)('returns empty string for empty parts array', () => {
        const result = (0, stream_1.extractTextFromParts)([]);
        (0, bun_test_1.expect)(result).toBe('');
    });
    (0, bun_test_1.test)('handles undefined parts', () => {
        const result = (0, stream_1.extractTextFromParts)(undefined);
        (0, bun_test_1.expect)(result).toBeUndefined();
    });
});
(0, bun_test_1.describe)('ensureToolCallResults', () => {
    (0, bun_test_1.test)('returns unchanged parts when undefined', () => {
        const result = (0, stream_1.ensureToolCallResults)(undefined);
        (0, bun_test_1.expect)(result).toBeUndefined();
    });
    (0, bun_test_1.test)('returns unchanged parts when no tool calls present', () => {
        const parts = [{ type: 'text', text: 'Hello world' }];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toEqual(parts);
    });
    (0, bun_test_1.test)('adds stub results for tool calls without results', () => {
        const parts = [
            { type: 'text', text: 'Computing...' },
            {
                type: 'tool-sum',
                toolCallId: 'call_1',
                state: 'input-available',
                input: { a: 1, b: 2 },
            },
            {
                type: 'tool-multiply',
                toolCallId: 'call_2',
                state: 'input-streaming',
                input: { x: 3, y: 4 },
            },
        ];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toHaveLength(3);
        (0, bun_test_1.expect)(result[0]).toEqual({ type: 'text', text: 'Computing...' });
        // Tool calls should be updated with stub results
        (0, bun_test_1.expect)(result[1]).toEqual({
            type: 'tool-sum',
            toolCallId: 'call_1',
            state: 'output-available',
            input: { a: 1, b: 2 },
            output: 'No tool result returned',
        });
        (0, bun_test_1.expect)(result[2]).toEqual({
            type: 'tool-multiply',
            toolCallId: 'call_2',
            state: 'output-available',
            input: { x: 3, y: 4 },
            output: 'No tool result returned',
        });
    });
    (0, bun_test_1.test)('preserves existing tool results', () => {
        const parts = [
            {
                type: 'tool-sum',
                toolCallId: 'call_1',
                state: 'output-available',
                input: { a: 1, b: 2 },
                output: 3,
            },
            {
                type: 'tool-multiply',
                toolCallId: 'call_2',
                state: 'input-available',
                input: { x: 3, y: 4 },
            },
        ];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toHaveLength(2);
        // First tool result should remain unchanged
        (0, bun_test_1.expect)(result[0]).toEqual({
            type: 'tool-sum',
            toolCallId: 'call_1',
            state: 'output-available',
            input: { a: 1, b: 2 },
            output: 3,
        });
        // Second tool call should get stub result
        (0, bun_test_1.expect)(result[1]).toEqual({
            type: 'tool-multiply',
            toolCallId: 'call_2',
            state: 'output-available',
            input: { x: 3, y: 4 },
            output: 'No tool result returned',
        });
    });
    (0, bun_test_1.test)('handles mixed tool calls with some having results', () => {
        const parts = [
            {
                type: 'tool-sum',
                toolCallId: 'call_1',
                state: 'input-available',
                input: { a: 1, b: 2 },
            },
            {
                type: 'tool-multiply',
                toolCallId: 'call_2',
                state: 'output-available',
                input: { x: 3, y: 4 },
                output: 12,
            },
            {
                type: 'tool-divide',
                toolCallId: 'call_3',
                state: 'input-streaming',
                input: { a: 10, b: 2 },
            },
        ];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toHaveLength(3);
        // call_1 should get stub result
        (0, bun_test_1.expect)(result[0]).toEqual({
            type: 'tool-sum',
            toolCallId: 'call_1',
            state: 'output-available',
            input: { a: 1, b: 2 },
            output: 'No tool result returned',
        });
        // call_2 should remain unchanged
        (0, bun_test_1.expect)(result[1]).toEqual({
            type: 'tool-multiply',
            toolCallId: 'call_2',
            state: 'output-available',
            input: { x: 3, y: 4 },
            output: 12,
        });
        // call_3 should get stub result
        (0, bun_test_1.expect)(result[2]).toEqual({
            type: 'tool-divide',
            toolCallId: 'call_3',
            state: 'output-available',
            input: { a: 10, b: 2 },
            output: 'No tool result returned',
        });
    });
    (0, bun_test_1.test)('ensures no duplicate toolCallIds are created', () => {
        const parts = [
            {
                type: 'tool-sum',
                toolCallId: 'call_1',
                state: 'input-available',
                input: { a: 1, b: 2 },
            },
        ];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0]).toEqual({
            type: 'tool-sum',
            toolCallId: 'call_1',
            state: 'output-available',
            input: { a: 1, b: 2 },
            output: 'No tool result returned',
        });
        // Verify no duplicates by checking unique toolCallIds
        const toolCallIds = result
            .filter((part) => part.type?.startsWith('tool-') && part.toolCallId)
            .map((part) => part.toolCallId);
        const uniqueIds = new Set(toolCallIds);
        (0, bun_test_1.expect)(toolCallIds.length).toBe(uniqueIds.size);
    });
    (0, bun_test_1.test)('handles empty parts array', () => {
        const result = (0, stream_1.ensureToolCallResults)([]);
        (0, bun_test_1.expect)(result).toEqual([]);
    });
    (0, bun_test_1.test)('leaves error state tool calls unchanged', () => {
        const parts = [
            {
                type: 'tool-divide',
                toolCallId: 'call_1',
                state: 'error',
                input: { a: 10, b: 0 },
                errorText: 'Division by zero',
            },
            {
                type: 'tool-sum',
                toolCallId: 'call_2',
                state: 'input-available',
                input: { a: 1, b: 2 },
            },
        ];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toHaveLength(2);
        // Error state should remain unchanged
        (0, bun_test_1.expect)(result[0]).toEqual({
            type: 'tool-divide',
            toolCallId: 'call_1',
            state: 'error',
            input: { a: 10, b: 0 },
            errorText: 'Division by zero',
        });
        // Input-available should get stub result
        (0, bun_test_1.expect)(result[1]).toEqual({
            type: 'tool-sum',
            toolCallId: 'call_2',
            state: 'output-available',
            input: { a: 1, b: 2 },
            output: 'No tool result returned',
        });
    });
    (0, bun_test_1.test)('ignores tool calls without toolCallId', () => {
        const parts = [
            {
                type: 'tool-sum',
                // Missing toolCallId
                state: 'input-available',
                input: { a: 1, b: 2 },
            },
            {
                type: 'tool-multiply',
                toolCallId: 'call_1',
                state: 'input-available',
                input: { x: 3, y: 4 },
            },
        ];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toHaveLength(2);
        // Part without toolCallId should remain unchanged
        (0, bun_test_1.expect)(result[0]).toEqual({
            type: 'tool-sum',
            state: 'input-available',
            input: { a: 1, b: 2 },
        });
        // Part with toolCallId should get stub result
        (0, bun_test_1.expect)(result[1]).toEqual({
            type: 'tool-multiply',
            toolCallId: 'call_1',
            state: 'output-available',
            input: { x: 3, y: 4 },
            output: 'No tool result returned',
        });
    });
    (0, bun_test_1.test)('ignores tool calls without state field', () => {
        const parts = [
            {
                type: 'tool-sum',
                toolCallId: 'call_1',
                // Missing state field
                input: { a: 1, b: 2 },
            },
            {
                type: 'tool-multiply',
                toolCallId: 'call_2',
                state: 'input-available',
                input: { x: 3, y: 4 },
            },
        ];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toHaveLength(2);
        // Part without state should remain unchanged
        (0, bun_test_1.expect)(result[0]).toEqual({
            type: 'tool-sum',
            toolCallId: 'call_1',
            input: { a: 1, b: 2 },
        });
        // Part with proper state should get stub result
        (0, bun_test_1.expect)(result[1]).toEqual({
            type: 'tool-multiply',
            toolCallId: 'call_2',
            state: 'output-available',
            input: { x: 3, y: 4 },
            output: 'No tool result returned',
        });
    });
    (0, bun_test_1.test)('ignores tool calls with invalid/unknown states', () => {
        const parts = [
            {
                type: 'tool-sum',
                toolCallId: 'call_1',
                state: 'unknown-state',
                input: { a: 1, b: 2 },
            },
            {
                type: 'tool-multiply',
                toolCallId: 'call_2',
                state: 'processing', // Another unknown state
                input: { x: 3, y: 4 },
            },
            {
                type: 'tool-divide',
                toolCallId: 'call_3',
                state: 'input-available', // Known state
                input: { a: 10, b: 2 },
            },
        ];
        const result = (0, stream_1.ensureToolCallResults)(parts);
        (0, bun_test_1.expect)(result).toHaveLength(3);
        // Unknown states should remain unchanged
        (0, bun_test_1.expect)(result[0]).toEqual({
            type: 'tool-sum',
            toolCallId: 'call_1',
            state: 'unknown-state',
            input: { a: 1, b: 2 },
        });
        (0, bun_test_1.expect)(result[1]).toEqual({
            type: 'tool-multiply',
            toolCallId: 'call_2',
            state: 'processing',
            input: { x: 3, y: 4 },
        });
        // Known state should get stub result
        (0, bun_test_1.expect)(result[2]).toEqual({
            type: 'tool-divide',
            toolCallId: 'call_3',
            state: 'output-available',
            input: { a: 10, b: 2 },
            output: 'No tool result returned',
        });
    });
});
//# sourceMappingURL=convert.test.js.map