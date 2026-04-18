"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDefaultFontFromRootLayout = exports.getLayoutContext = exports.traverseClassName = exports.getCurrentDefaultFont = exports.updateDefaultFontInRootLayout = exports.removeFontVariableFromRootLayout = exports.addFontVariableToRootLayout = void 0;
const lodash_1 = require("lodash");
const fonts_1 = require("@onlook/fonts");
const parser_1 = require("@onlook/parser");
const helpers_1 = require("../sandbox/helpers");
const fontImportPath = './fonts';
const addFontVariableToRootLayout = async (fontId, editorEngine) => {
    try {
        const context = await (0, exports.getLayoutContext)(editorEngine);
        if (!context)
            return false;
        const { layoutPath, targetElements } = context;
        const fontName = (0, lodash_1.camelCase)(fontId);
        let hasUpdated = false;
        const results = await (0, exports.traverseClassName)(layoutPath, targetElements, editorEngine);
        if (!results)
            return false;
        const { classNameAttrs, elementsFound, ast } = results;
        if (elementsFound) {
            for (const classNameAttr of classNameAttrs) {
                const updated = (0, fonts_1.updateClassNameWithFontVar)(classNameAttr, fontName);
                if (updated) {
                    hasUpdated = true;
                }
            }
        }
        if (hasUpdated) {
            if (ast) {
                const newContent = (0, fonts_1.addFontImportToFile)(fontImportPath, fontName, ast);
                if (!newContent) {
                    return false;
                }
                await editorEngine.activeSandbox.writeFile(layoutPath, newContent);
                return true;
            }
        }
        return false;
    }
    catch (error) {
        console.error(`Error adding font variable to layout:`, error);
        return false;
    }
};
exports.addFontVariableToRootLayout = addFontVariableToRootLayout;
/**
 * Removes a font variable from the layout file
 */
