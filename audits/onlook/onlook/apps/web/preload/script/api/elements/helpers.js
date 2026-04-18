"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImmediateTextContent = exports.getDomElement = exports.getDeepElement = void 0;
exports.restoreElementStyle = restoreElementStyle;
exports.getElementLocation = getElementLocation;
const constants_1 = require("@onlook/constants");
const ids_1 = require("../../helpers/ids");
const state_1 = require("../state");
const style_1 = require("./style");
const getDeepElement = (x, y) => {
    const el = document.elementFromPoint(x, y);
    if (!el) {
        return;
    }
    const crawlShadows = (node) => {
        if (node?.shadowRoot) {
            const potential = node.shadowRoot.elementFromPoint(x, y);
            if (potential == node) {
                return node;
            }
            else if (potential?.shadowRoot) {
                return crawlShadows(potential);
            }
            else {
                return potential || node;
            }
        }
        else {
            return node;
        }
    };
    const nested_shadow = crawlShadows(el);
    return nested_shadow || el;
};
exports.getDeepElement = getDeepElement;
const getDomElement = (el, getStyle) => {
    const parent = el.parentElement;
    const parentDomElement = parent
        ? {
            domId: parent.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID),
            frameId: (0, state_1.getFrameId)(),
            branchId: (0, state_1.getBranchId)(),
            oid: parent.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_ID),
            instanceId: parent.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSTANCE_ID),
            rect: parent.getBoundingClientRect(),
        }
        : null;
    const rect = el.getBoundingClientRect();
    const styles = getStyle ? (0, style_1.getStyles)(el) : null;
    const domElement = {
        domId: el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID),
        oid: el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_ID),
        frameId: (0, state_1.getFrameId)(),
        branchId: (0, state_1.getBranchId)(),
        instanceId: el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSTANCE_ID),
        rect,
        tagName: el.tagName,
        parent: parentDomElement,
        styles,
    };
    return domElement;
};
exports.getDomElement = getDomElement;
function restoreElementStyle(el) {
    try {
        const saved = el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DRAG_SAVED_STYLE);
        if (saved) {
            const style = JSON.parse(saved);
            for (const key in style) {
                el.style[key] = style[key];
            }
        }
    }
    catch (e) {
        console.warn('Error restoring style', e);
    }
}
function getElementLocation(targetEl) {
    const parent = targetEl.parentElement;
    if (!parent) {
        return;
    }
    const location = {
        type: 'index',
        targetDomId: parent.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID),
        targetOid: (0, ids_1.getInstanceId)(parent) || (0, ids_1.getOid)(parent) || null,
        index: Array.from(targetEl.parentElement?.children || []).indexOf(targetEl),
        originalIndex: Array.from(targetEl.parentElement?.children || []).indexOf(targetEl),
    };
    return location;
}
const getImmediateTextContent = (el) => {
    const stringArr = Array.from(el.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent);
    if (stringArr.length === 0) {
        return;
    }
    return stringArr.join('');
};
exports.getImmediateTextContent = getImmediateTextContent;
//# sourceMappingURL=helpers.js.map