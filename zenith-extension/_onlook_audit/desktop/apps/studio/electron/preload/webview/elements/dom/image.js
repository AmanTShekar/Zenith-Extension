"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertImage = insertImage;
exports.removeImage = removeImage;
const style_1 = require("@onlook/models/style");
const style_2 = __importDefault(require("../../style"));
function insertImage(domId, image) {
    style_2.default.updateStyle(domId, {
        backgroundImage: { value: `url(${image})`, type: style_1.StyleChangeType.Value },
    });
}
function removeImage(domId) {
    style_2.default.updateStyle(domId, {
        backgroundImage: { value: 'none', type: style_1.StyleChangeType.Value },
    });
}
//# sourceMappingURL=image.js.map