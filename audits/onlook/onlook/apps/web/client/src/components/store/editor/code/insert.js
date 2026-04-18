"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsertedElement = getInsertedElement;
const constants_1 = require("@onlook/constants");
const actions_1 = require("@onlook/models/actions");
const style_1 = require("@onlook/models/style");
const utility_1 = require("@onlook/utility");
const tailwind_1 = require("./tailwind");
function getInsertedElement(actionElement, location, pasteParams, codeBlock) {
    // Generate Tailwind className from style as an attribute
    const styles = Object.fromEntries(Object.entries(actionElement.styles).map(([key, value]) => [
        key,
        { value, type: style_1.StyleChangeType.Value },
    ]));
    const newClasses = (0, tailwind_1.getTailwindClasses)(actionElement.oid, styles);
    const attributes = {
        className: (0, utility_1.customTwMerge)(actionElement.attributes['className'], actionElement.attributes['class'], newClasses),
        [constants_1.EditorAttributes.DATA_ONLOOK_ID]: actionElement.oid,
        ...(actionElement.tagName.toLowerCase() === 'img' && {
            src: actionElement.attributes['src'],
            alt: actionElement.attributes['alt'],
        }),
    };
    let children = [];
    if (actionElement.children) {
        children = actionElement.children.map((child) => getInsertedElement(child, location, null, null));
    }
    const insertedElement = {
        type: actions_1.CodeActionType.INSERT,
        oid: actionElement.oid,
        tagName: actionElement.tagName,
        children,
        attributes,
        textContent: actionElement.textContent,
        location,
        pasteParams,
        codeBlock: codeBlock || null,
    };
    return insertedElement;
}
//# sourceMappingURL=insert.js.map