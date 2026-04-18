"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOidsToAst = addOidsToAst;
exports.getAllExistingOids = getAllExistingOids;
exports.getExistingOid = getExistingOid;
const constants_1 = require("@onlook/constants");
const utility_1 = require("@onlook/utility");
const helpers_1 = require("./helpers");
const packages_1 = require("./packages");
/**
 * Generates a unique OID that doesn't conflict with global or local OIDs
 */
function generateUniqueOid(globalOids, localOids) {
    let newOid;
    do {
        newOid = (0, utility_1.createOid)();
    } while (globalOids.has(newOid) || localOids.has(newOid));
    return newOid;
}
/**
 * Creates a new JSX data-oid attribute with the given value
 */
function createOidAttribute(oidValue) {
    return packages_1.t.jSXAttribute(packages_1.t.jSXIdentifier(constants_1.EditorAttributes.DATA_ONLOOK_ID), packages_1.t.stringLiteral(oidValue));
}
/**
 * Removes all existing OID attributes from the element
 */
function removeAllOidAttributes(attributes, indices) {
    // Remove in reverse order to maintain correct indices
    indices
        .sort((a, b) => b - a)
        .forEach((index) => {
        attributes.splice(index, 1);
    });
}
/**
 * Checks if an OID should be replaced due to branch or local conflicts
 */
function shouldReplaceOid(oidValue, globalOids, localOids, branchOidMap, currentBranchId) {
    const oidOwnerBranch = branchOidMap.get(oidValue);
    // Replace OID if:
    // 1. It exists globally AND belongs to a different branch, OR
    // 2. It's already used elsewhere in this same AST
    return ((globalOids.has(oidValue) && oidOwnerBranch && oidOwnerBranch !== currentBranchId) ||
        localOids.has(oidValue));
}
/**
 * Handles elements that have multiple or invalid OIDs by removing all and creating a new one
 */
function handleProblematicOids(attributes, oidIndices, globalOids, localOids) {
    // Remove all existing OID attributes
    removeAllOidAttributes(attributes, oidIndices);
    // Generate and add new unique OID
    const newOid = generateUniqueOid(globalOids, localOids);
    const newOidAttribute = createOidAttribute(newOid);
    attributes.push(newOidAttribute);
    localOids.add(newOid);
    return newOid;
}
/**
 * Handles elements with a single valid OID by checking for conflicts and replacing if necessary
 */
function handleSingleValidOid(attributes, oidValue, oidIndex, globalOids, localOids, branchOidMap, currentBranchId) {
    if (shouldReplaceOid(oidValue, globalOids, localOids, branchOidMap, currentBranchId)) {
        // Generate new unique OID and replace the existing one
        const newOid = generateUniqueOid(globalOids, localOids);
        const attr = attributes[oidIndex];
        attr.value = packages_1.t.stringLiteral(newOid);
        localOids.add(newOid);
        return { oidValue: newOid, wasReplaced: true };
    }
    else {
        // Keep existing OID and track it locally
        localOids.add(oidValue);
        return { oidValue, wasReplaced: false };
    }
}
/**
 * Handles elements with no OID by creating a new one
 */
function handleMissingOid(attributes, globalOids, localOids) {
    const newOid = generateUniqueOid(globalOids, localOids);
    const newOidAttribute = createOidAttribute(newOid);
    attributes.push(newOidAttribute);
    localOids.add(newOid);
    return newOid;
}
function addOidsToAst(ast, globalOids = new Set(), branchOidMap = new Map(), currentBranchId) {
    let modified = false;
    // Track OIDs used within this AST to prevent duplicates in the same file
    const localOids = new Set();
    (0, packages_1.traverse)(ast, {
        JSXOpeningElement(path) {
            if ((0, helpers_1.isReactFragment)(path.node)) {
                return;
            }
            const attributes = path.node.attributes;
            const allOids = getAllExistingOids(attributes);
            if (allOids.indices.length > 0) {
                if (allOids.hasMultiple || allOids.hasInvalid) {
                    // Handle multiple or invalid OIDs: remove all and create new one
                    handleProblematicOids(attributes, allOids.indices, globalOids, localOids);
                    modified = true;
                }
                else {
                    // Handle single valid OID: check for conflicts
                    const oidValue = allOids.values[0];
                    const oidIndex = allOids.indices[0];
                    if (oidValue && oidIndex !== undefined) {
                        const result = handleSingleValidOid(attributes, oidValue, oidIndex, globalOids, localOids, branchOidMap, currentBranchId);
                        if (result.wasReplaced) {
                            modified = true;
                        }
                    }
                }
            }
            else {
                // Handle missing OID: create new one
                handleMissingOid(attributes, globalOids, localOids);
                modified = true;
            }
        },
    });
    return { ast, modified };
}
function getAllExistingOids(attributes) {
    const oidIndices = [];
    const oidValues = [];
    let hasInvalid = false;
    attributes.forEach((attr, index) => {
        if (packages_1.t.isJSXAttribute(attr) && attr.name.name === constants_1.EditorAttributes.DATA_ONLOOK_ID) {
            oidIndices.push(index);
            const existingAttrValue = attr.value;
            if (!existingAttrValue || !packages_1.t.isStringLiteral(existingAttrValue)) {
                hasInvalid = true;
                oidValues.push('');
            }
            else {
                const value = existingAttrValue.value;
                // Treat empty strings and whitespace-only strings as invalid
                if (!value || value.trim() === '') {
                    hasInvalid = true;
                    oidValues.push('');
                }
                else {
                    oidValues.push(value);
                }
            }
        }
    });
    return {
        indices: oidIndices,
        values: oidValues,
        hasMultiple: oidIndices.length > 1,
        hasInvalid,
    };
}
function getExistingOid(attributes) {
    const existingAttrIndex = attributes.findIndex((attr) => packages_1.t.isJSXAttribute(attr) && attr.name.name === constants_1.EditorAttributes.DATA_ONLOOK_ID);
    if (existingAttrIndex === -1) {
        return null;
    }
    const existingAttr = attributes[existingAttrIndex];
    if (packages_1.t.isJSXSpreadAttribute(existingAttr)) {
        return null;
    }
    if (!existingAttr) {
        return null;
    }
    const existingAttrValue = existingAttr.value;
    if (!existingAttrValue || !packages_1.t.isStringLiteral(existingAttrValue)) {
        // Mark invalid oid attributes for removal
        return {
            index: existingAttrIndex,
            value: '',
            shouldRemove: true,
        };
    }
    const value = existingAttrValue.value;
    // Treat empty strings and whitespace-only strings as invalid
    if (!value || value.trim() === '') {
        return {
            index: existingAttrIndex,
            value: '',
            shouldRemove: true,
        };
    }
    return {
        index: existingAttrIndex,
        value,
        shouldRemove: false,
    };
}
//# sourceMappingURL=ids.js.map