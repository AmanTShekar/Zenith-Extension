"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultUserSettings = void 0;
const constants_1 = require("@onlook/constants");
const uuid_1 = require("uuid");
const createDefaultUserSettings = (userId) => {
    return {
        id: (0, uuid_1.v4)(),
        userId,
        autoApplyCode: constants_1.DefaultSettings.CHAT_SETTINGS.autoApplyCode,
        expandCodeBlocks: constants_1.DefaultSettings.CHAT_SETTINGS.expandCodeBlocks,
        showSuggestions: constants_1.DefaultSettings.CHAT_SETTINGS.showSuggestions,
        showMiniChat: constants_1.DefaultSettings.CHAT_SETTINGS.showMiniChat,
        shouldWarnDelete: constants_1.DefaultSettings.EDITOR_SETTINGS.shouldWarnDelete,
    };
};
exports.createDefaultUserSettings = createDefaultUserSettings;
//# sourceMappingURL=user-settings.js.map