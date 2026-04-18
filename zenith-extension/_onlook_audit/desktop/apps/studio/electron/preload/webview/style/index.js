"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("@onlook/models/constants");
const bundles_1 = require("../bundles/");
const helpers_1 = require("/common/helpers");
class CSSManager {
    static instance;
    constructor() { }
    injectDefaultStyles() {
        try {
            const styleElement = document.createElement('style');
            styleElement.id = constants_1.EditorAttributes.ONLOOK_DEFAULT_STYLESHEET_ID;
            styleElement.textContent = `
            [${constants_1.EditorAttributes.DATA_ONLOOK_EDITING_TEXT}="true"] {
                opacity: 0;
            }
        `;
            document.head.appendChild(styleElement);
        }
        catch (error) {
            console.warn('Error injecting default styles', error);
        }
    }
    static getInstance() {
        if (!CSSManager.instance) {
            CSSManager.instance = new CSSManager();
        }
        return CSSManager.instance;
    }
    get stylesheet() {
        const styleElement = (document.getElementById(constants_1.EditorAttributes.ONLOOK_STYLESHEET_ID) || this.createStylesheet());
        styleElement.textContent = styleElement.textContent || '';
        return bundles_1.cssTree.parse(styleElement.textContent);
    }
    set stylesheet(ast) {
        const styleElement = (document.getElementById(constants_1.EditorAttributes.ONLOOK_STYLESHEET_ID) || this.createStylesheet());
        styleElement.textContent = bundles_1.cssTree.generate(ast);
    }
    createStylesheet() {
        const styleElement = document.createElement('style');
        styleElement.id = constants_1.EditorAttributes.ONLOOK_STYLESHEET_ID;
        document.head.appendChild(styleElement);
        return styleElement;
    }
    clear() {
        this.stylesheet = bundles_1.cssTree.parse('');
    }
    find(ast, selectorToFind) {
        const matchingNodes = [];
        bundles_1.cssTree.walk(ast, {
            visit: 'Rule',
            enter: (node) => {
                if (node.type === 'Rule') {
                    const rule = node;
                    if (rule.prelude.type === 'SelectorList') {
                        rule.prelude.children.forEach((selector) => {
                            const selectorText = bundles_1.cssTree.generate(selector);
                            if (selectorText === selectorToFind) {
                                matchingNodes.push(node);
                            }
                        });
                    }
                }
            },
        });
        return matchingNodes;
    }
    updateStyle(domId, style) {
        const selector = (0, helpers_1.selectorFromDomId)(domId, false);
        const ast = this.stylesheet;
        for (const [property, value] of Object.entries(style)) {
            const cssProperty = this.jsToCssProperty(property);
            const matchingNodes = this.find(ast, selector);
            if (!matchingNodes.length) {
                this.addRule(ast, selector, cssProperty, value.value);
            }
            else {
                matchingNodes.forEach((node) => {
                    if (node.type === 'Rule') {
                        this.updateRule(node, cssProperty, value.value);
                    }
                });
            }
        }
        this.stylesheet = ast;
    }
    addRule(ast, selector, property, value) {
        const newRule = {
            type: 'Rule',
            prelude: {
                type: 'SelectorList',
                children: [
                    {
                        type: 'Selector',
                        children: [
                            {
                                type: 'TypeSelector',
                                name: selector,
                            },
                        ],
                    },
                ],
            },
            block: {
                type: 'Block',
                children: [
                    {
                        type: 'Declaration',
                        property: property,
                        value: { type: 'Raw', value: value },
                    },
                ],
            },
        };
        if (ast.type === 'StyleSheet') {
            ast.children.push(newRule);
        }
    }
    updateRule(rule, property, value) {
        let found = false;
        bundles_1.cssTree.walk(rule.block, {
            visit: 'Declaration',
            enter: (decl) => {
                if (decl.property === property) {
                    decl.value = { type: 'Raw', value: value };
                    if (value === '') {
                        rule.block.children = rule.block.children.filter((decl) => decl.property !== property);
                    }
                    found = true;
                }
            },
        });
        if (!found) {
            if (value === '') {
                rule.block.children = rule.block.children.filter((decl) => decl.property !== property);
            }
            else {
                rule.block.children.push({
                    type: 'Declaration',
                    property: property,
                    value: { type: 'Raw', value: value },
                    important: false,
                });
            }
        }
    }
    getJsStyle(selector) {
        const ast = this.stylesheet;
        const matchingNodes = this.find(ast, selector);
        const styles = {};
        if (!matchingNodes.length) {
            return styles;
        }
        matchingNodes.forEach((node) => {
            if (node.type === 'Rule') {
                bundles_1.cssTree.walk(node, {
                    visit: 'Declaration',
                    enter: (decl) => {
                        styles[this.cssToJsProperty(decl.property)] = decl.value.value;
                    },
                });
            }
        });
        return styles;
    }
    jsToCssProperty(key) {
        if (!key) {
            return '';
        }
        return key.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
    cssToJsProperty(key) {
        if (!key) {
            return '';
        }
        return key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }
    removeStyles(domId, jsStyles) {
        const selector = (0, helpers_1.selectorFromDomId)(domId, false);
        const ast = this.stylesheet;
        const matchingNodes = this.find(ast, selector);
        matchingNodes.forEach((node) => {
            if (node.type === 'Rule') {
                const cssProperties = jsStyles.map((style) => this.jsToCssProperty(style));
                node.block.children = node.block.children.filter((decl) => !cssProperties.includes(decl.property));
            }
        });
        this.stylesheet = ast;
    }
}
exports.default = CSSManager.getInstance();
//# sourceMappingURL=index.js.map