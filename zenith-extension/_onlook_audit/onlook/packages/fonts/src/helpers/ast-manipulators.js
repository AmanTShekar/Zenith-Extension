"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFontDeclaration = removeFontDeclaration;
exports.removeFontFromTailwindTheme = removeFontFromTailwindTheme;
exports.addFontToTailwindTheme = addFontToTailwindTheme;
exports.mergeLocalFontSources = mergeLocalFontSources;
exports.addGoogleFontSpecifier = addGoogleFontSpecifier;
const fonts_1 = require("@onlook/fonts");
const parser_1 = require("@onlook/parser");
const ast_generators_1 = require("./ast-generators");
const validators_1 = require("./validators");
/**
 * Finds the fontFamily property within the Tailwind theme structure.
 * Navigates through theme -> extend -> fontFamily path and returns the relevant objects.
 *
 * @param themeValue - The theme object expression
 * @returns Object containing extend property, fontFamily property, and fontFamily value, or null if not found
 */
function findFontFamilyInTheme(themeValue) {
    const extendProperty = themeValue.properties.find((prop) => (0, validators_1.hasPropertyName)(prop, 'extend'));
    if (!extendProperty || !parser_1.t.isObjectProperty(extendProperty)) {
        return {
            extendValue: null,
            fontFamilyProperty: null,
            fontFamilyValue: null,
        };
    }
    const extendValue = extendProperty.value;
    if (!parser_1.t.isObjectExpression(extendValue)) {
        return {
            extendValue: null,
            fontFamilyProperty: null,
            fontFamilyValue: null,
        };
    }
    // Look for fontFamily within extend
    const fontFamilyProperty = extendValue.properties.find((prop) => (0, validators_1.hasPropertyName)(prop, 'fontFamily'));
    if (!fontFamilyProperty || !parser_1.t.isObjectProperty(fontFamilyProperty)) {
        return {
            extendValue,
            fontFamilyProperty: null,
            fontFamilyValue: null,
        };
    }
    const fontFamilyValue = fontFamilyProperty.value;
    if (!parser_1.t.isObjectExpression(fontFamilyValue)) {
        return {
            extendValue,
            fontFamilyProperty,
            fontFamilyValue: null,
        };
    }
    return {
        extendValue,
        fontFamilyProperty,
        fontFamilyValue,
    };
}
/**
 * Checks if a declaration is a localFont declaration that should be preserved
 */
function isPreservedLocalFontDeclaration(declaration, fontIdToRemove) {
    return (declaration &&
        parser_1.t.isIdentifier(declaration.id) &&
        declaration.id.name !== fontIdToRemove &&
        parser_1.t.isCallExpression(declaration.init) &&
        parser_1.t.isIdentifier(declaration.init.callee) &&
        declaration.init.callee.name === 'localFont');
}
/**
 * Checks if a declaration is the target font to be removed
 */
function isTargetFontDeclaration(declaration, fontIdToRemove) {
    return declaration && parser_1.t.isIdentifier(declaration.id) && declaration.id.name === fontIdToRemove;
}
/**
 * Checks if a declaration is a localFont call with proper structure
 */
function isLocalFontCall(declaration) {
    return (parser_1.t.isCallExpression(declaration.init) &&
        parser_1.t.isIdentifier(declaration.init.callee) &&
        declaration.init.callee.name === 'localFont' &&
        declaration.init.arguments.length > 0 &&
        parser_1.t.isObjectExpression(declaration.init.arguments[0]));
}
/**
 * Extracts font file paths from a local font configuration
 */
function extractFontFilePaths(declaration) {
    const fontFiles = [];
    if (!isLocalFontCall(declaration) || !declaration.init) {
        return fontFiles;
    }
    const callExpression = declaration.init;
    const fontConfig = callExpression.arguments[0];
    const srcProp = fontConfig.properties.find((prop) => (0, validators_1.hasPropertyName)(prop, 'src'));
    if (srcProp && parser_1.t.isObjectProperty(srcProp) && parser_1.t.isArrayExpression(srcProp.value)) {
        srcProp.value.elements.forEach((element) => {
            if (parser_1.t.isObjectExpression(element)) {
                const pathProp = element.properties.find((prop) => (0, validators_1.hasPropertyName)(prop, 'path'));
                if (pathProp && parser_1.t.isObjectProperty(pathProp) && parser_1.t.isStringLiteral(pathProp.value)) {
                    let fontFilePath = pathProp.value.value;
                    if (fontFilePath.startsWith('./')) {
                        fontFilePath = fontFilePath.substring(2); // Remove './' prefix
                    }
                    fontFiles.push(fontFilePath);
                }
            }
        });
    }
    return fontFiles;
}
/**
 * Removes a font from the configuration AST by eliminating its import, export declaration, and associated files.
 * Handles both Google Fonts and local fonts, cleaning up unused imports and tracking files for deletion.
 * For local fonts, extracts file paths from the src configuration for cleanup.
 *
 * @param font - The font object containing ID and family name to remove
 * @param content - The source code content to parse and modify
 * @returns Object containing removal status, files to delete, and modified AST
 
 */
