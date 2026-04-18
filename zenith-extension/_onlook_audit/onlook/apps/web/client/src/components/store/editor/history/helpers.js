"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverse = reverse;
exports.reverseMoveLocation = reverseMoveLocation;
exports.reverseStyleAction = reverseStyleAction;
exports.reverseWriteCodeAction = reverseWriteCodeAction;
exports.undoAction = undoAction;
exports.updateTransactionActions = updateTransactionActions;
exports.getCleanedElement = getCleanedElement;
exports.transformRedoAction = transformRedoAction;
const constants_1 = require("@onlook/constants");
const utility_1 = require("@onlook/utility");
function reverse(change) {
    return { updated: change.original, original: change.updated };
}
function reverseMoveLocation(location) {
    return {
        ...location,
        index: location.originalIndex,
        originalIndex: location.index,
    };
}
function reverseStyleAction(action) {
    return {
        ...action,
        targets: action.targets.map((target) => ({
            ...target,
            change: reverse(target.change),
        })),
    };
}
function reverseWriteCodeAction(action) {
    return {
        ...action,
        diffs: action.diffs.map((diff) => ({
            ...diff,
            original: diff.generated,
            generated: diff.original,
        })),
    };
}
function undoAction(action) {
    switch (action.type) {
        case 'update-style':
            return reverseStyleAction(action);
        case 'insert-element':
            const removeAction = {
                type: 'remove-element',
                targets: action.targets ? [...action.targets] : [],
                location: {
                    ...action.location,
                },
                element: getCleanedElement(action.element, action.element.domId, action.element.oid),
                editText: null,
                pasteParams: null,
                codeBlock: null,
            };
            return removeAction;
        case 'remove-element':
            const insertAction = {
                type: 'insert-element',
                targets: action.targets ? [...action.targets] : [],
                location: {
                    ...action.location,
                },
                element: getCleanedElement(action.element, action.element.domId, action.element.oid),
                editText: action.editText,
                pasteParams: action.pasteParams ? { ...action.pasteParams } : null,
                codeBlock: action.codeBlock,
            };
            return insertAction;
        case 'move-element':
            return {
                ...action,
                location: reverseMoveLocation(action.location),
            };
        case 'edit-text':
            return {
                ...action,
                originalContent: action.newContent,
                newContent: action.originalContent,
            };
        case 'group-elements':
            const ungroupAction = {
                type: 'ungroup-elements',
                parent: {
                    ...action.parent,
                },
                container: {
                    ...action.container,
                    attributes: {
                        ...action.container.attributes,
                    },
                },
                children: action.children.map((child) => ({
                    frameId: child.frameId,
                    branchId: child.branchId,
                    domId: child.domId,
                    oid: child.oid,
                })),
            };
            return ungroupAction;
        case 'ungroup-elements':
            const groupAction = {
                type: 'group-elements',
                parent: {
                    ...action.parent,
                },
                container: {
                    ...action.container,
                    attributes: {
                        ...action.container.attributes,
                    },
                },
                children: action.children.map((child) => ({
                    frameId: child.frameId,
                    branchId: child.branchId,
                    domId: child.domId,
                    oid: child.oid,
                })),
            };
            return groupAction;
        case 'write-code':
            return reverseWriteCodeAction(action);
        case 'insert-image':
            return {
                ...action,
                type: 'remove-image',
            };
        case 'remove-image':
            return {
                ...action,
                type: 'insert-image',
            };
        default:
            (0, utility_1.assertNever)(action);
    }
}
function handleUpdateStyleAction(actions, existingActionIndex, newAction) {
    const existingAction = actions[existingActionIndex];
    const mergedTargets = [...existingAction.targets];
    for (const newTarget of newAction.targets) {
        const existingTarget = mergedTargets.find((et) => et.domId === newTarget.domId);
        if (existingTarget) {
            existingTarget.change = {
                updated: { ...existingTarget.change.updated, ...newTarget.change.updated },
                original: { ...existingTarget.change.original, ...newTarget.change.original },
            };
        }
        else {
            mergedTargets.push(newTarget);
        }
    }
    return actions.map((a, i) => i === existingActionIndex ? { type: 'update-style', targets: mergedTargets } : a);
}
function updateTransactionActions(actions, newAction) {
    const existingActionIndex = actions.findIndex((a) => a.type === newAction.type);
    if (existingActionIndex === -1) {
        return [...actions, newAction];
    }
    if (newAction.type === 'update-style') {
        return handleUpdateStyleAction(actions, existingActionIndex, newAction);
    }
    return actions.map((a, i) => (i === existingActionIndex ? newAction : a));
}
function getCleanedElement(copiedEl, domId, oid) {
    const cleanedEl = {
        tagName: copiedEl.tagName,
        attributes: {
            class: copiedEl.attributes.class ?? '',
            [constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID]: domId,
            [constants_1.EditorAttributes.DATA_ONLOOK_ID]: oid,
            [constants_1.EditorAttributes.DATA_ONLOOK_INSERTED]: 'true',
        },
        styles: { ...copiedEl.styles },
        textContent: copiedEl.textContent,
        children: [],
        domId,
        oid,
        branchId: copiedEl.branchId,
    };
    // Process children recursively
    if (copiedEl.children?.length) {
        cleanedEl.children = copiedEl.children.map((child) => {
            const newChildDomId = (0, utility_1.createDomId)();
            const newChildOid = (0, utility_1.createOid)();
            return getCleanedElement(child, newChildDomId, newChildOid);
        });
    }
    return cleanedEl;
}
function transformRedoAction(action) {
    switch (action.type) {
        case 'insert-element':
        case 'remove-element':
            return {
                type: action.type,
                targets: action.targets ? [...action.targets] : [],
                location: { ...action.location },
                element: getCleanedElement(action.element, action.element.domId, action.element.oid),
                editText: action.editText,
                pasteParams: action.pasteParams,
                codeBlock: action.codeBlock,
            };
        case 'group-elements':
        case 'ungroup-elements':
            return {
                type: action.type,
                parent: { ...action.parent },
                container: {
                    ...action.container,
                    attributes: { ...action.container.attributes },
                },
                children: action.children.map((child) => ({
                    frameId: child.frameId,
                    branchId: child.branchId,
                    domId: child.domId,
                    oid: child.oid,
                })),
            };
        case 'update-style':
            return {
                type: 'update-style',
                targets: action.targets.map((target) => ({
                    ...target,
                    change: {
                        updated: { ...target.change.updated },
                        original: { ...target.change.original },
                    },
                })),
            };
        case 'move-element':
            return {
                type: 'move-element',
                targets: action.targets ? [...action.targets] : [],
                location: { ...action.location },
            };
        case 'edit-text':
            return {
                type: 'edit-text',
                targets: action.targets ? [...action.targets] : [],
                originalContent: action.originalContent,
                newContent: action.newContent,
            };
        case 'write-code':
            return {
                type: 'write-code',
                diffs: action.diffs.map((diff) => ({
                    ...diff,
                    original: diff.original,
                    generated: diff.generated,
                })),
            };
        case 'insert-image':
        case 'remove-image':
            return {
                ...action,
                type: action.type === 'insert-image' ? 'remove-image' : 'insert-image',
            };
        default:
            return action;
    }
}
//# sourceMappingURL=helpers.js.map