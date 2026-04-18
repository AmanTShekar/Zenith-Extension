"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMDXComponents = getMDXComponents;
const mdx_1 = __importDefault(require("fumadocs-ui/mdx"));
// use this function to get MDX components, you will need it for rendering MDX
function getMDXComponents(components) {
    return {
        ...mdx_1.default,
        ...components,
    };
}
//# sourceMappingURL=mdx-components.js.map