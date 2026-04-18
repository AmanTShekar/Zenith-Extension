"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateCodeDiffRequest = getOrCreateCodeDiffRequest;
exports.addTailwindToRequest = addTailwindToRequest;
exports.getTailwindClasses = getTailwindClasses;
exports.createCSSRuleString = createCSSRuleString;
const style_1 = require("@onlook/models/style");
const tailwind_merge_1 = require("tailwind-merge");
const twTranslator_1 = require("/common/helpers/twTranslator");
async function getOrCreateCodeDiffRequest(oid, oidToCodeChange) {
    let diffRequest = oidToCodeChange.get(oid);
    if (!diffRequest) {
        diffRequest = {
            oid,
            structureChanges: [],
            attributes: {},
            textContent: null,
            overrideClasses: null,
        };
        oidToCodeChange.set(oid, diffRequest);
    }
    return diffRequest;
}
function addTailwindToRequest(request, styles) {
    const newClasses = getTailwindClasses(request.oid, styles);
    request.attributes['className'] = (0, tailwind_merge_1.twMerge)(request.attributes['className'] || '', newClasses);
}
function getTailwindClasses(oid, styles) {
    const customColors = Object.entries(styles).reduce((acc, [key, style]) => {
        if (style.type === style_1.StyleChangeType.Custom) {
            acc[key] = style;
        }
        return acc;
    }, {});
    const normalColors = Object.entries(styles).reduce((acc, [key, style]) => {
        if (style.type !== style_1.StyleChangeType.Custom) {
            acc[key] = style;
        }
        return acc;
    }, {});
    const css = createCSSRuleString(oid, normalColors);
    const tw = (0, twTranslator_1.CssToTailwindTranslator)(css);
    const twClasses = tw.data.map((res) => res.resultVal);
    const customClasses = Object.entries(customColors)
        .map(([key, style]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        const css = twTranslator_1.propertyMap.get(cssKey.trim());
        if (typeof css === 'function') {
            return css(style.value, true);
        }
    })
        .filter((v) => v !== undefined);
    return [...twClasses, ...customClasses];
}
function createCSSRuleString(oid, styles) {
    const cssString = Object.entries(styles)
        .map(([property, value]) => `${property.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value.value.trim()};`)
        .join(' ');
    return `${oid} { ${cssString} }`;
}
//# sourceMappingURL=helpers.js.map