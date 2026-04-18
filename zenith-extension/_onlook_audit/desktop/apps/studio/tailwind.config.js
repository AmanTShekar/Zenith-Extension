"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tailwind_config_1 = __importDefault(require("@onlook/ui/tailwind.config"));
const colors_js_1 = __importDefault(require("tailwindcss/colors.js"));
const typography_1 = __importDefault(require("@tailwindcss/typography"));
function flattenColors(colors, prefix = '') {
    return Object.keys(colors).reduce((acc, key) => {
        const value = colors[key];
        const newKey = prefix ? `${prefix}-${key}` : key;
        if (typeof value === 'string') {
            return { ...acc, [newKey]: value };
        }
        if (typeof value === 'object') {
            return { ...acc, ...flattenColors(value, newKey) };
        }
        return acc;
    }, {});
}
function exposeColorsAsCssVariables({ addBase }) {
    const flatColors = flattenColors(colors_js_1.default);
    addBase({
        ':root': Object.fromEntries(Object.entries(flatColors).map(([key, value]) => [`--color-${key}`, value])),
    });
}
exports.default = {
    content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
    presets: [tailwind_config_1.default],
    plugins: [typography_1.default, exposeColorsAsCssVariables],
};
//# sourceMappingURL=tailwind.config.js.map