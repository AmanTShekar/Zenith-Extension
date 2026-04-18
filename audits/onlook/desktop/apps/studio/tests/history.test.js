"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("@/lib/editor/engine/history/helpers");
const style_1 = require("@onlook/models/style");
const bun_test_1 = require("bun:test");
(0, bun_test_1.describe)('updateTransactionActions', () => {
    (0, bun_test_1.it)('should append new action of different type', () => {
        const actions = [{ type: 'update-style' }];
        const newAction = { type: 'insert-element' };
        const result = (0, helpers_1.updateTransactionActions)(actions, newAction);
        (0, bun_test_1.expect)(result).toHaveLength(2);
        (0, bun_test_1.expect)(result[1]).toBe(newAction);
    });
    // Test case 1: Adding a new action when no action of same type exists
    (0, bun_test_1.it)('should add new action when no action of same type exists', () => {
        const existingActions = [
            {
                type: 'insert-element',
                targets: [{ webviewId: 'w1', domId: '1', oid: 'o1' }],
                location: { type: 'append', targetDomId: 'parent', targetOid: 'parent-oid' },
                element: {
                    domId: '1',
                    oid: 'o1',
                    tagName: 'div',
                    attributes: {},
                    styles: {},
                    textContent: null,
                    children: [],
                },
                editText: false,
                pasteParams: null,
                codeBlock: null,
            },
        ];
        const newAction = {
            type: 'remove-element',
            targets: [{ webviewId: 'w1', domId: '2', oid: 'o2' }],
            location: { type: 'append', targetDomId: 'parent', targetOid: 'parent-oid' },
            element: {
                domId: '2',
                oid: 'o2',
                tagName: 'div',
                attributes: {},
                styles: {},
                textContent: null,
                children: [],
            },
            editText: false,
            pasteParams: null,
            codeBlock: null,
        };
        const result = (0, helpers_1.updateTransactionActions)(existingActions, newAction);
        (0, bun_test_1.expect)(result).toHaveLength(2);
        (0, bun_test_1.expect)(result).toContainEqual(newAction);
    });
    // Test case 2: Replacing non-style action with new action of same type
    (0, bun_test_1.it)('should replace existing non-style action with new action of same type', () => {
        const existingActions = [
            {
                type: 'insert-element',
                targets: [{ webviewId: 'w1', domId: '1', oid: 'o1' }],
                location: { type: 'append', targetDomId: 'parent', targetOid: 'parent-oid' },
                element: {
                    domId: '1',
                    oid: 'o1',
                    tagName: 'div',
                    attributes: {},
                    styles: {},
                    textContent: null,
                    children: [],
                },
                editText: false,
                pasteParams: null,
                codeBlock: null,
            },
        ];
        const newAction = {
            type: 'insert-element',
            targets: [{ webviewId: 'w1', domId: '2', oid: 'o2' }],
            location: { type: 'append', targetDomId: 'parent', targetOid: 'parent-oid' },
            element: {
                domId: '2',
                oid: 'o2',
                tagName: 'div',
                attributes: {},
                styles: {},
                textContent: null,
                children: [],
            },
            editText: false,
            pasteParams: null,
            codeBlock: null,
        };
        const result = (0, helpers_1.updateTransactionActions)(existingActions, newAction);
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0]).toEqual(newAction);
    });
    // Test case 3: Merging style actions for same target
    (0, bun_test_1.it)('should merge style changes for same target', () => {
        const existingAction = {
            type: 'update-style',
            targets: [
                {
                    domId: '1',
                    webviewId: 'w1',
                    oid: 'o1',
                    change: {
                        updated: { color: { value: 'red', type: style_1.StyleChangeType.Value } },
                        original: { color: { value: 'blue', type: style_1.StyleChangeType.Value } },
                    },
                },
            ],
        };
        const newAction = {
            type: 'update-style',
            targets: [
                {
                    domId: '1',
                    webviewId: 'w1',
                    oid: 'o1',
                    change: {
                        updated: { fontSize: { value: '16px', type: style_1.StyleChangeType.Value } },
                        original: { fontSize: { value: '14px', type: style_1.StyleChangeType.Value } },
                    },
                },
            ],
        };
        const result = (0, helpers_1.updateTransactionActions)([existingAction], newAction);
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0].type).toBe('update-style');
        const mergedTarget = result[0].targets[0];
        (0, bun_test_1.expect)(mergedTarget.change.updated).toEqual({
            color: { value: 'red', type: style_1.StyleChangeType.Value },
            fontSize: { value: '16px', type: style_1.StyleChangeType.Value },
        });
        (0, bun_test_1.expect)(mergedTarget.change.original).toEqual({
            color: { value: 'blue', type: style_1.StyleChangeType.Value },
            fontSize: { value: '14px', type: style_1.StyleChangeType.Value },
        });
    });
    // Test case 4: Handling multiple style targets
    (0, bun_test_1.it)('should handle multiple style targets correctly', () => {
        const existingAction = {
            type: 'update-style',
            targets: [
                {
                    domId: '1',
                    webviewId: 'w1',
                    oid: 'o1',
                    change: {
                        updated: { color: { value: 'red', type: style_1.StyleChangeType.Value } },
                        original: { color: { value: 'blue', type: style_1.StyleChangeType.Value } },
                    },
                },
                {
                    domId: '2',
                    webviewId: 'w1',
                    oid: 'o2',
                    change: {
                        updated: { color: { value: 'green', type: style_1.StyleChangeType.Value } },
                        original: { color: { value: 'yellow', type: style_1.StyleChangeType.Value } },
                    },
                },
            ],
        };
        const newAction = {
            type: 'update-style',
            targets: [
                {
                    domId: '1',
                    webviewId: 'w1',
                    oid: 'o1',
                    change: {
                        updated: { fontSize: { value: '16px', type: style_1.StyleChangeType.Value } },
                        original: { fontSize: { value: '14px', type: style_1.StyleChangeType.Value } },
                    },
                },
            ],
        };
        const result = (0, helpers_1.updateTransactionActions)([existingAction], newAction);
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0].type).toBe('update-style');
        const targets = result[0].targets;
        (0, bun_test_1.expect)(targets).toHaveLength(2);
        // First target should be merged
        (0, bun_test_1.expect)(targets[0].change.updated).toEqual({
            color: { value: 'red', type: style_1.StyleChangeType.Value },
            fontSize: { value: '16px', type: style_1.StyleChangeType.Value },
        });
        // Second target should remain unchanged
        (0, bun_test_1.expect)(targets[1].change.updated).toEqual({
            color: { value: 'green', type: style_1.StyleChangeType.Value },
        });
    });
    // Test case 5: Empty actions array
    (0, bun_test_1.it)('should handle empty actions array', () => {
        const newAction = {
            type: 'insert-element',
            targets: [{ webviewId: 'w1', domId: '1', oid: 'o1' }],
            location: { type: 'append', targetDomId: 'parent', targetOid: 'parent-oid' },
            element: {
                domId: '1',
                oid: 'o1',
                tagName: 'div',
                attributes: {},
                styles: {},
                textContent: null,
                children: [],
            },
            editText: false,
            pasteParams: null,
            codeBlock: null,
        };
        const result = (0, helpers_1.updateTransactionActions)([], newAction);
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0]).toEqual(newAction);
    });
    // Test case 6: Multiple actions of different types
    (0, bun_test_1.it)('should handle multiple actions of different types', () => {
        const existingActions = [
            {
                type: 'insert-element',
                targets: [{ webviewId: 'w1', domId: '1', oid: 'o1' }],
                location: { type: 'append', targetDomId: 'parent', targetOid: 'parent-oid' },
                element: {
                    domId: '1',
                    oid: 'o1',
                    tagName: 'div',
                    attributes: {},
                    styles: {},
                    textContent: null,
                    children: [],
                },
                editText: false,
                pasteParams: null,
                codeBlock: null,
            },
            { type: 'update-style', targets: [] },
        ];
        const newAction = {
            type: 'insert-element',
            targets: [{ webviewId: 'w1', domId: '2', oid: 'o2' }],
            location: { type: 'append', targetDomId: 'parent', targetOid: 'parent-oid' },
            element: {
                domId: '2',
                oid: 'o2',
                tagName: 'div',
                attributes: {},
                styles: {},
                textContent: null,
                children: [],
            },
            editText: false,
            pasteParams: null,
            codeBlock: null,
        };
        const result = (0, helpers_1.updateTransactionActions)(existingActions, newAction);
        (0, bun_test_1.expect)(result).toHaveLength(2);
        (0, bun_test_1.expect)(result.find((a) => a.type === 'insert-element')).toEqual(newAction);
        (0, bun_test_1.expect)(result.find((a) => a.type === 'update-style')).toBeDefined();
    });
    // Test case 7: Custom style changes
    (0, bun_test_1.it)('should handle custom style changes correctly', () => {
        const existingAction = {
            type: 'update-style',
            targets: [
                {
                    domId: '1',
                    webviewId: 'w1',
                    oid: 'o1',
                    change: {
                        updated: { customStyle: { value: 'value1', type: style_1.StyleChangeType.Custom } },
                        original: {
                            customStyle: { value: 'original1', type: style_1.StyleChangeType.Custom },
                        },
                    },
                },
            ],
        };
        const newAction = {
            type: 'update-style',
            targets: [
                {
                    domId: '1',
                    webviewId: 'w1',
                    oid: 'o1',
                    change: {
                        updated: { customStyle: { value: 'value2', type: style_1.StyleChangeType.Custom } },
                        original: {
                            customStyle: { value: 'original2', type: style_1.StyleChangeType.Custom },
                        },
                    },
                },
            ],
        };
        const result = (0, helpers_1.updateTransactionActions)([existingAction], newAction);
        (0, bun_test_1.expect)(result).toHaveLength(1);
        (0, bun_test_1.expect)(result[0].type).toBe('update-style');
        const mergedTarget = result[0].targets[0];
        (0, bun_test_1.expect)(mergedTarget.change.updated).toEqual({
            customStyle: { value: 'value2', type: style_1.StyleChangeType.Custom },
        });
    });
});
//# sourceMappingURL=history.test.js.map