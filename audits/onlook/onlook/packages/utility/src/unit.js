"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToParsedValue = stringToParsedValue;
function stringToParsedValue(val, percent = false) {
    const matches = val.match(/([-+]?[0-9]*\.?[0-9]+)([a-zA-Z%]*)/);
    let num = matches ? Number.parseFloat(matches[1] ?? '0') : 0;
    let unit = matches && matches[2] ? matches[2] : 'px';
    if (percent && unit === '') {
        unit = '%';
        num = num <= 1 ? num * 100 : num;
    }
    return { num, unit };
}
//# sourceMappingURL=unit.js.map