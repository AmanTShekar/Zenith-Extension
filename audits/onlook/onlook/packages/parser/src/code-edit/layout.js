"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectPreloadScript = void 0;
exports.removeDeprecatedPreloadScripts = removeDeprecatedPreloadScripts;
exports.scanForPreloadScript = scanForPreloadScript;
const constants_1 = require("@onlook/constants");
const packages_1 = require("../packages");
const injectPreloadScript = (ast) => {
    const hasScriptImport = isScriptImported(ast);
    if (!hasScriptImport)
        addScriptImport(ast);
    const { scriptCount, deprecatedScriptCount, injectedCorrectly } = scanForPreloadScript(ast);
    if (scriptCount === 1 && deprecatedScriptCount === 0 && injectedCorrectly) {
        return ast;
    }
    removeDeprecatedPreloadScripts(ast);
    let scriptInjected = false;
    let htmlFound = false;
    (0, packages_1.traverse)(ast, {
        JSXElement(path) {
            const name = path.node.openingElement.name;
            if (!packages_1.t.isJSXIdentifier(name))
                return;
            if (name.name === 'html') {
                htmlFound = true;
                normalizeSelfClosingTag(path.node);
            }
            if (name.name === 'body') {
                normalizeSelfClosingTag(path.node);
                if (!scriptInjected) {
                    addScriptToJSXElement(path.node);
                    scriptInjected = true;
                }
            }
        },
    });
    if (!scriptInjected && htmlFound) {
        (0, packages_1.traverse)(ast, {
            JSXElement(path) {
                if (packages_1.t.isJSXIdentifier(path.node.openingElement.name, { name: 'html' })) {
                    createBodyTag(path.node);
                    scriptInjected = true;
                    path.stop();
                }
            },
        });
    }
    if (!scriptInjected && !htmlFound) {
        wrapWithHtmlAndBody(ast);
    }
    return ast;
};
exports.injectPreloadScript = injectPreloadScript;
function normalizeSelfClosingTag(node) {
    if (node.openingElement.selfClosing) {
        node.openingElement.selfClosing = false;
        if (packages_1.t.isJSXIdentifier(node.openingElement.name)) {
            node.closingElement = packages_1.t.jsxClosingElement(packages_1.t.jsxIdentifier(node.openingElement.name.name));
        }
        else {
            node.closingElement = packages_1.t.jsxClosingElement(node.openingElement.name);
        }
        node.children = [];
    }
}
function isScriptImported(ast) {
    let found = false;
    (0, packages_1.traverse)(ast, {
        ImportDeclaration(path) {
            if (packages_1.t.isStringLiteral(path.node.source, { value: 'next/script' }) &&
                path.node.specifiers.some((s) => packages_1.t.isImportDefaultSpecifier(s) &&
                    packages_1.t.isIdentifier(s.local, { name: 'Script' }))) {
                found = true;
                path.stop();
            }
        },
    });
    return found;
}
function addScriptImport(ast) {
    const scriptImport = packages_1.t.importDeclaration([packages_1.t.importDefaultSpecifier(packages_1.t.identifier('Script'))], packages_1.t.stringLiteral('next/script'));
    let insertIndex = 0;
    for (let i = 0; i < ast.program.body.length; i++) {
        if (packages_1.t.isImportDeclaration(ast.program.body[i]))
            insertIndex = i + 1;
        else
            break;
    }
    ast.program.body.splice(insertIndex, 0, scriptImport);
}
function getPreloadScript() {
    return packages_1.t.jsxElement(packages_1.t.jsxOpeningElement(packages_1.t.jsxIdentifier('Script'), [
        packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier('src'), packages_1.t.stringLiteral(constants_1.ONLOOK_PRELOAD_SCRIPT_SRC)),
        packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier('strategy'), packages_1.t.stringLiteral('afterInteractive')),
        packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier('type'), packages_1.t.stringLiteral('module')),
        packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier('id'), packages_1.t.stringLiteral('onlook-preload-script')),
    ], false), packages_1.t.jsxClosingElement(packages_1.t.jsxIdentifier('Script')), [], false);
}
function addScriptToJSXElement(node) {
    const alreadyInjected = node.children.some((child) => packages_1.t.isJSXElement(child) &&
        packages_1.t.isJSXIdentifier(child.openingElement.name, { name: 'Script' }) &&
        child.openingElement.attributes.some((attr) => packages_1.t.isJSXAttribute(attr) &&
            packages_1.t.isJSXIdentifier(attr.name, { name: 'src' }) &&
            packages_1.t.isStringLiteral(attr.value, { value: constants_1.ONLOOK_PRELOAD_SCRIPT_SRC })));
    if (!alreadyInjected) {
        node.children.push(packages_1.t.jsxText('\n'));
        node.children.push(getPreloadScript());
        node.children.push(packages_1.t.jsxText('\n'));
    }
}
function createBodyTag(htmlElement) {
    const body = packages_1.t.jsxElement(packages_1.t.jsxOpeningElement(packages_1.t.jsxIdentifier('body'), []), packages_1.t.jsxClosingElement(packages_1.t.jsxIdentifier('body')), [getPreloadScript()], false);
    htmlElement.children.push(packages_1.t.jsxText('\n'), body, packages_1.t.jsxText('\n'));
}
function wrapWithHtmlAndBody(ast) {
    (0, packages_1.traverse)(ast, {
        ArrowFunctionExpression(path) {
            const { body } = path.node;
            if (!packages_1.t.isJSXElement(body) && !packages_1.t.isJSXFragment(body)) {
                return;
            }
            const children = [getPreloadScript(), packages_1.t.jsxText('\n'), body];
            const newBody = packages_1.t.jsxElement(packages_1.t.jsxOpeningElement(packages_1.t.jsxIdentifier('body'), []), packages_1.t.jsxClosingElement(packages_1.t.jsxIdentifier('body')), children, false);
            const html = packages_1.t.jsxElement(packages_1.t.jsxOpeningElement(packages_1.t.jsxIdentifier('html'), [
                packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier('lang'), packages_1.t.stringLiteral('en')),
            ]), packages_1.t.jsxClosingElement(packages_1.t.jsxIdentifier('html')), [newBody], false);
            path.node.body = packages_1.t.blockStatement([packages_1.t.returnStatement(html)]);
            path.stop();
        },
        ReturnStatement(path) {
            const arg = path.node.argument;
            if (!arg)
                return;
            const children = [getPreloadScript(), packages_1.t.jsxText('\n')];
            if (packages_1.t.isJSXElement(arg) || packages_1.t.isJSXFragment(arg)) {
                children.push(arg);
            }
            else if (packages_1.t.isIdentifier(arg) ||
                packages_1.t.isMemberExpression(arg) ||
                packages_1.t.isCallExpression(arg) ||
                packages_1.t.isConditionalExpression(arg)) {
                children.push(packages_1.t.jsxExpressionContainer(arg));
            }
            else {
                return; // skip wrapping unsupported types
            }
            const body = packages_1.t.jsxElement(packages_1.t.jsxOpeningElement(packages_1.t.jsxIdentifier('body'), []), packages_1.t.jsxClosingElement(packages_1.t.jsxIdentifier('body')), children, false);
            const html = packages_1.t.jsxElement(packages_1.t.jsxOpeningElement(packages_1.t.jsxIdentifier('html'), [
                packages_1.t.jsxAttribute(packages_1.t.jsxIdentifier('lang'), packages_1.t.stringLiteral('en')),
            ]), packages_1.t.jsxClosingElement(packages_1.t.jsxIdentifier('html')), [body], false);
            path.node.argument = html;
            path.stop();
        },
    });
}
function removeDeprecatedPreloadScripts(ast) {
    (0, packages_1.traverse)(ast, {
        JSXElement(path) {
            const isScript = packages_1.t.isJSXIdentifier(path.node.openingElement.name, { name: 'Script' });
            if (!isScript)
                return;
            const srcAttr = path.node.openingElement.attributes.find((attr) => packages_1.t.isJSXAttribute(attr) &&
                packages_1.t.isJSXIdentifier(attr.name, { name: 'src' }) &&
                packages_1.t.isStringLiteral(attr.value));
            const src = srcAttr?.value;
            if (src &&
                packages_1.t.isStringLiteral(src) &&
                constants_1.DEPRECATED_PRELOAD_SCRIPT_SRCS.some((deprecatedSrc) => src.value === deprecatedSrc)) {
                console.log('removing deprecated script', src.value);
                path.remove();
            }
        },
    });
}
function scanForPreloadScript(ast) {
    let scriptCount = 0;
    let deprecatedScriptCount = 0;
    let injectedCorrectly = false;
    (0, packages_1.traverse)(ast, {
        JSXElement(path) {
            const isScript = packages_1.t.isJSXIdentifier(path.node.openingElement.name, { name: 'Script' });
            if (!isScript)
                return;
            const srcAttr = path.node.openingElement.attributes.find((attr) => packages_1.t.isJSXAttribute(attr) &&
                packages_1.t.isJSXIdentifier(attr.name, { name: 'src' }) &&
                packages_1.t.isStringLiteral(attr.value));
            const src = srcAttr?.value;
            if (!src || !packages_1.t.isStringLiteral(src))
                return;
            if (src.value === constants_1.ONLOOK_PRELOAD_SCRIPT_SRC) {
                scriptCount++;
                // Check if this script is inside a body tag
                const parentBodyPath = path.findParent((parentPath) => {
                    if (parentPath.isJSXElement()) {
                        const name = parentPath.node.openingElement.name;
                        return packages_1.t.isJSXIdentifier(name, { name: 'body' });
                    }
                    return false;
                });
                if (parentBodyPath) {
                    injectedCorrectly = true;
                }
            }
            else if (constants_1.DEPRECATED_PRELOAD_SCRIPT_SRCS.some((deprecatedSrc) => src.value === deprecatedSrc)) {
                deprecatedScriptCount++;
            }
        },
    });
    return {
        scriptCount,
        deprecatedScriptCount,
        injectedCorrectly: scriptCount === 1 && injectedCorrectly,
    };
}
//# sourceMappingURL=layout.js.map