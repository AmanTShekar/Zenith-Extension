"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFontDeclarations = void 0;
exports.buildFontConfiguration = buildFontConfiguration;
exports.migrateFontsFromLayout = migrateFontsFromLayout;
const parser_1 = require("@onlook/parser");
const class_utils_1 = require("./class-utils");
/**
 * Parses source code to extract all font configurations from import statements and variable declarations.
 * Scans for both Google Fonts and local fonts, building a comprehensive list of font metadata
 * including subsets, weights, styles, and CSS variables. Handles Next.js font patterns.
 *
 * @param content - The source code content to parse and extract fonts from
 * @returns Array of Font objects containing extracted font configurations
 */
const parseFontDeclarations = (content) => {
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        throw new Error(`Failed to parse file in parseFontDeclarations`);
    }
    const fontImports = {};
    const fonts = [];
    (0, parser_1.traverse)(ast, {
        // Extract font imports from 'next/font/google' and 'next/font/local'
        ImportDeclaration(path) {
            const source = path.node.source.value;
            if (source === 'next/font/google') {
                path.node.specifiers.forEach((specifier) => {
                    if (parser_1.t.isImportSpecifier(specifier) && parser_1.t.isIdentifier(specifier.imported)) {
                        fontImports[specifier.imported.name] = specifier.imported.name;
                    }
                });
            }
            else if (source === 'next/font/local') {
                path.node.specifiers.forEach((specifier) => {
                    if (parser_1.t.isImportDefaultSpecifier(specifier) && parser_1.t.isIdentifier(specifier.local)) {
                        fontImports[specifier.local.name] = 'localFont';
                    }
                });
            }
        },
        VariableDeclaration(path) {
            const parentNode = path.parent;
            if (!parser_1.t.isExportNamedDeclaration(parentNode)) {
                return;
            }
            path.node.declarations.forEach((declarator) => {
                if (!parser_1.t.isIdentifier(declarator.id) || !declarator.init) {
                    return;
                }
                const fontId = declarator.id.name;
                if (parser_1.t.isCallExpression(declarator.init)) {
                    const callee = declarator.init.callee;
                    let fontType = '';
                    if (parser_1.t.isIdentifier(callee) && fontImports[callee.name]) {
                        fontType = fontImports[callee.name] ?? '';
                    }
                    const configArg = declarator.init.arguments[0];
                    if (parser_1.t.isObjectExpression(configArg)) {
                        const fontConfig = buildFontConfiguration(fontId, fontType, configArg);
                        fonts.push(fontConfig);
                    }
                }
            });
        },
    });
    return fonts;
};
exports.parseFontDeclarations = parseFontDeclarations;
/**
 * Converts an AST object expression into a structured Font configuration object.
 * Extracts font properties like subsets, weights, styles, and CSS variables,
 * handling both Google Fonts and local font configurations with different property structures.
 *
 * @param fontId - The font identifier/variable name
 * @param fontType - The type of font ('localFont' for local fonts, font name for Google Fonts)
 * @param configArg - The AST object expression containing font configuration properties
 * @returns Font object with extracted configuration metadata
 */
function buildFontConfiguration(fontId, fontType, configArg) {
    const fontConfig = {
        id: fontId,
        family: fontType === 'localFont' ? fontId : fontType.replace(/_/g, ' '),
        type: fontType === 'localFont' ? 'local' : 'google',
        subsets: [],
        weight: [],
        styles: [],
        variable: '',
    };
    configArg.properties.forEach((prop) => {
        if (!parser_1.t.isObjectProperty(prop) || !parser_1.t.isIdentifier(prop.key)) {
            return;
        }
        const propName = prop.key.name;
        if (propName === 'variable' && parser_1.t.isStringLiteral(prop.value)) {
            fontConfig.variable = prop.value.value;
        }
        if (propName === 'subsets' && parser_1.t.isArrayExpression(prop.value)) {
            fontConfig.subsets = prop.value.elements
                .filter((element) => parser_1.t.isStringLiteral(element))
                .map((element) => element.value);
        }
        if ((propName === 'weight' || propName === 'weights') && parser_1.t.isArrayExpression(prop.value)) {
            fontConfig.weight = prop.value.elements
                .map((element) => {
                if (parser_1.t.isStringLiteral(element)) {
                    return element.value;
                }
                else if (parser_1.t.isNumericLiteral(element)) {
                    return element.value.toString();
                }
                return null;
            })
                .filter((weight) => weight !== null && !isNaN(Number(weight)));
        }
        if ((propName === 'style' || propName === 'styles') && parser_1.t.isArrayExpression(prop.value)) {
            fontConfig.styles = prop.value.elements
                .filter((element) => parser_1.t.isStringLiteral(element))
                .map((element) => element.value);
        }
        // Handle local font src property
        if (propName === 'src' && parser_1.t.isArrayExpression(prop.value) && fontType === 'localFont') {
            const srcConfigs = prop.value.elements
                .filter((element) => parser_1.t.isObjectExpression(element))
                .map((element) => {
                const srcConfig = {};
                element.properties.forEach((srcProp) => {
                    if (parser_1.t.isObjectProperty(srcProp) && parser_1.t.isIdentifier(srcProp.key)) {
                        const srcPropName = srcProp.key.name;
                        if (parser_1.t.isStringLiteral(srcProp.value)) {
                            srcConfig[srcPropName] = srcProp.value.value;
                        }
                    }
                });
                return srcConfig;
            });
            fontConfig.weight = [...new Set(srcConfigs.map((config) => config.weight))];
            fontConfig.styles = [...new Set(srcConfigs.map((config) => config.style))];
        }
    });
    return fontConfig;
}
/**
 * Migrates font declarations from a layout file to a dedicated font configuration file.
 * Extracts all font imports and variable declarations, removes them from the layout,
 * and cleans up className references. Returns both the cleaned layout content and
 * extracted font configurations for use in a centralized font config file.
 *
 * @param content - The layout file content containing font declarations to migrate
 * @returns Object containing cleaned layout content and array of extracted font configurations
 */
