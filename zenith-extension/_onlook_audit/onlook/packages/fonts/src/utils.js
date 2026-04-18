"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRawFont = convertRawFont;
exports.getFontRootElements = getFontRootElements;
exports.createAndInsertImport = createAndInsertImport;
const models_1 = require("@onlook/models");
const parser_1 = require("@onlook/parser");
/**
 * Converts a RawFont to a Font
 */
function convertRawFont(font) {
    return {
        ...font,
        weight: font.weights,
        styles: font.styles || [],
        variable: `--font-${font.id}`,
    };
}
/**
 * Gets target elements based on router type
 */
function getFontRootElements(type) {
    if (type === models_1.RouterType.APP)
        return ['html', 'body'];
    return ['div', 'main', 'section', 'body'];
}
/**
 * Creates a new import declaration and inserts it at the correct position in the AST
 * @param ast - The AST file to modify
 * @param importName - The name to import
 * @param sourcePath - The import source path
 */
function createAndInsertImport(ast, importName, sourcePath) {
    const newImport = parser_1.t.importDeclaration([parser_1.t.importSpecifier(parser_1.t.identifier(importName), parser_1.t.identifier(importName))], parser_1.t.stringLiteral(sourcePath));
    let insertionIndex = 0;
    for (let i = 0; i < ast.program.body.length; i++) {
        if (parser_1.t.isImportDeclaration(ast.program.body[i])) {
            insertionIndex = i + 1;
        }
        else {
            break;
        }
    }
    ast.program.body.splice(insertionIndex, 0, newImport);
}
//# sourceMappingURL=utils.js.map