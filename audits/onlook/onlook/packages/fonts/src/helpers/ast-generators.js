"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFontFamilyProperty = createFontFamilyProperty;
exports.generateFontVariableExport = generateFontVariableExport;
exports.createLocalFontConfig = createLocalFontConfig;
exports.createFontSrcObjects = createFontSrcObjects;
const lodash_1 = require("lodash");
const parser_1 = require("@onlook/parser");
/**
 * Creates an AST object expression containing font configuration properties for Google Fonts.
 * Generates the configuration object with subsets, weights, styles, CSS variable name, and display strategy.
 *
 * @param font - The font object containing metadata like subsets, weights, styles, and variable name
 * @returns AST object expression with font configuration properties (subsets, weight, style, variable, display)
 *
 * @example
 * // Input font: { subsets: ['latin'], weight: ['400', '700'], styles: ['normal'], variable: '--font-inter' }
 * // Generated output:
 * {
 *   subsets: ['latin'],
 *   weight: ['400', '700'],
 *   style: ['normal'],
 *   variable: '--font-inter',
 *   display: 'swap'
 * }
 */
function createFontConfigAst(font) {
    return parser_1.t.objectExpression([
        parser_1.t.objectProperty(parser_1.t.identifier('subsets'), parser_1.t.arrayExpression(font.subsets.map((s) => parser_1.t.stringLiteral(s)))),
        parser_1.t.objectProperty(parser_1.t.identifier('weight'), parser_1.t.arrayExpression((font.weight ?? []).map((w) => parser_1.t.stringLiteral(w)))),
        parser_1.t.objectProperty(parser_1.t.identifier('style'), parser_1.t.arrayExpression((font.styles ?? []).map((s) => parser_1.t.stringLiteral(s)))),
        parser_1.t.objectProperty(parser_1.t.identifier('variable'), parser_1.t.stringLiteral(font.variable)),
        parser_1.t.objectProperty(parser_1.t.identifier('display'), parser_1.t.stringLiteral('swap')),
    ]);
}
/**
 * Creates an AST object property for Tailwind CSS fontFamily configuration.
 * Generates a fontFamily property with the font ID as key and an array containing
 * the CSS variable reference and a fallback font.
 *
 * @param font - The font object containing the ID and variable name
 * @returns AST object property for fontFamily configuration with CSS variable and fallback
 *
 * @example
 * // Input font: { id: 'inter', variable: '--font-inter' }
 * // Generated output:
 * fontFamily: {
 *   inter: ['var(--font-inter)', 'sans-serif']
 * }
 */
function createFontFamilyProperty(font) {
    return parser_1.t.objectProperty(parser_1.t.identifier('fontFamily'), parser_1.t.objectExpression([
        parser_1.t.objectProperty(parser_1.t.identifier(font.id), parser_1.t.arrayExpression([
            parser_1.t.stringLiteral(`var(${font.variable})`),
            parser_1.t.stringLiteral('sans-serif'),
        ])),
    ]));
}
/**
 * Creates a complete export declaration for a Google Font variable.
 * Generates a camelCase variable name, creates the font configuration object,
 * and wraps it in a const declaration with export statement.
 *
 * @param font - The font object containing family name, ID, and configuration
 * @returns AST export declaration with const variable assignment for the font
 *
 * @example
 * // Input font: { id: 'inter-tight', family: 'Inter Tight', subsets: ['latin'], weight: ['400'], variable: '--font-inter-tight' }
 * // Generated output:
 * export const interTight = Inter_Tight({
 *   subsets: ['latin'],
 *   weight: ['400'],
 *   style: [],
 *   variable: '--font-inter-tight',
 *   display: 'swap'
 * });
 */
