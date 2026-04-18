"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGroupedRequests = processGroupedRequests;
exports.getStyleRequests = getStyleRequests;
exports.getInsertRequests = getInsertRequests;
exports.getRemoveRequests = getRemoveRequests;
exports.getEditTextRequests = getEditTextRequests;
exports.getMoveRequests = getMoveRequests;
exports.getGroupRequests = getGroupRequests;
exports.getUngroupRequests = getUngroupRequests;
exports.getWriteCodeRequests = getWriteCodeRequests;
exports.getInsertImageRequests = getInsertImageRequests;
exports.getRemoveImageRequests = getRemoveImageRequests;
const models_1 = require("@onlook/models");
const parser_1 = require("@onlook/parser");
const helpers_1 = require("./helpers");
const insert_1 = require("./insert");
const tailwind_1 = require("./tailwind");
async function processGroupedRequests(groupedRequests) {
    const diffs = [];
    for (const [path, request] of groupedRequests) {
        const { oidToRequest, content } = request;
        const ast = (0, parser_1.getAstFromContent)(content);
        if (!ast) {
            throw new Error('No ast found for file');
        }
        const original = await (0, parser_1.getContentFromAst)(ast, content);
        (0, parser_1.transformAst)(ast, oidToRequest);
        const generated = await (0, parser_1.getContentFromAst)(ast, content);
        diffs.push({ original, generated, path });
    }
    return diffs;
}
async function getStyleRequests({ targets }) {
    const oidToCodeChange = new Map();
    for (const target of targets) {
        if (!target.oid) {
            throw new Error('No oid found for style change');
        }
        const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(target.oid, target.branchId, oidToCodeChange);
        (0, tailwind_1.addTailwindToRequest)(request, target.change.updated);
    }
    return Array.from(oidToCodeChange.values());
}
async function getInsertRequests({ location, element, pasteParams, codeBlock, }) {
    const oidToCodeChange = new Map();
    const insertedEl = (0, insert_1.getInsertedElement)(element, location, pasteParams, codeBlock);
    if (!insertedEl.location.targetOid) {
        throw new Error('No oid found for inserted element');
    }
    const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(insertedEl.location.targetOid, element.branchId, oidToCodeChange);
    request.structureChanges.push(insertedEl);
    return Array.from(oidToCodeChange.values());
}
async function getRemoveRequests({ element, codeBlock, }) {
    const oidToCodeChange = new Map();
    const removedEl = {
        oid: element.oid,
        type: models_1.CodeActionType.REMOVE,
        codeBlock,
    };
    const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(removedEl.oid, element.branchId, oidToCodeChange);
    request.structureChanges.push(removedEl);
    return Array.from(oidToCodeChange.values());
}
async function getEditTextRequests({ targets, newContent, }) {
    const oidToCodeChange = new Map();
    for (const target of targets) {
        if (!target.oid) {
            throw new Error('No oid found for text edit');
        }
        const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(target.oid, target.branchId, oidToCodeChange);
        request.textContent = newContent;
    }
    return Array.from(oidToCodeChange.values());
}
async function getMoveRequests({ targets, location, }) {
    const oidToCodeChange = new Map();
    for (const target of targets) {
        if (!target.oid) {
            throw new Error('No oid found for move');
        }
        if (!location.targetOid) {
            throw new Error('No target oid found for moved element');
        }
        const movedEl = {
            oid: target.oid,
            type: models_1.CodeActionType.MOVE,
            location,
        };
        const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(location.targetOid, target.branchId, oidToCodeChange);
        request.structureChanges.push(movedEl);
    }
    return Array.from(oidToCodeChange.values());
}
async function getGroupRequests(action) {
    if (!action.parent.oid) {
        throw new Error('No parent oid found for group');
    }
    const oidToCodeChange = new Map();
    const groupEl = {
        type: models_1.CodeActionType.GROUP,
        oid: action.parent.oid,
        container: action.container,
        children: action.children,
    };
    const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(groupEl.oid, action.parent.branchId, oidToCodeChange);
    request.structureChanges.push(groupEl);
    return Array.from(oidToCodeChange.values());
}
async function getUngroupRequests(action) {
    if (!action.parent.oid) {
        throw new Error('No parent oid found for ungroup');
    }
    const oidToCodeChange = new Map();
    const ungroupEl = {
        type: models_1.CodeActionType.UNGROUP,
        oid: action.parent.oid,
        container: action.container,
        children: action.children,
    };
    const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(ungroupEl.oid, action.parent.branchId, oidToCodeChange);
    request.structureChanges.push(ungroupEl);
    return Array.from(oidToCodeChange.values());
}
async function getWriteCodeRequests(action) {
    throw new Error('Not implemented');
}
async function getInsertImageRequests(action) {
    throw new Error('Not implemented');
}
async function getRemoveImageRequests(action) {
    const oidToCodeChange = new Map();
    const removeImage = {
        ...action,
        type: models_1.CodeActionType.REMOVE_IMAGE,
    };
    for (const target of action.targets) {
        if (!target.oid) {
            throw new Error('No oid found for removed image');
        }
        const request = await (0, helpers_1.getOrCreateCodeDiffRequest)(target.oid, target.branchId, oidToCodeChange);
        request.structureChanges.push(removeImage);
    }
    return Array.from(oidToCodeChange.values());
}
//# sourceMappingURL=requests.js.map