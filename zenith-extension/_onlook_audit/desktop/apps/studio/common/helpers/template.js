"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = encode;
exports.decode = decode;
exports.compareTemplateNodes = compareTemplateNodes;
exports.areTemplateNodesEqual = areTemplateNodesEqual;
const fflate_1 = require("fflate");
function encode(templateNode) {
    const buffer = (0, fflate_1.strToU8)(JSON.stringify(templateNode));
    const compressed = (0, fflate_1.compressSync)(buffer);
    const binaryString = Array.from(new Uint8Array(compressed))
        .map((byte) => String.fromCharCode(byte))
        .join('');
    const base64 = btoa(binaryString);
    return base64;
}
function decode(encodedTemplateNode) {
    const buffer = new Uint8Array(atob(encodedTemplateNode)
        .split('')
        .map((c) => c.charCodeAt(0)));
    const decompressed = (0, fflate_1.decompressSync)(buffer);
    const JsonString = (0, fflate_1.strFromU8)(decompressed);
    const templateNode = JSON.parse(JsonString);
    return templateNode;
}
function compareTemplateNodes(node1, node2) {
    if (node1.startTag.start.line < node2.startTag.start.line) {
        return -1;
    }
    else if (node1.startTag.start.line > node2.startTag.start.line) {
        return 1;
    }
    else {
        if (node1.startTag.start.column < node2.startTag.start.column) {
            return -1;
        }
        else if (node1.startTag.start.column > node2.startTag.start.column) {
            return 1;
        }
        else {
            return 0;
        }
    }
}
function areTemplateNodesEqual(node1, node2) {
    return (node1.path === node2.path &&
        node1.component === node2.component &&
        compareTemplateNodes(node1, node2) === 0);
}
//# sourceMappingURL=template.js.map