function removeFontDeclaration(font, content) {
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        throw new Error(`Failed to parse file in removeFontDeclaration`);
    }
    const fontIdToRemove = font.id;
    const importToRemove = font.family.replace(/\s+/g, '_');
    let removedFont = false;
    const fontFilesToDelete = [];
    // Track if any localFont declarations remain after removal
    let hasRemainingLocalFonts = false;
    (0, parser_1.traverse)(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === 'next/font/google') {
                const importSpecifiers = path.node.specifiers.filter((specifier) => {
                    if (parser_1.t.isImportSpecifier(specifier) && parser_1.t.isIdentifier(specifier.imported)) {
                        return specifier.imported.name !== importToRemove;
                    }
                    return true;
                });
                if (importSpecifiers.length === 0) {
                    path.remove();
                }
                else if (importSpecifiers.length !== path.node.specifiers.length) {
                    path.node.specifiers = importSpecifiers;
                }
            }
        },
        ExportNamedDeclaration(path) {
            if (!parser_1.t.isVariableDeclaration(path.node.declaration)) {
                return;
            }
            const declarations = path.node.declaration.declarations;
            for (let i = 0; i < declarations.length; i++) {
                const declaration = declarations[i];
                if (!declaration)
                    continue;
                if (isPreservedLocalFontDeclaration(declaration, fontIdToRemove)) {
                    hasRemainingLocalFonts = true;
                    continue;
                }
                if (isTargetFontDeclaration(declaration, fontIdToRemove)) {
                    if (isLocalFontCall(declaration)) {
                        const extractedPaths = extractFontFilePaths(declaration);
                        fontFilesToDelete.push(...extractedPaths);
                    }
                    if (declarations.length === 1) {
                        path.remove();
                    }
                    else {
                        declarations.splice(i, 1);
                    }
                    removedFont = true;
                    break;
                }
            }
        },
    });
    if (!hasRemainingLocalFonts) {
        (0, parser_1.traverse)(ast, {
            ImportDeclaration(path) {
                if (path.node.source.value === 'next/font/local') {
                    path.remove();
                }
            },
        });
    }
    return { removedFont, fontFilesToDelete, ast };
}
/**
 * Removes a specific font from the Tailwind CSS theme configuration in the AST.
 * Finds the theme.fontFamily object and removes the specified font ID property,
 * preserving other font family configurations.
 *
 * @param fontId - The font identifier to remove from the theme configuration
 * @param content - The Tailwind config file content to parse and modify
 * @returns Modified source code string with the font removed from theme.fontFamily
 
 */
function removeFontFromTailwindTheme(fontId, content) {
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        throw new Error(`Failed to parse file in removeFontFromTailwindTheme`);
    }
    (0, parser_1.traverse)(ast, {
        ObjectProperty(path) {
            if (!(0, validators_1.isTailwindThemeProperty)(path)) {
                return;
            }
            const value = path.node.value;
            if (!parser_1.t.isObjectExpression(value)) {
                return;
            }
            const { extendValue, fontFamilyProperty, fontFamilyValue } = findFontFamilyInTheme(value);
            if (fontFamilyProperty && fontFamilyValue) {
                // Filter out the specified font
                const fontFamilyProps = fontFamilyValue.properties.filter((prop) => {
                    if (parser_1.t.isObjectProperty(prop) && parser_1.t.isIdentifier(prop.key)) {
                        return prop.key.name !== fontId;
                    }
                    return true;
                });
                // If font was found and removed
                if (fontFamilyProps.length !== fontFamilyValue.properties.length) {
                    if (fontFamilyProps.length === 0) {
                        // Remove the entire fontFamily property if no fonts left
                        if (extendValue) {
                            extendValue.properties = extendValue.properties.filter((prop) => !(0, validators_1.hasPropertyName)(prop, 'fontFamily'));
                        }
                    }
                    else {
                        // Update with remaining fonts
                        fontFamilyValue.properties = fontFamilyProps;
                    }
                }
            }
        },
    });
    return (0, parser_1.generate)(ast, {}, content).code;
}
/**
 * Adds a font to the Tailwind CSS theme configuration by inserting it into the fontFamily object.
 * Locates the theme.fontFamily property and appends the new font configuration,
 * creating the proper CSS variable reference and fallback structure.
 *
 * @param font - The font object containing ID, variable name, and other metadata
 * @param content - The Tailwind config file content to parse and modify
 * @returns Modified source code string with the font added to theme.fontFamily
 
 */
