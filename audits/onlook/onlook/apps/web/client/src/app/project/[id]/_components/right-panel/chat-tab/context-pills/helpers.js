"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTruncatedName = getTruncatedName;
exports.getContextIcon = getContextIcon;
exports.validateImageLimit = validateImageLimit;
const ai_1 = require("@onlook/ai");
const constants_1 = require("@onlook/constants");
const chat_1 = require("@onlook/models/chat");
const node_icon_1 = require("@onlook/ui/node-icon");
const utils_1 = require("@onlook/ui/utils");
function getTruncatedName(context) {
    let name = (0, ai_1.getContextLabel)(context);
    if (context.type === chat_1.MessageContextType.FILE || context.type === chat_1.MessageContextType.IMAGE) {
        name = (0, utils_1.getTruncatedFileName)(name);
    }
    if (context.type === chat_1.MessageContextType.HIGHLIGHT) {
        name = name.toLowerCase();
    }
    return name.length > 20 ? `${name.slice(0, 20)}...` : name;
}
function getContextIcon(context) {
    // Special case for highlight context which uses a custom component
    if (context.type === chat_1.MessageContextType.HIGHLIGHT) {
        return (<node_icon_1.NodeIcon tagName={context.displayName} iconClass="w-3 h-3 ml-1 mr-2 flex-none"/>);
    }
    const contextClass = (0, ai_1.getContextClass)(context.type);
    if (contextClass?.icon) {
        const IconComponent = contextClass.icon;
        return <IconComponent />;
    }
    return null;
}
function validateImageLimit(currentImages, additionalCount = 0) {
    const totalCount = currentImages.length + additionalCount;
    const maxImages = constants_1.DefaultSettings.CHAT_SETTINGS.maxImages;
    if (totalCount > maxImages) {
        return { success: false, errorMessage: `You can only add up to ${maxImages} images.` };
    }
    return { success: true, errorMessage: undefined };
}
//# sourceMappingURL=helpers.js.map