"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const react_i18next_1 = require("react-i18next");
const translation_json_1 = __importDefault(require("./locales/en/translation.json"));
const translation_json_2 = __importDefault(require("./locales/ja/translation.json"));
const translation_json_3 = __importDefault(require("./locales/ko/translation.json"));
const translation_json_4 = __importDefault(require("./locales/zh/translation.json"));
const resources = {
    en: {
        translation: translation_json_1.default,
    },
    ja: {
        translation: translation_json_2.default,
    },
    zh: {
        translation: translation_json_4.default,
    },
    ko: {
        translation: translation_json_3.default,
    },
};
i18next_1.default.use(react_i18next_1.initReactI18next).init({
    resources,
    lng: 'en',
    interpolation: {
        escapeValue: false,
    },
});
exports.default = i18next_1.default;
//# sourceMappingURL=i18n.js.map