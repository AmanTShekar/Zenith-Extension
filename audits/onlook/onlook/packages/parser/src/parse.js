"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAstFromContent = getAstFromContent;
exports.getAstFromCodeblock = getAstFromCodeblock;
exports.getContentFromAst = getContentFromAst;
exports.removeIdsFromAst = removeIdsFromAst;
const constants_1 = require("@onlook/constants");
const helpers_1 = require("./helpers");
const packages_1 = require("./packages");
function getAstFromContent(content) {
    try {
        return (0, packages_1.parse)(content, {
            sourceType: 'module',
            plugins: [
                'typescript',
                'jsx',
                ['decorators', { decoratorsBeforeExport: true }],
                'classStaticBlock',
                'dynamicImport',
                'importMeta',
            ],
        });
    }
    catch (e) {
        console.error(e);
        return null;
    }
}
function getAstFromCodeblock(code, stripIds = false) {
    const ast = getAstFromContent(code);
    if (!ast) {
        return;
    }
    if (stripIds) {
        removeIdsFromAst(ast);
    }
    const jsxElement = ast.program.body.find((node) => packages_1.t.isExpressionStatement(node) && packages_1.t.isJSXElement(node.expression));
    if (jsxElement &&
        packages_1.t.isExpressionStatement(jsxElement) &&
        packages_1.t.isJSXElement(jsxElement.expression)) {
        return jsxElement.expression;
    }
}
async function getContentFromAst(ast, originalContent) {
    return (0, packages_1.generate)(ast, {
        retainLines: true,
        compact: false,
        comments: true,
        concise: false,
        minified: false,
        jsonCompatibleStrings: false,
        shouldPrintComment: () => true,
        retainFunctionParens: true,
    }, originalContent).code;
}
function removeIdsFromAst(ast) {
    (0, packages_1.traverse)(ast, {
        JSXOpeningElement(path) {
            if ((0, helpers_1.isReactFragment)(path.node)) {
                return;
            }
            const attributes = path.node.attributes;
            const existingAttrIndex = attributes.findIndex((attr) => attr.name?.name === constants_1.EditorAttributes.DATA_ONLOOK_ID);
            if (existingAttrIndex !== -1) {
                attributes.splice(existingAttrIndex, 1);
            }
        },
        JSXAttribute(path) {
            if (path.node.name.name === 'key') {
                const value = path.node.value;
                if (packages_1.t.isStringLiteral(value) &&
                    value.value.startsWith(constants_1.EditorAttributes.ONLOOK_MOVE_KEY_PREFIX)) {
                    return path.remove();
                }
            }
        },
    });
}
//# sourceMappingURL=parse.js.map