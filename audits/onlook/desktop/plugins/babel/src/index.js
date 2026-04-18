"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = babelPluginOnlook;
const types_1 = __importDefault(require("@babel/types"));
const constants_1 = require("./constants");
const helpers_1 = require("./helpers");
function babelPluginOnlook({ root = process.cwd() }) {
    const componentStack = [];
    return {
        visitor: {
            FunctionDeclaration: {
                enter(path) {
                    const componentName = path.node.id.name;
                    componentStack.push(componentName);
                },
                exit(path) {
                    componentStack.pop();
                },
            },
            ClassDeclaration: {
                enter(path) {
                    const componentName = path.node.id.name;
                    componentStack.push(componentName);
                },
                exit(path) {
                    componentStack.pop();
                },
            },
            VariableDeclaration: {
                enter(path) {
                    const componentName = path.node.declarations[0].id.name;
                    componentStack.push(componentName);
                },
                exit(path) {
                    componentStack.pop();
                },
            },
            JSXElement(path, state) {
                const filename = state.file.opts.filename;
                const nodeModulesPath = `${root}/node_modules`;
                // Ignore node_modules
                if (filename.startsWith(nodeModulesPath)) {
                    return;
                }
                // Ignore React fragment
                if ((0, helpers_1.isReactFragment)(path.node.openingElement)) {
                    return;
                }
                // Ensure `loc` exists before accessing its properties
                if (!path.node.openingElement.loc || !path.node.openingElement.loc.start || !path.node.openingElement.loc.end) {
                    return;
                }
                const attributeValue = getTemplateNode(path, filename, componentStack);
                // Create the custom attribute
                const onlookAttribute = types_1.default.jSXAttribute(types_1.default.jSXIdentifier(constants_1.DATA_ONLOOK_ID), types_1.default.stringLiteral(attributeValue));
                // Append the attribute to the element
                path.node.openingElement.attributes.push(onlookAttribute);
            }
        },
    };
}
function getTemplateNode(path, filename, componentStack) {
    const startTag = getTemplateTag(path.node.openingElement);
    const endTag = path.node.closingElement ? getTemplateTag(path.node.closingElement) : undefined;
    const componentName = componentStack.length > 0 ? componentStack[componentStack.length - 1] : undefined;
    const domNode = {
        path: filename,
        startTag,
        endTag,
        component: componentName
    };
    return (0, helpers_1.compress)(domNode);
}
function getTemplateTag(element) {
    return {
        start: {
            line: element.loc.start.line,
            column: element.loc.start.column + 1
        },
        end: {
            line: element.loc.end.line,
            column: element.loc.end.column
        }
    };
}
//# sourceMappingURL=index.js.map