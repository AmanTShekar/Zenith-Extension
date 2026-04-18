"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverseClassName = traverseClassName;
exports.addFontVariableToElement = addFontVariableToElement;
exports.addFontVariableToLayout = addFontVariableToLayout;
exports.removeFontVariableFromLayout = removeFontVariableFromLayout;
exports.updateFontInLayout = updateFontInLayout;
exports.detectCurrentFont = detectCurrentFont;
exports.getDefaultFont = getDefaultFont;
exports.setDefaultFont = setDefaultFont;
const fs = __importStar(require("fs"));
const t = __importStar(require("@babel/types"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const generator_1 = __importDefault(require("@babel/generator"));
const pathModule = __importStar(require("path"));
const files_1 = require("../../code/files");
const constants_1 = require("@onlook/models/constants");
const helpers_1 = require("../../pages/helpers");
const utils_1 = require("./utils");
/**
 * Traverses JSX elements in a file to find and modify className attributes
 * Used for adding or removing font variables from layout files
 */
async function traverseClassName(filePath, targetElements, callback) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }
        const content = await (0, files_1.readFile)(filePath);
        if (!content) {
            console.error(`Failed to read file: ${filePath}`);
            return;
        }
        const ast = (0, parser_1.parse)(content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });
        (0, traverse_1.default)(ast, {
            JSXOpeningElement(path) {
                if (!t.isJSXIdentifier(path.node.name) ||
                    !targetElements.includes(path.node.name.name)) {
                    return;
                }
                const classNameAttr = path.node.attributes.find((attr) => t.isJSXAttribute(attr) &&
                    t.isJSXIdentifier(attr.name) &&
                    attr.name.name === 'className');
                if (!classNameAttr) {
                    const newClassNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(''));
                    path.node.attributes.push(newClassNameAttr);
                    callback(newClassNameAttr, ast);
                    return;
                }
                callback(classNameAttr, ast);
            },
        });
    }
    catch (error) {
        console.error(`Error traversing className in ${filePath}:`, error);
    }
}
/**
 * Updates a file's imports to include the new font import if needed
 */
