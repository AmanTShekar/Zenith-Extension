"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyles = getStyles;
exports.getComputedStyleByDomId = getComputedStyleByDomId;
const utility_1 = require("@onlook/utility");
const helpers_1 = require("/common/helpers");
function getStyles(element) {
    const computed = getComputedStyle(element);
    const inline = getInlineStyles(element);
    const stylesheet = getStylesheetStyles(element);
    const defined = {
        width: 'auto',
        height: 'auto',
        ...inline,
        ...stylesheet,
    };
    return {
        defined,
        computed,
    };
}
function getComputedStyleByDomId(domId) {
    const element = (0, helpers_1.elementFromDomId)(domId);
    if (!element) {
        return {};
    }
    return getComputedStyle(element);
}
function getComputedStyle(element) {
    const computedStyle = (0, utility_1.jsonClone)(window.getComputedStyle(element));
    return computedStyle;
}
function getInlineStyles(element) {
    const styles = {};
    const inlineStyles = parseCssText(element.style.cssText);
    Object.entries(inlineStyles).forEach(([prop, value]) => {
        styles[prop] = value;
    });
    return styles;
}
function getStylesheetStyles(element) {
    const styles = {};
    const sheets = document.styleSheets;
    for (let i = 0; i < sheets.length; i++) {
        let rules;
        try {
            rules = Array.from(sheets[i].cssRules) || sheets[i].rules;
        }
        catch (e) {
            console.warn("Can't read the css rules of: " + sheets[i].href, e);
            continue;
        }
        for (let j = 0; j < rules.length; j++) {
            try {
                if (element.matches(rules[j].selectorText)) {
                    const ruleStyles = parseCssText(rules[j].style.cssText);
                    Object.entries(ruleStyles).forEach(([prop, value]) => (styles[prop] = value));
                }
            }
            catch (e) {
                console.warn('Error', e);
            }
        }
    }
    return styles;
}
function parseCssText(cssText) {
    const styles = {};
    cssText.split(';').forEach((style) => {
        style = style.trim();
        if (!style) {
            return;
        }
        const [property, ...values] = style.split(':');
        styles[property.trim()] = values.join(':').trim();
    });
    return styles;
}
//# sourceMappingURL=style.js.map