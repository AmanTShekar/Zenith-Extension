"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTailwindThemeProperty = isTailwindThemeProperty;
exports.hasPropertyName = hasPropertyName;
exports.isValidLocalFontDeclaration = isValidLocalFontDeclaration;
exports.hasLocalFontImport = hasLocalFontImport;
exports.findFontExportDeclaration = findFontExportDeclaration;
exports.validateGoogleFontSetup = validateGoogleFontSetup;
const parser_1 = require("@onlook/parser");
/**
 * Validates if an AST object property represents a Tailwind CSS theme configuration.
 * Checks that the property key is 'theme' and it's within an object expression context,
 * which is typical for Tailwind config structure.
 *
 * @param path - The AST node path for the object property to validate
 * @returns true if the property is a theme property, false otherwise
 *
 */
function isTailwindThemeProperty(path) {
    return (parser_1.t.isIdentifier(path.node.key) &&
        path.node.key.name === 'theme' &&
        path.parent.type === 'ObjectExpression');
}
/**
 * Validates if an object property, method, or spread element has a specific key name.
 * Useful for finding specific properties like 'fontFamily', 'src', 'variable' in font configurations.
 *
 * @param prop - The AST property node to check (ObjectProperty, ObjectMethod, or SpreadElement)
 * @param key - The expected property name to match against
 * @returns true if the property has the specified key name, false otherwise
 *
 */
function hasPropertyName(prop, key) {
    return parser_1.t.isObjectProperty(prop) && parser_1.t.isIdentifier(prop.key) && prop.key.name === key;
}
/**
 * Validates if a variable declarator represents a properly structured local font declaration.
 * Checks for correct variable name, localFont function call, and object configuration structure.
 * Ensures the declaration follows Next.js localFont patterns.
 *
 * @param declarator - The variable declarator AST node to validate
 * @param fontName - The expected font variable name to match
 * @returns true if the declaration is a valid local font setup, false otherwise

 */
function isValidLocalFontDeclaration(declarator, fontName) {
    return (parser_1.t.isIdentifier(declarator.id) &&
        declarator.id.name === fontName &&
        !!declarator.init &&
        parser_1.t.isCallExpression(declarator.init) &&
        parser_1.t.isIdentifier(declarator.init.callee) &&
        declarator.init.callee.name === 'localFont' &&
        declarator.init.arguments.length > 0 &&
        parser_1.t.isObjectExpression(declarator.init.arguments[0]));
}
/**
 * Checks if a Next.js local font import statement exists in the AST.
 * Scans through import declarations to find 'next/font/local' imports,
 * which are required for using localFont function.
 *
 * @param ast - The AST file to search for local font imports
 * @returns true if localFont import exists, false otherwise
 *
 */
function hasLocalFontImport(ast) {
    return ast.program.body.some((node) => {
        if (parser_1.t.isImportDeclaration(node)) {
            return node.source.value === 'next/font/local';
        }
        return false;
    });
}
/**
 * Searches for an existing font export declaration by name and returns both existence status and the node.
 * Traverses export declarations to find matching font variable names,
 * useful for preventing duplicates and enabling font updates.
 *
 * @param ast - The AST file to search through
 * @param fontName - The font variable name to search for
 * @returns Object containing existence boolean and the found export node (if any)

 */
function findFontExportDeclaration(ast, fontName) {
    let fontNameExists = false;
    let existingFontNode = null;
    (0, parser_1.traverse)(ast, {
        ExportNamedDeclaration(path) {
            if (path.node.declaration &&
                parser_1.t.isVariableDeclaration(path.node.declaration) &&
                path.node.declaration.declarations.some((declaration) => parser_1.t.isIdentifier(declaration.id) && declaration.id.name === fontName)) {
                fontNameExists = true;
                existingFontNode = path.node;
            }
        },
    });
    return { fontNameExists, existingFontNode };
}
/**
 * Comprehensively validates Google Font import and export status in source code.
 * Parses content and checks for Google Font import declaration, specific font import,
 * and font export declaration. Essential for font management operations.
 *
 * @param content - The source code content to analyze
 * @param importName - The Google Font import name to search for (e.g., 'Inter', 'Open_Sans')
 * @param fontName - The font variable name to search for in exports (e.g., 'inter', 'openSans')
 * @returns Object with three boolean flags indicating import and export status
 *
 */
function validateGoogleFontSetup(content, importName, fontName) {
    if (!content) {
        return { hasGoogleFontImport: false, hasImportName: false, hasFontExport: false };
    }
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        throw new Error(`Failed to parse file in validateGoogleFontSetup`);
    }
    let hasGoogleFontImport = false;
    let hasImportName = false;
    let hasFontExport = false;
    (0, parser_1.traverse)(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === 'next/font/google') {
                hasGoogleFontImport = true;
                path.node.specifiers.forEach((specifier) => {
                    if (parser_1.t.isImportSpecifier(specifier) && parser_1.t.isIdentifier(specifier.imported)) {
                        if (specifier.imported.name === importName) {
                            hasImportName = true;
                        }
                    }
                });
            }
        },
        ExportNamedDeclaration(path) {
            if (parser_1.t.isVariableDeclaration(path.node.declaration)) {
                path.node.declaration.declarations.forEach((declaration) => {
                    if (parser_1.t.isIdentifier(declaration.id) && declaration.id.name === fontName) {
                        hasFontExport = true;
                    }
                });
            }
        },
    });
    return { hasGoogleFontImport, hasImportName, hasFontExport };
}
//# sourceMappingURL=validators.js.map