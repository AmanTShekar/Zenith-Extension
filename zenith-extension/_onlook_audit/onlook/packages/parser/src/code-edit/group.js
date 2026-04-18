"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupElementsInNode = groupElementsInNode;
exports.ungroupElementsInNode = ungroupElementsInNode;
const actions_1 = require("@onlook/models/actions");
const packages_1 = require("../packages");
const helpers_1 = require("./helpers");
const insert_1 = require("./insert");
const remove_1 = require("./remove");
function groupElementsInNode(path, element) {
    const children = path.node.children;
    const jsxElements = children.filter(helpers_1.jsxFilter);
    const targetOids = element.children.map((c) => c.oid);
    const targetChildren = jsxElements.filter((el) => {
        if (!packages_1.t.isJSXElement(el)) {
            return false;
        }
        const oid = (0, helpers_1.getOidFromJsxElement)(el.openingElement);
        if (!oid) {
            throw new Error('Element has no oid');
        }
        return targetOids.includes(oid);
    });
    const insertIndex = Math.min(...targetChildren.map((c) => jsxElements.indexOf(c)));
    targetChildren.forEach((targetChild) => {
        (0, remove_1.removeElementAtIndex)(jsxElements.indexOf(targetChild), jsxElements, children);
    });
    const container = (0, insert_1.createInsertedElement)({
        type: actions_1.CodeActionType.INSERT,
        textContent: null,
        pasteParams: {
            oid: element.container.oid,
            domId: element.container.domId,
        },
        codeBlock: null,
        children: [],
        oid: element.container.oid,
        tagName: element.container.tagName,
        attributes: {},
        location: {
            type: 'index',
            targetDomId: element.container.domId,
            targetOid: element.container.oid,
            index: insertIndex,
            originalIndex: insertIndex,
        },
    });
    container.children = targetChildren;
    (0, helpers_1.addKeyToElement)(container);
    (0, insert_1.insertAtIndex)(path, container, insertIndex);
    jsxElements.forEach((el) => {
        (0, helpers_1.addKeyToElement)(el);
    });
    path.stop();
}
function ungroupElementsInNode(path, element) {
    const children = path.node.children;
    const jsxElements = children.filter(helpers_1.jsxFilter);
    const container = jsxElements.find((el) => {
        if (!packages_1.t.isJSXElement(el)) {
            return false;
        }
        const oid = (0, helpers_1.getOidFromJsxElement)(el.openingElement);
        if (!oid) {
            throw new Error('Element has no oid');
        }
        return oid === element.container.oid;
    });
    if (!container || !packages_1.t.isJSXElement(container)) {
        throw new Error('Container element not found');
    }
    const containerIndex = children.indexOf(container);
    const containerChildren = container.children.filter(helpers_1.jsxFilter);
    // Add each child at the container's position
    containerChildren.forEach((child, index) => {
        (0, helpers_1.addKeyToElement)(child, true);
        children.splice(containerIndex + index, 0, child);
    });
    // Remove the container after spreading its children
    children.splice(containerIndex + containerChildren.length, 1);
    path.stop();
}
//# sourceMappingURL=group.js.map