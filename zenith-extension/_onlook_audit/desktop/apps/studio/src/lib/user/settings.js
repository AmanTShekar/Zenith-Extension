"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsManager = void 0;
const constants_1 = require("@onlook/models/constants");
const mobx_1 = require("mobx");
const utils_1 = require("../utils");
class UserSettingsManager {
    settings = null;
    defaultProjectPath = null;
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
        this.restoreSettings();
    }
    async restoreSettings() {
        this.settings = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_USER_SETTINGS);
        this.defaultProjectPath = await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.GET_CREATE_PROJECT_PATH);
    }
    async update(settings) {
        this.settings = { ...this.settings, ...settings };
        await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.UPDATE_USER_SETTINGS, settings);
    }
    async updateChat(newSettings) {
        const newChatSettings = {
            ...constants_1.DefaultSettings.CHAT_SETTINGS,
            ...this.settings?.chat,
            ...newSettings,
        };
        this.settings = {
            ...this.settings,
            chat: newChatSettings,
        };
        await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.UPDATE_USER_SETTINGS, {
            chat: newChatSettings,
        });
    }
    async updateEditor(newSettings) {
        const newEditorSettings = {
            ...constants_1.DefaultSettings.EDITOR_SETTINGS,
            ...this.settings?.editor,
            ...newSettings,
        };
        this.settings = {
            ...this.settings,
            editor: newEditorSettings,
        };
        await (0, utils_1.invokeMainChannel)(constants_1.MainChannels.UPDATE_USER_SETTINGS, {
            editor: newEditorSettings,
        });
    }
}
exports.UserSettingsManager = UserSettingsManager;
//# sourceMappingURL=settings.js.map