async function updateFileWithImport(filePath, content, ast, fontName) {
    const { code } = (0, generator_1.default)(ast);
    const fontPath = '@/' + constants_1.DefaultSettings.FONT_CONFIG.replace(/^\.\//, '').replace(/\.ts$/, '');
    const importRegex = new RegExp(`import\\s*{([^}]*)}\\s*from\\s*['"]${fontPath}['"]`);
    const importMatch = content.match(importRegex);
    let newContent = code;
    if (importMatch) {
        const currentImports = importMatch[1];
        if (!currentImports.includes(fontName)) {
            const newImports = currentImports.trim() + `, ${fontName}`;
            newContent = newContent.replace(importRegex, `import { ${newImports} } from '${fontPath}'`);
        }
    }
    else {
        const fontImport = `import { ${fontName} } from '${fontPath}';`;
        newContent = fontImport + '\n' + newContent;
    }
    fs.writeFileSync(filePath, newContent);
}
/**
 * Adds a font variable to specified target elements in a file
 * Updates the className attribute to include the font variable
 */
async function addFontVariableToElement(filePath, fontName, targetElements) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }
        const content = await (0, files_1.readFile)(filePath);
        if (!content) {
            console.error(`Failed to read file: ${filePath}`);
            return;
        }
        let updatedAst = false;
        let targetElementFound = false;
        await traverseClassName(filePath, targetElements, async (classNameAttr, ast) => {
            targetElementFound = true;
            const fontVarExpr = t.memberExpression(t.identifier(fontName), t.identifier('variable'));
            if (t.isStringLiteral(classNameAttr.value)) {
                if (classNameAttr.value.value === '') {
                    const quasis = [
                        t.templateElement({ raw: '', cooked: '' }, false),
                        t.templateElement({ raw: '', cooked: '' }, true),
                    ];
                    classNameAttr.value = t.jsxExpressionContainer(t.templateLiteral(quasis, [fontVarExpr]));
                }
                else {
                    classNameAttr.value = t.jsxExpressionContainer((0, utils_1.createTemplateLiteralWithFont)(fontVarExpr, t.stringLiteral(classNameAttr.value.value)));
                }
                updatedAst = true;
            }
            else if (t.isJSXExpressionContainer(classNameAttr.value)) {
                const expr = classNameAttr.value.expression;
                if (t.isTemplateLiteral(expr)) {
                    const hasFont = expr.expressions.some((e) => t.isMemberExpression(e) &&
                        t.isIdentifier(e.object) &&
                        e.object.name === fontName &&
                        t.isIdentifier(e.property) &&
                        e.property.name === 'variable');
                    if (!hasFont) {
                        if (expr.expressions.length > 0) {
                            const lastQuasi = expr.quasis[expr.quasis.length - 1];
                            if (lastQuasi) {
                                lastQuasi.value.raw = lastQuasi.value.raw + ' ';
                                lastQuasi.value.cooked = lastQuasi.value.cooked + ' ';
                            }
                        }
                        expr.expressions.push(fontVarExpr);
                        if (expr.quasis.length <= expr.expressions.length) {
                            expr.quasis.push(t.templateElement({ raw: '', cooked: '' }, true));
                        }
                        updatedAst = true;
                    }
                }
                else if (t.isIdentifier(expr) || t.isMemberExpression(expr)) {
                    classNameAttr.value = t.jsxExpressionContainer((0, utils_1.createTemplateLiteralWithFont)(fontVarExpr, expr));
                    updatedAst = true;
                }
            }
            if (updatedAst) {
                await updateFileWithImport(filePath, content, ast, fontName);
            }
        });
        if (!targetElementFound) {
            console.log(`Could not find target elements (${targetElements.join(', ')}) in ${filePath}`);
        }
    }
    catch (error) {
        console.error(`Error adding font variable to ${filePath}:`, error);
    }
}
async function addFontVariableToLayout(projectRoot, fontName) {
    const routerConfig = await (0, helpers_1.detectRouterType)(projectRoot);
    if (routerConfig) {
        if (routerConfig.type === 'app') {
            const layoutPath = pathModule.join(routerConfig.basePath, 'layout.tsx');
            await addFontVariableToElement(layoutPath, fontName, ['html']);
        }
        else {
            const appPath = pathModule.join(routerConfig.basePath, '_app.tsx');
            await addFontVariableToElement(appPath, fontName, ['div', 'main', 'section', 'body']);
        }
    }
}
/**
 * Removes a font variable from specified target elements in a layout file
 * Cleans up the className attribute and removes the font import if no longer needed
 */
async function removeFontVariableFromLayout(filePath, fontId, targetElements) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`File not found: ${filePath}`);
            return;
        }
        const content = await (0, files_1.readFile)(filePath);
        if (!content) {
            console.error(`Failed to read file: ${filePath}`);
            return;
        }
        let updatedAst = false;
        let ast = null;
        await traverseClassName(filePath, targetElements, async (classNameAttr, currentAst) => {
            ast = currentAst;
            if ((0, utils_1.removeFontsFromClassName)(classNameAttr, { fontIds: [fontId] })) {
                updatedAst = true;
            }
        });
        if (updatedAst && ast) {
            // Remove the font import if it exists
            const fontPath = '@/' + constants_1.DefaultSettings.FONT_CONFIG.replace(/^\.\//, '').replace(/\.ts$/, '');
            const importRegex = new RegExp(`import\\s*{([^}]*)}\\s*from\\s*['"]${fontPath}['"]`);
            const importMatch = content.match(importRegex);
            let newContent = (0, generator_1.default)(ast).code;
            if (importMatch) {
                const currentImports = importMatch[1];
                const newImports = currentImports
                    .split(',')
                    .map((imp) => imp.trim())
                    .filter((imp) => {
                    const importName = imp.split(' as ')[0].trim();
                    return importName !== fontId;
                })
                    .join(', ');
                if (newImports) {
                    newContent = newContent.replace(importRegex, `import { ${newImports} } from '${fontPath}'`);
                }
                else {
                    newContent = newContent.replace(new RegExp(`${importRegex.source}\\n?`), '');
                }
            }
            fs.writeFileSync(filePath, newContent);
        }
    }
    catch (error) {
        console.error(`Error removing font variable from ${filePath}:`, error);
    }
}
/**
 * Updates the font in a layout file by modifying className attributes
 * Handles both string literals and template literals in className
 */
