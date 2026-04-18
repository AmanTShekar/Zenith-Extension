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
exports.scanFonts = scanFonts;
exports.scanExistingFonts = scanExistingFonts;
const t = __importStar(require("@babel/types"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const files_1 = require("../../code/files");
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("@onlook/models/constants");
const pathModule = __importStar(require("path"));
const pages_1 = require("../../pages");
const generator_1 = __importDefault(require("@babel/generator"));
const utils_1 = require("./utils");
const font_1 = require("./font");
function extractFontConfig(fontId, fontType, configArg) {
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
        if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) {
            return;
        }
        const propName = prop.key.name;
        if (propName === 'variable' && t.isStringLiteral(prop.value)) {
            fontConfig.variable = prop.value.value;
        }
        if (propName === 'subsets' && t.isArrayExpression(prop.value)) {
            fontConfig.subsets = prop.value.elements
                .filter((element) => t.isStringLiteral(element))
                .map((element) => element.value);
        }
        if ((propName === 'weight' || propName === 'weights') && t.isArrayExpression(prop.value)) {
            fontConfig.weight = prop.value.elements
                .map((element) => {
                if (t.isStringLiteral(element)) {
                    return element.value;
                }
                else if (t.isNumericLiteral(element)) {
                    return element.value.toString();
                }
                return null;
            })
                .filter((weight) => weight !== null && !isNaN(Number(weight)));
        }
        if ((propName === 'style' || propName === 'styles') && t.isArrayExpression(prop.value)) {
            fontConfig.styles = prop.value.elements
                .filter((element) => t.isStringLiteral(element))
                .map((element) => element.value);
        }
        // Handle local font src property
        if (propName === 'src' && t.isArrayExpression(prop.value) && fontType === 'localFont') {
            const srcConfigs = prop.value.elements
                .filter((element) => t.isObjectExpression(element))
                .map((element) => {
                const srcConfig = {};
                element.properties.forEach((srcProp) => {
                    if (t.isObjectProperty(srcProp) && t.isIdentifier(srcProp.key)) {
                        const srcPropName = srcProp.key.name;
                        if (t.isStringLiteral(srcProp.value)) {
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
async function scanFonts(projectRoot) {
    try {
        let existedFonts = [];
        try {
            existedFonts = await scanExistingFonts(projectRoot);
            if (existedFonts && existedFonts.length > 0) {
                await (0, font_1.addFonts)(projectRoot, existedFonts);
            }
        }
        catch (existingFontsError) {
            console.error('Error scanning existing fonts:', existingFontsError);
        }
        const fontPath = pathModule.join(projectRoot, constants_1.DefaultSettings.FONT_CONFIG);
        if (!fs_1.default.existsSync(fontPath)) {
            console.log('Font file does not exist:', fontPath);
            return existedFonts || [];
        }
        const content = await (0, files_1.readFile)(fontPath);
        if (!content) {
            return existedFonts || [];
        }
        const fonts = [];
        try {
            const ast = (0, parser_1.parse)(content, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx'],
            });
            const fontImports = {};
            (0, traverse_1.default)(ast, {
                // Extract font imports from 'next/font/google' and 'next/font/local'
                ImportDeclaration(path) {
                    const source = path.node.source.value;
                    if (source === 'next/font/google') {
                        path.node.specifiers.forEach((specifier) => {
                            if (t.isImportSpecifier(specifier) &&
                                t.isIdentifier(specifier.imported)) {
                                fontImports[specifier.imported.name] = specifier.imported.name;
                            }
                        });
                    }
                    else if (source === 'next/font/local') {
                        path.node.specifiers.forEach((specifier) => {
                            if (t.isImportDefaultSpecifier(specifier) &&
                                t.isIdentifier(specifier.local)) {
                                fontImports[specifier.local.name] = 'localFont';
                            }
                        });
                    }
                },
                VariableDeclaration(path) {
                    const parentNode = path.parent;
                    if (!t.isExportNamedDeclaration(parentNode)) {
                        return;
                    }
                    path.node.declarations.forEach((declarator) => {
                        if (!t.isIdentifier(declarator.id) || !declarator.init) {
                            return;
                        }
                        const fontId = declarator.id.name;
                        if (t.isCallExpression(declarator.init)) {
                            const callee = declarator.init.callee;
                            let fontType = '';
                            if (t.isIdentifier(callee) && fontImports[callee.name]) {
                                fontType = fontImports[callee.name];
                            }
                            const configArg = declarator.init.arguments[0];
                            if (t.isObjectExpression(configArg)) {
                                const fontConfig = extractFontConfig(fontId, fontType, configArg);
                                fonts.push(fontConfig);
                            }
                        }
                    });
                },
            });
            return fonts;
        }
        catch (parseError) {
            console.error('Error parsing font file:', parseError);
            return existedFonts || [];
        }
    }
    catch (error) {
        console.error('Error scanning fonts:', error);
        return [];
    }
}
async function scanExistingFonts(projectRoot) {
    try {
        const routerConfig = await (0, pages_1.detectRouterType)(projectRoot);
        if (!routerConfig) {
            console.log('Could not detect Next.js router type');
            return [];
        }
        // Determine the layout file path based on router type
        let layoutPath;
        if (routerConfig.type === 'app') {
            layoutPath = pathModule.join(routerConfig.basePath, 'layout.tsx');
        }
        else {
            layoutPath = pathModule.join(routerConfig.basePath, '_app.tsx');
        }
        if (!fs_1.default.existsSync(layoutPath)) {
            console.log(`Layout file does not exist: ${layoutPath}`);
            return [];
        }
        const content = await (0, files_1.readFile)(layoutPath);
        if (!content) {
            console.log(`Layout file is empty: ${layoutPath}`);
            return [];
        }
        try {
            const ast = (0, parser_1.parse)(content, {
                sourceType: 'module',
                plugins: ['typescript', 'jsx'],
            });
            const fontImports = {};
            const fontVariables = [];
            const fonts = [];
            let updatedAst = false;
            try {
                (0, traverse_1.default)(ast, {
                    ImportDeclaration(path) {
                        if (!path.node || !path.node.source || !path.node.source.value) {
                            return;
                        }
                        const source = path.node.source.value;
                        if (source === 'next/font/google') {
                            if (!path.node.specifiers) {
                                return;
                            }
                            path.node.specifiers.forEach((specifier) => {
                                if (t.isImportSpecifier(specifier) &&
                                    t.isIdentifier(specifier.imported)) {
                                    fontImports[specifier.imported.name] = specifier.imported.name;
                                    try {
                                        path.remove();
                                    }
                                    catch (removeError) {
                                        console.error('Error removing font import:', removeError);
                                    }
                                }
                            });
                        }
                        else if (source === 'next/font/local') {
                            if (!path.node.specifiers) {
                                return;
                            }
                            path.node.specifiers.forEach((specifier) => {
                                if (t.isImportDefaultSpecifier(specifier) &&
                                    t.isIdentifier(specifier.local)) {
                                    fontImports[specifier.local.name] = 'localFont';
                                    try {
                                        path.remove();
                                    }
                                    catch (removeError) {
                                        console.error('Error removing font import:', removeError);
                                    }
                                }
                            });
                        }
                    },
                    VariableDeclaration(path) {
                        if (!path.node || !path.node.declarations) {
                            return;
                        }
                        path.node.declarations.forEach((declarator) => {
                            if (!t.isIdentifier(declarator.id) || !declarator.init) {
                                return;
                            }
                            if (t.isCallExpression(declarator.init)) {
                                const callee = declarator.init.callee;
                                if (t.isIdentifier(callee) && fontImports[callee.name]) {
                                    const fontType = fontImports[callee.name];
                                    const configArg = declarator.init.arguments[0];
                                    fontVariables.push(declarator.id.name);
                                    if (t.isObjectExpression(configArg)) {
                                        const fontConfig = extractFontConfig(declarator.id.name, fontType, configArg);
                                        if (!fontConfig.variable) {
                                            fontConfig.variable = `--font-${declarator.id.name}`;
                                        }
                                        fonts.push(fontConfig);
                                    }
                                    updatedAst = true;
                                    try {
                                        path.remove();
                                    }
                                    catch (removeError) {
                                        console.error('Error removing font variable:', removeError);
                                    }
                                }
                            }
                        });
                    },
                    JSXOpeningElement(path) {
                        if (!path.node ||
                            !t.isJSXIdentifier(path.node.name) ||
                            !path.node.attributes) {
                            return;
                        }
                        path.node.attributes.forEach((attr) => {
                            if (t.isJSXAttribute(attr) &&
                                t.isJSXIdentifier(attr.name) &&
                                attr.name.name === 'className') {
                                try {
                                    if ((0, utils_1.removeFontsFromClassName)(attr, { fontIds: fontVariables })) {
                                        updatedAst = true;
                                    }
                                }
                                catch (classNameError) {
                                    console.error('Error processing className:', classNameError);
                                }
                            }
                        });
                    },
                });
            }
            catch (traverseError) {
                console.error('Error during AST traversal:', traverseError);
                return [];
            }
            if (updatedAst) {
                try {
                    const { code } = (0, generator_1.default)(ast);
                    fs_1.default.writeFileSync(layoutPath, code);
                }
                catch (generateError) {
                    console.error('Error generating code from AST:', generateError);
                }
            }
            return fonts;
        }
        catch (parseError) {
            console.error(`Error parsing layout file ${layoutPath}:`, parseError);
            return [];
        }
    }
    catch (error) {
        console.error('Error scanning existing fonts:', error);
        return [];
    }
}
//# sourceMappingURL=scanner.js.map