function generateFontVariableExport(font) {
    const fontName = (0, lodash_1.camelCase)(font.id);
    const importName = font.family.replace(/\s+/g, '_');
    // Create the AST nodes for the new font
    const fontConfigObject = createFontConfigAst(font);
    const fontDeclaration = parser_1.t.variableDeclaration('const', [
        parser_1.t.variableDeclarator(parser_1.t.identifier(fontName), parser_1.t.callExpression(parser_1.t.identifier(importName), [fontConfigObject])),
    ]);
    const exportDeclaration = parser_1.t.exportNamedDeclaration(fontDeclaration, []);
    return exportDeclaration;
}
/**
 * Creates and adds a local font configuration to an existing AST.
 * Generates a complete local font setup with source files, CSS variable, display strategy,
 * fallback fonts, and preload option. Modifies the AST by appending the export declaration.
 *
 * @param ast - The existing AST file to modify
 * @param fontName - The name for the font variable (will be converted to kebab-case for CSS variable)
 * @param fontsSrc - Array of font source objects containing file paths and formats
 * @returns Modified AST file with the new local font export declaration added
 *
 * @example
 * // Input: fontName = 'customFont', fontsSrc = [{ src: './fonts/custom.woff2', format: 'woff2' }]
 * // Generated output added to AST:
 * export const customFont = localFont({
 *   src: [{ src: './fonts/custom.woff2', format: 'woff2' }],
 *   variable: '--font-custom-font',
 *   display: 'swap',
 *   fallback: ['system-ui', 'sans-serif'],
 *   preload: true
 * });
 */
function createLocalFontConfig(ast, fontName, fontsSrc) {
    // Create a new font configuration
    const fontConfigObject = parser_1.t.objectExpression([
        parser_1.t.objectProperty(parser_1.t.identifier('src'), parser_1.t.arrayExpression(fontsSrc)),
        parser_1.t.objectProperty(parser_1.t.identifier('variable'), parser_1.t.stringLiteral(`--font-${fontName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`)),
        parser_1.t.objectProperty(parser_1.t.identifier('display'), parser_1.t.stringLiteral('swap')),
        parser_1.t.objectProperty(parser_1.t.identifier('fallback'), parser_1.t.arrayExpression([parser_1.t.stringLiteral('system-ui'), parser_1.t.stringLiteral('sans-serif')])),
        parser_1.t.objectProperty(parser_1.t.identifier('preload'), parser_1.t.booleanLiteral(true)),
    ]);
    const fontDeclaration = parser_1.t.variableDeclaration('const', [
        parser_1.t.variableDeclarator(parser_1.t.identifier(fontName), parser_1.t.callExpression(parser_1.t.identifier('localFont'), [fontConfigObject])),
    ]);
    const exportDeclaration = parser_1.t.exportNamedDeclaration(fontDeclaration, []);
    ast.program.body.push(exportDeclaration);
    return ast;
}
/**
 * Creates an array of object expressions for font source configuration.
 * Generates an object expression for each source with path, weight, and style properties.
 *
 * @param sources - Array of source objects containing path, weight, and style properties
 * @returns Array of object expressions with font source configuration
 *
 * @example
 * // Input: [{ path: './fonts/custom.woff2', weight: '400', style: 'normal' }]
 * // Generated output:
 * [{
 *   path: './fonts/custom.woff2',
 *   weight: '400',
 *   style: 'normal'
 * }]
 *
 */
function createFontSrcObjects(sources) {
    return sources.map((source) => {
        const properties = [];
        properties.push(parser_1.t.objectProperty(parser_1.t.identifier('path'), parser_1.t.stringLiteral(source.path)));
        if (source.weight) {
            properties.push(parser_1.t.objectProperty(parser_1.t.identifier('weight'), parser_1.t.stringLiteral(source.weight)));
        }
        if (source.style) {
            properties.push(parser_1.t.objectProperty(parser_1.t.identifier('style'), parser_1.t.stringLiteral(source.style)));
        }
        return parser_1.t.objectExpression(properties);
    });
}
//# sourceMappingURL=ast-generators.js.map