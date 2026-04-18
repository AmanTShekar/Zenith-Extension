"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageManager = void 0;
const i18n_1 = __importDefault(require("@/i18n"));
const constants_1 = require("@onlook/models/constants");
class LanguageManager {
    constructor() {
        this.restore();
    }
    restore() {
        const savedLanguage = localStorage.getItem('app-language');
        if (savedLanguage) {
            i18n_1.default.changeLanguage(savedLanguage);
        }
        else {
            this.detectBrowserLanguage();
        }
    }
    update(language) {
        i18n_1.default.changeLanguage(language);
        localStorage.setItem('app-language', language);
    }
    detectBrowserLanguage() {
        const browserLanguages = navigator.languages || [navigator.language];
        // Try to find a matching language from browser preferences
        for (const browserLang of browserLanguages) {
            const langCode = browserLang.split('-')[0]; // Get base language code (e.g., 'en' from 'en-US')
            if (Object.values(constants_1.Language).includes(langCode)) {
                this.update(langCode);
                return;
            }
        }
    }
}
exports.LanguageManager = LanguageManager;
//# sourceMappingURL=language.js.map