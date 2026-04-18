"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDbUserSettings = exports.fromDbUserSettings = void 0;
const constants_1 = require("@onlook/constants");
const fromDbUserSettings = (settings) => {
    return {
        id: settings.id,
        chat: {
            autoApplyCode: settings.autoApplyCode ?? constants_1.DefaultSettings.CHAT_SETTINGS.autoApplyCode,
            expandCodeBlocks: settings.expandCodeBlocks ?? constants_1.DefaultSettings.CHAT_SETTINGS.expandCodeBlocks,
            showSuggestions: settings.showSuggestions ?? constants_1.DefaultSettings.CHAT_SETTINGS.showSuggestions,
            showMiniChat: settings.showMiniChat ?? constants_1.DefaultSettings.CHAT_SETTINGS.showMiniChat,
        },
        editor: {
            shouldWarnDelete: settings.shouldWarnDelete ?? constants_1.DefaultSettings.EDITOR_SETTINGS.shouldWarnDelete,
        },
    };
};
exports.fromDbUserSettings = fromDbUserSettings;
const toDbUserSettings = (userId, settings) => {
    return {
        id: settings.id,
        userId,
        autoApplyCode: settings.chat.autoApplyCode,
        expandCodeBlocks: settings.chat.expandCodeBlocks,
        showSuggestions: settings.chat.showSuggestions,
        showMiniChat: settings.chat.showMiniChat,
        shouldWarnDelete: settings.editor.shouldWarnDelete,
    };
};
exports.toDbUserSettings = toDbUserSettings;
//# sourceMappingURL=settings.js.map