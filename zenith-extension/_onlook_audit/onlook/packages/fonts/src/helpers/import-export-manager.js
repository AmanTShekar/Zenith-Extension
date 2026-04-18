"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFontImportFromFile = removeFontImportFromFile;
exports.addFontImportToFile = addFontImportToFile;
const fonts_1 = require("@onlook/fonts");
const parser_1 = require("@onlook/parser");
/**
 * Removes a font import from a file using AST traversal
 * @param fontImportPath - The import path to remove the font import from (e.g. './fonts')
 * @param fontName - The font name to remove from the import
 * @param ast - The parsed AST of the file
 * @returns The updated file content with the font import removed, or null if no changes made
 */
function removeFontImportFromFile(fontImportPath, fontName, ast) {
    let foundImport = false;
    let importRemoved = false;
    (0, parser_1.traverse)(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === fontImportPath) {
                foundImport = true;
                // Find the specifier to remove
                const specifierIndex = path.node.specifiers.findIndex((spec) => parser_1.t.isImportSpecifier(spec) &&
                    parser_1.t.isIdentifier(spec.imported) &&
                    spec.imported.name === fontName);
                if (specifierIndex !== -1) {
                    importRemoved = true;
                    // Remove the specifier
                    path.node.specifiers.splice(specifierIndex, 1);
                    // If no specifiers left, remove the entire import
                    if (path.node.specifiers.length === 0) {
                        path.remove();
                    }
                }
            }
        },
    });
    if (!foundImport || !importRemoved) {
        return null;
    }
    return (0, parser_1.generate)(ast).code;
}
/**
 * Adds a font import to a file using AST traversal
 * @param fontImportPath - The import path to add the font import to (e.g. './fonts')
 * @param fontName - The font name to add to the import
 * @param ast - The AST file to modify
 * @returns The updated file content with the font import added, or null if no changes needed
 */
function addFontImportToFile(fontImportPath, fontName, ast) {
    let foundExistingImport = false;
    let fontAlreadyExists = false;
    (0, parser_1.traverse)(ast, {
        ImportDeclaration(path) {
            if (path.node.source.value === fontImportPath) {
                foundExistingImport = true;
                // Check if the font name already exists in the import
                const existingSpecifier = path.node.specifiers.find((spec) => parser_1.t.isImportSpecifier(spec) &&
                    parser_1.t.isIdentifier(spec.imported) &&
                    spec.imported.name === fontName);
                if (existingSpecifier) {
                    fontAlreadyExists = true;
                }
                else {
                    // Add the new font to the existing import
                    path.node.specifiers.push(parser_1.t.importSpecifier(parser_1.t.identifier(fontName), parser_1.t.identifier(fontName)));
                }
            }
        },
    });
    if (fontAlreadyExists) {
        return null;
    }
    if (!foundExistingImport) {
        (0, fonts_1.createAndInsertImport)(ast, fontName, fontImportPath);
    }
    return (0, parser_1.generate)(ast).code;
}
//# sourceMappingURL=import-export-manager.js.map