function addFontToTailwindTheme(font, content) {
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        throw new Error(`Failed to parse file in addFontToTailwindTheme`);
    }
    let themeFound = false;
    const newFontFamilyProperty = (0, ast_generators_1.createFontFamilyProperty)(font);
    (0, parser_1.traverse)(ast, {
        ObjectProperty(path) {
            if (!(0, validators_1.isTailwindThemeProperty)(path)) {
                return;
            }
            themeFound = true;
            const value = path.node.value;
            if (!parser_1.t.isObjectExpression(value)) {
                return;
            }
            const { extendValue, fontFamilyProperty, fontFamilyValue } = findFontFamilyInTheme(value);
            if (fontFamilyProperty && fontFamilyValue) {
                // Check if the font already exists
                const fontExists = fontFamilyValue.properties.some((prop) => (0, validators_1.hasPropertyName)(prop, font.id));
                if (!fontExists) {
                    // Add the new font to existing fontFamily
                    fontFamilyValue.properties.push(parser_1.t.objectProperty(parser_1.t.identifier(font.id), parser_1.t.arrayExpression([
                        parser_1.t.stringLiteral(`var(${font.variable})`),
                        parser_1.t.stringLiteral('sans-serif'),
                    ])));
                }
            }
            else if (extendValue) {
                // fontFamily doesn't exist in extend, add it
                extendValue.properties.push(newFontFamilyProperty);
            }
            else {
                // extend doesn't exist, create it with fontFamily
                value.properties.push(parser_1.t.objectProperty(parser_1.t.identifier('extend'), parser_1.t.objectExpression([newFontFamilyProperty])));
            }
        },
    });
    // If theme doesn't exist, create it with extend and fontFamily
    if (!themeFound) {
        (0, parser_1.traverse)(ast, {
            ObjectExpression(path) {
                if (path.parent.type === 'VariableDeclarator' ||
                    path.parent.type === 'ReturnStatement') {
                    path.node.properties.push(parser_1.t.objectProperty(parser_1.t.identifier('theme'), parser_1.t.objectExpression([
                        parser_1.t.objectProperty(parser_1.t.identifier('extend'), parser_1.t.objectExpression([newFontFamilyProperty])),
                    ])));
                }
            },
        });
    }
    return (0, parser_1.generate)(ast, {}, content).code;
}
/**
 * Merges additional font source files into an existing local font configuration.
 * Finds the specified font declaration and appends new source objects to its src array,
 * allowing multiple font files (different weights, styles) to be combined under one font.
 *
 * @param ast - The AST file containing font declarations to modify
 * @param fontNode - The specific export declaration node to target for merging
 * @param fontName - The name of the font variable to merge sources into
 * @param fontsSrc - Array of font source objects to append to the existing src array
 
 */
function mergeLocalFontSources(ast, fontNode, fontName, fontsSrc) {
    (0, parser_1.traverse)(ast, {
        ExportNamedDeclaration(path) {
            if (path.node === fontNode && path.node.declaration) {
                const declaration = path.node.declaration;
                if (!declaration ||
                    !parser_1.t.isVariableDeclaration(declaration) ||
                    declaration.declarations.length === 0) {
                    return;
                }
                const declarator = declaration.declarations[0];
                if (!declarator || !(0, validators_1.isValidLocalFontDeclaration)(declarator, fontName)) {
                    return;
                }
                const configObject = parser_1.t.isCallExpression(declarator.init)
                    ? declarator.init.arguments[0]
                    : null;
                if (!configObject || !parser_1.t.isObjectExpression(configObject)) {
                    return;
                }
                const srcProp = configObject.properties.find((prop) => (0, validators_1.hasPropertyName)(prop, 'src'));
                if (srcProp && parser_1.t.isObjectProperty(srcProp) && parser_1.t.isArrayExpression(srcProp.value)) {
                    srcProp.value.elements.push(...fontsSrc);
                }
            }
        },
    });
}
/**
 * Adds a new Google Font import specifier to the 'next/font/google' import declaration.
 * If an existing import exists, appends the new font name to the import list.
 * If no import exists, creates a new import statement for the Google font.
 *
 * @param ast - The AST file containing import declarations to modify
 * @param importName - The Google Font name to add to the import specifiers (with underscores for spaces)
 
 */
function addGoogleFontSpecifier(ast, importName) {
    let foundExistingImport = false;
    (0, parser_1.traverse)(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === 'next/font/google') {
                foundExistingImport = true;
                const newSpecifiers = [...path.node.specifiers];
                newSpecifiers.push(parser_1.t.importSpecifier(parser_1.t.identifier(importName), parser_1.t.identifier(importName)));
                path.node.specifiers = newSpecifiers;
            }
        },
    });
    // If no existing Google font import was found, create a new one
    if (!foundExistingImport) {
        (0, fonts_1.createAndInsertImport)(ast, importName, 'next/font/google');
    }
}
//# sourceMappingURL=ast-manipulators.js.map