function migrateFontsFromLayout(content) {
    try {
        const ast = (0, parser_1.getAstFromContent)(content);
        if (!ast) {
            throw new Error(`Failed to parse file in migrateFontsFromLayout`);
        }
        const fontImports = {};
        const fontVariables = [];
        const fonts = [];
        (0, parser_1.traverse)(ast, {
            ImportDeclaration(path) {
                if (!path.node?.source?.value) {
                    return;
                }
                const source = path.node.source.value;
                if (source === 'next/font/google' || source === 'next/font/local') {
                    if (!path.node.specifiers) {
                        return;
                    }
                    path.node.specifiers.forEach((specifier) => {
                        if (source === 'next/font/google' &&
                            parser_1.t.isImportSpecifier(specifier) &&
                            parser_1.t.isIdentifier(specifier.imported)) {
                            fontImports[specifier.imported.name] = specifier.imported.name;
                        }
                        else if (source === 'next/font/local' &&
                            parser_1.t.isImportDefaultSpecifier(specifier) &&
                            parser_1.t.isIdentifier(specifier.local)) {
                            fontImports[specifier.local.name] = 'localFont';
                        }
                    });
                    path.remove(); // Remove the entire import declaration
                }
            },
            VariableDeclaration(path) {
                if (!path.node.declarations) {
                    return;
                }
                path.node.declarations.forEach((declaration) => {
                    if (!parser_1.t.isIdentifier(declaration.id) || !declaration.init) {
                        return;
                    }
                    const fontId = declaration.id.name;
                    if (parser_1.t.isCallExpression(declaration.init)) {
                        const callee = declaration.init.callee;
                        let fontType = '';
                        if (parser_1.t.isIdentifier(callee) && fontImports[callee.name]) {
                            fontType = fontImports[callee.name] ?? '';
                        }
                        const configArg = declaration.init.arguments[0];
                        fontVariables.push(fontId);
                        if (parser_1.t.isObjectExpression(configArg)) {
                            const fontConfig = buildFontConfiguration(fontId, fontType, configArg);
                            if (!fontConfig.variable) {
                                fontConfig.variable = `--font-${fontId}`;
                            }
                            fonts.push(fontConfig);
                        }
                        path.remove();
                    }
                });
            },
            JSXOpeningElement(path) {
                if (!path.node || !parser_1.t.isJSXIdentifier(path.node.name) || !path.node.attributes) {
                    return;
                }
                if (!fonts.length) {
                    return;
                }
                path.node.attributes.forEach((attr) => {
                    if (parser_1.t.isJSXAttribute(attr) &&
                        parser_1.t.isJSXIdentifier(attr.name) &&
                        attr.name.name === 'className') {
                        try {
                            (0, class_utils_1.removeFontsFromClassName)(attr, { fontIds: fontVariables });
                        }
                        catch (classNameError) {
                            console.error('Error processing className:', classNameError);
                        }
                    }
                });
            },
        });
        return { layoutContent: (0, parser_1.generate)(ast, {}, content).code, fonts };
    }
    catch (error) {
        console.error('Error extracting font imports:', error);
        return { layoutContent: content, fonts: [] };
    }
}
//# sourceMappingURL=font-extractors.js.map