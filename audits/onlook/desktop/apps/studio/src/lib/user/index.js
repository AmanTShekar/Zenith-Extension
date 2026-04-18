"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const mobx_1 = require("mobx");
const language_1 = require("./language");
const settings_1 = require("./settings");
const subscription_1 = require("./subscription");
class UserManager {
    subscriptionManager = new subscription_1.SubscriptionManager();
    settingsManager = new settings_1.UserSettingsManager();
    languageManager = new language_1.LanguageManager();
    constructor() {
        (0, mobx_1.makeAutoObservable)(this);
    }
    get subscription() {
        return this.subscriptionManager;
    }
    get settings() {
        return this.settingsManager;
    }
    get language() {
        return this.languageManager;
    }
}
exports.UserManager = UserManager;
//# sourceMappingURL=index.js.map