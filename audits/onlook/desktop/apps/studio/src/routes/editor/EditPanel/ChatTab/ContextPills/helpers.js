"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTruncatedName = getTruncatedName;
exports.getContextIcon = getContextIcon;
const utils_1 = require("@/lib/utils");
const chat_1 = require("@onlook/models/chat");
const index_1 = require("@onlook/ui/icons/index");
const react_1 = __importDefault(require("react"));
const NodeIcon_1 = __importDefault(require("../../../LayersPanel/Tree/NodeIcon"));
const helpers_1 = require("/common/helpers");
function getTruncatedName(context) {
    let name = context.displayName;
    if (context.type === 'file' || context.type === 'image') {
        name = (0, utils_1.getTruncatedFileName)(name);
    }
    if (context.type === 'highlight') {
        name = name.toLowerCase();
    }
    return name.length > 20 ? `${name.slice(0, 20)}...` : name;
}
function getContextIcon(context) {
    let icon = null;
    switch (context.type) {
        case chat_1.MessageContextType.FILE:
            icon = index_1.Icons.File;
            break;
        case chat_1.MessageContextType.IMAGE:
            icon = index_1.Icons.Image;
            break;
        case chat_1.MessageContextType.ERROR:
            icon = index_1.Icons.InfoCircled;
            break;
        case chat_1.MessageContextType.HIGHLIGHT:
            return (<NodeIcon_1.default tagName={context.displayName} iconClass="w-3 h-3 ml-1 mr-2 flex-none"/>);
        case chat_1.MessageContextType.PROJECT:
            icon = index_1.Icons.Cube;
            break;
        default:
            (0, helpers_1.assertNever)(context);
    }
    if (icon) {
        return react_1.default.createElement(icon);
    }
}
//# sourceMappingURL=helpers.js.map