const removeFontVariableFromRootLayout = async (fontId, editorEngine) => {
    try {
        const context = await (0, exports.getLayoutContext)(editorEngine);
        if (!context)
            return false;
        const { layoutPath, targetElements } = context;
        let hasUpdated = false;
        const fontName = (0, lodash_1.camelCase)(fontId);
        // Traverse the className attributes in the layout file
        // and remove the font variable from the className attributes
        const results = await (0, exports.traverseClassName)(layoutPath, targetElements, editorEngine, true);
        if (!results)
            return false;
        const { classNameAttrs, elementsFound, ast } = results;
        if (elementsFound) {
            for (const classNameAttr of classNameAttrs) {
                const updated = (0, fonts_1.removeFontsFromClassName)(classNameAttr, {
                    fontIds: [fontName],
                });
                if (updated) {
                    hasUpdated = true;
                }
            }
        }
        if (hasUpdated && ast) {
            // Remove the font import if it exists
            const newContent = (0, fonts_1.removeFontImportFromFile)(fontImportPath, fontName, ast);
            if (!newContent) {
                return false;
            }
            await editorEngine.activeSandbox.writeFile(layoutPath, newContent);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error(`Error removing font variable`, error);
        return false;
    }
};
exports.removeFontVariableFromRootLayout = removeFontVariableFromRootLayout;
/**
 * Updates the default font in a layout file by modifying className attributes
 */
const updateDefaultFontInRootLayout = async (font, editorEngine) => {
    const context = await (0, exports.getLayoutContext)(editorEngine);
    if (!context)
        return null;
    const { layoutPath, targetElements, layoutContent } = context;
    let updatedAst = false;
    const fontClassName = `font-${font.id}`;
    const results = await (0, exports.traverseClassName)(layoutPath, targetElements, editorEngine, true);
    if (!results)
        return null;
    const { classNameAttrs, elementsFound, ast } = results;
    if (elementsFound) {
        for (const classNameAttr of classNameAttrs) {
            if (parser_1.t.isStringLiteral(classNameAttr.value)) {
                classNameAttr.value = (0, fonts_1.createStringLiteralWithFont)(fontClassName, classNameAttr.value.value);
                updatedAst = true;
            }
            else if (parser_1.t.isJSXExpressionContainer(classNameAttr.value)) {
                const expr = classNameAttr.value.expression;
                if (parser_1.t.isTemplateLiteral(expr)) {
                    const updated = (0, fonts_1.updateTemplateLiteralWithFontClass)(expr, fontClassName);
                    if (updated) {
                        updatedAst = true;
                    }
                }
            }
        }
    }
    if (updatedAst && ast) {
        const { code } = (0, parser_1.generate)(ast);
        const codeDiff = {
            original: layoutContent,
            generated: code,
            path: layoutPath,
        };
        return codeDiff;
    }
    return null;
};
exports.updateDefaultFontInRootLayout = updateDefaultFontInRootLayout;
/**
 * Gets the current default font from the project
 */
const getCurrentDefaultFont = async (editorEngine) => {
    try {
        const context = await (0, exports.getLayoutContext)(editorEngine);
        if (!context)
            return null;
        const { layoutPath, targetElements } = context;
        let defaultFont = null;
        const normalizedFilePath = (0, helpers_1.normalizePath)(layoutPath);
        const results = await (0, exports.traverseClassName)(normalizedFilePath, targetElements, editorEngine);
        if (!results)
            return null;
        const { classNameAttrs, elementsFound } = results;
        if (elementsFound) {
            for (const classNameAttr of classNameAttrs) {
                if (parser_1.t.isStringLiteral(classNameAttr.value)) {
                    defaultFont = (0, fonts_1.findFontClass)(classNameAttr.value.value);
                }
                else if (parser_1.t.isJSXExpressionContainer(classNameAttr.value)) {
                    const expr = classNameAttr.value.expression;
                    if (!expr || !parser_1.t.isTemplateLiteral(expr)) {
                        continue;
                    }
                    const firstQuasi = expr.quasis[0];
                    if (firstQuasi) {
                        defaultFont = (0, fonts_1.findFontClass)(firstQuasi.value.raw);
                    }
                }
            }
        }
        return defaultFont;
    }
    catch (error) {
        console.error('Error getting current font:', error);
        return null;
    }
};
exports.getCurrentDefaultFont = getCurrentDefaultFont;
const traverseClassName = async (filePath, targetElements, editorEngine, allElements = false) => {
    const sandbox = editorEngine.activeSandbox;
    if (!sandbox) {
        console.error('No sandbox session found');
        return null;
    }
    try {
        const file = await sandbox.readFile(filePath);
        if (typeof file !== 'string') {
            console.error(`Failed to read file: ${filePath}`);
            return null;
        }
        const content = file;
        const ast = (0, parser_1.getAstFromContent)(content);
        if (!ast) {
            throw new Error(`Failed to parse file ${filePath}`);
        }
        const classNameAttrs = [];
        let elementsFound = false;
        (0, parser_1.traverse)(ast, {
            JSXOpeningElement: (path) => {
                if (!parser_1.t.isJSXIdentifier(path.node.name) ||
                    !targetElements.includes(path.node.name.name)) {
                    return;
                }
                elementsFound = true;
                let classNameAttr = path.node.attributes.find((attr) => parser_1.t.isJSXAttribute(attr) &&
                    parser_1.t.isJSXIdentifier(attr.name) &&
                    attr.name.name === 'className');
                if (!classNameAttr) {
                    classNameAttr = parser_1.t.jsxAttribute(parser_1.t.jsxIdentifier('className'), parser_1.t.stringLiteral(''));
                    path.node.attributes.push(classNameAttr);
                }
                classNameAttrs.push(classNameAttr);
                if (!allElements) {
                    path.stop();
                }
            },
        });
        return { classNameAttrs, elementsFound, ast };
    }
    catch (error) {
        console.error(`Error traversing className in ${filePath}:`, error);
        return null;
    }
};
exports.traverseClassName = traverseClassName;
const getLayoutContext = async (editorEngine) => {
    const layoutPath = await editorEngine.activeSandbox.getLayoutPath();
    const routerConfig = await editorEngine.activeSandbox.getRouterConfig();
    if (!layoutPath || !routerConfig) {
        console.error('Could not get layout path or router config');
        return;
    }
    const file = await editorEngine.activeSandbox.readFile(layoutPath);
    if (typeof file !== 'string') {
        console.error(`Layout file is not text: ${layoutPath}`);
        return;
    }
    const targetElements = (0, fonts_1.getFontRootElements)(routerConfig.type);
    const layoutContent = file;
    return { layoutPath, targetElements, layoutContent };
};
exports.getLayoutContext = getLayoutContext;
/**
 * Clears the default font from the layout file by removing font className from body
 */
const clearDefaultFontFromRootLayout = async (fontId, editorEngine) => {
    try {
        const context = await (0, exports.getLayoutContext)(editorEngine);
        if (!context)
            return false;
        const { layoutPath } = context;
        const sandbox = editorEngine.activeSandbox;
        const file = await sandbox.readFile(layoutPath);
        if (typeof file !== 'string')
            return false;
        const content = file;
        const ast = (0, parser_1.getAstFromContent)(content);
        if (!ast)
            return false;
        let hasUpdated = false;
        (0, parser_1.traverse)(ast, {
            JSXOpeningElement: (path) => {
                if (!parser_1.t.isJSXIdentifier(path.node.name))
                    return;
                if (path.node.name.name !== 'body')
                    return;
                const classNameAttr = path.node.attributes.find((attr) => parser_1.t.isJSXAttribute(attr) &&
                    parser_1.t.isJSXIdentifier(attr.name) &&
                    attr.name.name === 'className');
                if (!classNameAttr)
                    return;
                const updated = (0, fonts_1.removeFontsFromClassName)(classNameAttr, {
                    fontIds: [fontId],
                });
                if (updated) {
                    hasUpdated = true;
                }
            },
        });
        if (hasUpdated) {
            const { code } = (0, parser_1.generate)(ast);
            await editorEngine.activeSandbox.writeFile(layoutPath, code);
            return true;
        }
        return false;
    }
    catch (error) {
        console.error('Error clearing default font from layout:', error);
        return false;
    }
};
exports.clearDefaultFontFromRootLayout = clearDefaultFontFromRootLayout;
//# sourceMappingURL=layout-manager.js.map