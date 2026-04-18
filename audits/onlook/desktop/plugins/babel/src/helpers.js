"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = compress;
exports.decompress = decompress;
exports.isReactFragment = isReactFragment;
const types_1 = __importDefault(require("@babel/types"));
const fflate_1 = require("fflate");
function compress(json) {
    // Compress JSON to base64
    const buf = (0, fflate_1.strToU8)(JSON.stringify(json));
    const compressed = (0, fflate_1.compressSync)(buf);
    const base64 = Buffer.from(compressed).toString('base64');
    return base64;
}
function decompress(base64) {
    // Decompress base64 to JSON
    const buffer = new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    const decompressed = (0, fflate_1.decompressSync)(buffer);
    const str = (0, fflate_1.strFromU8)(decompressed);
    return JSON.parse(str);
}
function isReactFragment(openingElement) {
    const name = openingElement.name;
    if (types_1.default.isJSXIdentifier(name)) {
        return name.name === 'Fragment';
    }
    if (types_1.default.isJSXMemberExpression(name)) {
        return (types_1.default.isJSXIdentifier(name.object) &&
            name.object.name === 'React' &&
            types_1.default.isJSXIdentifier(name.property) &&
            name.property.name === 'Fragment');
    }
    return false;
}
//# sourceMappingURL=helpers.js.map