async function updateFontInLayout(filePath, font, targetElements) {
    let updatedAst = false;
    const fontClassName = `font-${font.id}`;
    let result = null;
    const content = await (0, files_1.readFile)(filePath);
    if (!content) {
        console.error(`Failed to read file: ${filePath}`);
        return null;
    }
    await traverseClassName(filePath, targetElements, (classNameAttr, ast) => {
        if (t.isStringLiteral(classNameAttr.value)) {
            classNameAttr.value = (0, utils_1.createStringLiteralWithFont)(fontClassName, classNameAttr.value.value);
            updatedAst = true;
        }
        else if (t.isJSXExpressionContainer(classNameAttr.value)) {
            const expr = classNameAttr.value.expression;
            if (t.isTemplateLiteral(expr)) {
                const newQuasis = [
                    t.templateElement({ raw: fontClassName + ' ', cooked: fontClassName + ' ' }, false),
                    ...expr.quasis.slice(1),
                ];
                expr.quasis = newQuasis;
                updatedAst = true;
            }
        }
        if (updatedAst) {
            const { code } = (0, generator_1.default)(ast);
            const codeDiff = {
                original: content,
                generated: code,
                path: filePath,
            };
            result = codeDiff;
        }
    });
    return result;
}
/**
 * Detects the current font being used in a layout file
 * Extracts font information from className attributes
 */
async function detectCurrentFont(filePath, targetElements) {
    let currentFont = null;
    await traverseClassName(filePath, targetElements, (classNameAttr) => {
        if (t.isStringLiteral(classNameAttr.value)) {
            currentFont = (0, utils_1.findFontClass)(classNameAttr.value.value);
        }
        else if (t.isJSXExpressionContainer(classNameAttr.value)) {
            const expr = classNameAttr.value.expression;
            if (t.isTemplateLiteral(expr)) {
                const firstQuasi = expr.quasis[0];
                if (firstQuasi) {
                    currentFont = (0, utils_1.findFontClass)(firstQuasi.value.raw);
                }
            }
        }
    });
    return currentFont;
}
/**
 * Gets the current default font from the project's layout file
 * Handles both App Router and Pages Router configurations
 */
async function getDefaultFont(projectRoot) {
    try {
        const routerConfig = await (0, helpers_1.detectRouterType)(projectRoot);
        if (!routerConfig) {
            console.log('Could not detect Next.js router type');
            return null;
        }
        if (routerConfig.type === 'app') {
            const layoutPath = pathModule.join(routerConfig.basePath, 'layout.tsx');
            return await detectCurrentFont(layoutPath, ['html']);
        }
        else {
            const appPath = pathModule.join(routerConfig.basePath, '_app.tsx');
            return await detectCurrentFont(appPath, ['div', 'main', 'section', 'body']);
        }
    }
    catch (error) {
        console.error('Error getting current font:', error);
        return null;
    }
}
/**
 * Sets the default font for the project by updating the appropriate layout file
 * Handles both App Router and Pages Router configurations
 */
async function setDefaultFont(projectRoot, font) {
    try {
        const routerConfig = await (0, helpers_1.detectRouterType)(projectRoot);
        if (!routerConfig) {
            console.log('Could not detect Next.js router type');
            return;
        }
        if (routerConfig.type === 'app') {
            const layoutPath = pathModule.join(routerConfig.basePath, 'layout.tsx');
            return await updateFontInLayout(layoutPath, font, ['html']);
        }
        else {
            const appPath = pathModule.join(routerConfig.basePath, '_app.tsx');
            return await updateFontInLayout(appPath, font, ['div', 'main', 'section', 'body']);
        }
    }
    catch (error) {
        console.error('Error setting default font:', error);
    }
}
//# sourceMappingURL=layout.js.map