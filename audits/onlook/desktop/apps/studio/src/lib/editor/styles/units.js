"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendCssUnit = exports.ELEMENT_STYLE_UNITS = void 0;
exports.ELEMENT_STYLE_UNITS = ['px', '%', 'rem', 'em', 'vh', 'vw'];
const appendCssUnit = (input, defaultUnit = 'px') => {
    const regex = new RegExp(`^[-+]?\\d*\\.?\\d+(${exports.ELEMENT_STYLE_UNITS.join('|')})?$`);
    if (regex.test(input)) {
        if (exports.ELEMENT_STYLE_UNITS.some((unit) => input.endsWith(unit))) {
            return input;
        }
        else {
            return input + defaultUnit;
        }
    }
    else {
        console.error('Invalid input');
        return input;
    }
};
exports.appendCssUnit = appendCssUnit;
//# sourceMappingURL=units.js.map