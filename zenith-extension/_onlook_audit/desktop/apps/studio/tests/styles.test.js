"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const css_tree_1 = require("css-tree");
const index_1 = __importDefault(require("../electron/preload/webview/style/index"));
(0, bun_test_1.describe)('CssStyleChange', () => {
    (0, bun_test_1.it)('finding nodes by selector', () => {
        const ast = (0, css_tree_1.parse)('.example { color: red } \n .example1 { color: blue }');
        const node1 = index_1.default.find(ast, '.example')[0];
        const node2 = index_1.default.find(ast, '.example1')[0];
        (0, bun_test_1.expect)((0, css_tree_1.generate)(node1)).toBe('.example { color: red }'.replace(/\s/g, ''));
        (0, bun_test_1.expect)((0, css_tree_1.generate)(node2)).toBe('.example1 { color: blue }'.replace(/\s/g, ''));
    });
    (0, bun_test_1.it)('Add rule', () => {
        const ast = (0, css_tree_1.parse)('');
        index_1.default.addRule(ast, '.example', 'color', 'blue');
        (0, bun_test_1.expect)((0, css_tree_1.generate)(ast)).toBe('.example { color: blue }'.replace(/\s/g, ''));
    });
    (0, bun_test_1.it)('Update rule', () => {
        const ast = (0, css_tree_1.parse)('.example { color: red }');
        const node = index_1.default.find(ast, '.example')[0];
        index_1.default.updateRule(node, 'color', 'blue');
        (0, bun_test_1.expect)((0, css_tree_1.generate)(ast)).toBe('.example { color: blue }'.replace(/\s/g, ''));
    });
});
//# sourceMappingURL=styles.test.js.map