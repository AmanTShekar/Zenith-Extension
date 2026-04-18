"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffsetParent = exports.getChildrenCount = exports.getParentElement = exports.updateElementInstance = exports.getElementAtLoc = exports.getDomElementByDomId = void 0;
const constants_1 = require("@onlook/models/constants");
const helpers_1 = require("./helpers");
const helpers_2 = require("/common/helpers");
const getDomElementByDomId = (domId, style) => {
    const el = (0, helpers_2.elementFromDomId)(domId) || document.body;
    return (0, helpers_1.getDomElement)(el, style);
};
exports.getDomElementByDomId = getDomElementByDomId;
const getElementAtLoc = (x, y, getStyle) => {
    const el = getDeepElement(x, y) || document.body;
    return (0, helpers_1.getDomElement)(el, getStyle);
};
exports.getElementAtLoc = getElementAtLoc;
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
const updateElementInstance = (domId, instanceId, component) => {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        console.warn('Failed to updateElementInstanceId: Element not found');
        return;
    }
    el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_INSTANCE_ID, instanceId);
    el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_COMPONENT_NAME, component);
};
exports.updateElementInstance = updateElementInstance;
const getParentElement = (domId) => {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el?.parentElement) {
        return null;
    }
    return (0, helpers_1.getDomElement)(el.parentElement, false);
};
exports.getParentElement = getParentElement;
const getChildrenCount = (domId) => {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        return 0;
    }
    return el.children.length;
};
exports.getChildrenCount = getChildrenCount;
const getOffsetParent = (domId) => {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        return null;
    }
    return (0, helpers_1.getDomElement)(el.offsetParent, false);
};
exports.getOffsetParent = getOffsetParent;
//# sourceMappingURL=index.js.map