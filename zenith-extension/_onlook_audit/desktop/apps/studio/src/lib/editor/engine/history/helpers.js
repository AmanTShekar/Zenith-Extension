"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverse = reverse;
exports.reverseMoveLocation = reverseMoveLocation;
exports.reverseStyleAction = reverseStyleAction;
exports.reverseWriteCodeAction = reverseWriteCodeAction;
exports.undoAction = undoAction;
exports.updateTransactionActions = updateTransactionActions;
const helpers_1 = require("/common/helpers");
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
            return {
                ...action,
                type: 'remove-element',
            };
        case 'remove-element':
            return {
                ...action,
                type: 'insert-element',
                editText: null,
            };
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
            return {
                ...action,
                type: 'ungroup-elements',
            };
        case 'ungroup-elements':
            return {
                ...action,
                type: 'group-elements',
            };
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
            (0, helpers_1.assertNever)(action);
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
//# sourceMappingURL=helpers.js.map