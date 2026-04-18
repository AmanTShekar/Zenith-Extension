"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActionElementByDomId = getActionElementByDomId;
exports.getActionElement = getActionElement;
exports.getActionLocation = getActionLocation;
exports.getElementType = getElementType;
exports.setElementType = setElementType;
exports.getFirstOnlookElement = getFirstOnlookElement;
const constants_1 = require("@onlook/models/constants");
const ids_1 = require("../../ids");
const helpers_1 = require("../helpers");
const helpers_2 = require("/common/helpers");
const ids_2 = require("/common/helpers/ids");
function getActionElementByDomId(domId) {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        console.warn('Element not found for domId:', domId);
        return null;
    }
    return getActionElement(el);
}
function getActionElement(el) {
    const attributes = Array.from(el.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
    }, {});
    const oid = (0, ids_2.getInstanceId)(el) || (0, ids_2.getOid)(el) || null;
    if (!oid) {
        console.warn('Element has no oid');
        return null;
    }
    return {
        oid,
        domId: (0, ids_1.getOrAssignDomId)(el),
        tagName: el.tagName.toLowerCase(),
        children: Array.from(el.children)
            .map((child) => getActionElement(child))
            .filter(Boolean),
        attributes,
        textContent: (0, helpers_1.getImmediateTextContent)(el) || null,
        styles: {},
    };
}
function getActionLocation(domId) {
    const el = (0, helpers_2.elementFromDomId)(domId);
    if (!el) {
        throw new Error('Element not found for domId: ' + domId);
    }
    const parent = el.parentElement;
    if (!parent) {
        throw new Error('Inserted element has no parent');
    }
    const targetOid = (0, ids_2.getInstanceId)(parent) || (0, ids_2.getOid)(parent);
    if (!targetOid) {
        console.warn('Parent element has no oid');
        return null;
    }
    const targetDomId = (0, ids_1.getOrAssignDomId)(parent);
    const index = Array.from(parent.children).indexOf(el);
    if (index === -1) {
        return {
            type: 'append',
            targetDomId,
            targetOid,
        };
    }
    return {
        type: 'index',
        targetDomId,
        targetOid,
        index,
        originalIndex: index,
    };
}
function getElementType(domId) {
    const el = document.querySelector(`[${constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID}="${domId}"]`);
    if (!el) {
        console.warn('No element found', { domId });
        return { dynamicType: null, coreType: null };
    }
    const dynamicType = el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DYNAMIC_TYPE) || null;
    const coreType = el.getAttribute(constants_1.EditorAttributes.DATA_ONLOOK_CORE_ELEMENT_TYPE) ||
        null;
    return { dynamicType, coreType };
}
function setElementType(domId, dynamicType, coreElementType) {
    const el = document.querySelector(`[${constants_1.EditorAttributes.DATA_ONLOOK_DOM_ID}="${domId}"]`);
    if (el) {
        if (dynamicType) {
            el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_DYNAMIC_TYPE, dynamicType);
        }
        if (coreElementType) {
            el.setAttribute(constants_1.EditorAttributes.DATA_ONLOOK_CORE_ELEMENT_TYPE, coreElementType);
        }
    }
}
function getFirstOnlookElement() {
    const body = document.body;
    const firstElement = body.querySelector(`[${constants_1.EditorAttributes.DATA_ONLOOK_ID}]`);
    if (firstElement) {
        return (0, helpers_1.getDomElement)(firstElement, true);
    }
    return null;
}
//# sourceMappingURL=helpers.js.map