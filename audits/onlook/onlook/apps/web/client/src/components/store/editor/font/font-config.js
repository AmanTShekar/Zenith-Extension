"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFontConfigPath = exports.ensureFontConfigFileExists = exports.readFontConfigFile = exports.removeFontFromConfig = exports.addFontToConfig = exports.scanExistingFonts = exports.scanFontConfig = void 0;
const fonts_1 = require("@onlook/fonts");
const models_1 = require("@onlook/models");
const parser_1 = require("@onlook/parser");
const lodash_1 = require("lodash");
const helpers_1 = require("../sandbox/helpers");
const scanFontConfig = async (fontConfigPath, editorEngine) => {
    try {
        const file = await (0, exports.readFontConfigFile)(fontConfigPath, editorEngine);
        if (!file) {
            return [];
        }
        const fonts = (0, fonts_1.parseFontDeclarations)(file.content);
        return fonts;
    }
    catch (error) {
        console.error('Error scanning fonts:', error);
        return [];
    }
};
exports.scanFontConfig = scanFontConfig;
/**
 * Scan existing fonts declaration in the layout file and move them to the font config file
 */
const scanExistingFonts = async (layoutPath, editorEngine) => {
    const sandbox = editorEngine.activeSandbox;
    if (!sandbox) {
        console.error('No sandbox session found');
        return;
    }
    const normalizedLayoutPath = (0, helpers_1.normalizePath)(layoutPath);
    try {
        const file = await sandbox.readFile(normalizedLayoutPath);
        if (typeof file !== 'string') {
            console.log(`Layout file is not text: ${layoutPath}`);
            return [];
        }
        const result = (0, fonts_1.migrateFontsFromLayout)(file);
        if (result.fonts.length > 0) {
            await sandbox.writeFile(normalizedLayoutPath, result.layoutContent);
        }
        return result.fonts;
    }
    catch (error) {
        console.error('Error scanning existing fonts:', error);
        return [];
    }
};
exports.scanExistingFonts = scanExistingFonts;
/**
 * Adds a new font to the font configuration file
 */
const addFontToConfig = async (font, fontConfigPath, editorEngine) => {
    try {
        // Convert the font family to the import name format (Pascal case, no spaces)
        const importName = font.family.replace(/\s+/g, '_');
        const fontName = (0, lodash_1.camelCase)(font.id);
        await (0, exports.ensureFontConfigFileExists)(fontConfigPath, editorEngine);
        const fontConfig = await (0, exports.readFontConfigFile)(fontConfigPath, editorEngine);
        if (!fontConfig) {
            console.error('Failed to read font config file');
            return false;
        }
        const { ast, content } = fontConfig;
        // Check if the font already exists in the font config file
        const { hasGoogleFontImport, hasImportName, hasFontExport } = (0, fonts_1.validateGoogleFontSetup)(content, importName, fontName);
        if (hasFontExport) {
            console.log(`Font ${fontName} already exists in font.ts`);
            return false;
        }
        // Add the font declaration to the font config file
        const exportDeclaration = (0, fonts_1.generateFontVariableExport)(font);
        ast.program.body.push(exportDeclaration);
        // Add or update the import if needed
        if (!hasGoogleFontImport) {
            const importDeclaration = parser_1.t.importDeclaration([parser_1.t.importSpecifier(parser_1.t.identifier(importName), parser_1.t.identifier(importName))], parser_1.t.stringLiteral('next/font/google'));
            ast.program.body.unshift(importDeclaration);
        }
        else if (!hasImportName) {
            (0, fonts_1.addGoogleFontSpecifier)(ast, importName);
        }
        // Generate and write the updated code back to the file
        const { code } = (0, parser_1.generate)(ast);
        await editorEngine.activeSandbox.writeFile(fontConfigPath, code);
        return true;
    }
    catch (error) {
        console.error('Error adding font:', error instanceof Error ? error.message : String(error));
        return false;
    }
};
exports.addFontToConfig = addFontToConfig;
/**
 * Removes a font from the font configuration file
 */
const removeFontFromConfig = async (font, fontConfigPath, editorEngine) => {
    try {
        const { content } = (await (0, exports.readFontConfigFile)(fontConfigPath, editorEngine)) ?? {};
        if (!content) {
            return false;
        }
        const { removedFont, fontFilesToDelete, ast } = (0, fonts_1.removeFontDeclaration)(font, content);
        if (removedFont) {
            const { code } = (0, parser_1.generate)(ast);
            const codeDiff = {
                original: content,
                generated: code,
                path: fontConfigPath,
            };
            await editorEngine.activeSandbox.writeFile(fontConfigPath, code);
            // Delete font files if this is a custom font
            if (fontFilesToDelete.length > 0) {
                const routerConfig = await editorEngine.activeSandbox.getRouterConfig();
                if (!routerConfig?.basePath) {
                    console.error('Could not get base path');
                    return false;
                }
                await Promise.all(fontFilesToDelete.map((file) => editorEngine.activeSandbox.deleteFile((0, helpers_1.normalizePath)(routerConfig.basePath + '/' + file))));
            }
            return codeDiff;
        }
        else {
            console.error(`Font ${font.id} not found in font.ts`);
            return false;
        }
    }
    catch (error) {
        console.error('Error removing font:', error);
        return false;
    }
};
exports.removeFontFromConfig = removeFontFromConfig;
/**
 * Reads the font configuration file
 */
const readFontConfigFile = async (fontConfigPath, editorEngine) => {
    const codeEditor = editorEngine.fileSystem;
    // Ensure the font config file exists, create it if it doesn't
    await (0, exports.ensureFontConfigFileExists)(fontConfigPath, editorEngine);
    const file = await codeEditor.readFile(fontConfigPath);
    if (typeof file !== 'string') {
        console.error("Font config file is not text");
        return;
    }
    const content = file;
    // Parse the file content using Babel
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        throw new Error('Failed to parse font config file');
    }
    return {
        ast,
        content,
    };
};
exports.readFontConfigFile = readFontConfigFile;
/**
 * Creates a default font configuration file template
 */
const createDefaultFontConfigTemplate = () => {
    return `// This file contains font configurations for your application.
// Fonts added through Onlook will be automatically exported from this file.
//
// Example Google Font:
// import { Inter } from 'next/font/google';
// 
// export const inter = Inter({
//   subsets: ['latin'],
//   weight: ['400', '700'],
//   style: ['normal'],
//   variable: '--font-inter',
//   display: 'swap'
// });
//
// Example Local Font:
// import localFont from 'next/font/local';
//
// export const customFont = localFont({
//   src: [
//     { path: './fonts/custom-regular.woff2', weight: '400', style: 'normal' },
//     { path: './fonts/custom-bold.woff2', weight: '700', style: 'normal' }
//   ],
//   variable: '--font-custom',
//   display: 'swap',
//   fallback: ['system-ui', 'sans-serif'],
//   preload: true
// });
`;
};
/**
 * Ensures the font configuration file exists
 */
const ensureFontConfigFileExists = async (fontConfigPath, editorEngine) => {
    const codeEditor = editorEngine.fileSystem;
    const fontConfigExists = await codeEditor.fileExists(fontConfigPath);
    if (!fontConfigExists) {
        const template = createDefaultFontConfigTemplate();
        await codeEditor.writeFile(fontConfigPath, template);
    }
};
exports.ensureFontConfigFileExists = ensureFontConfigFileExists;
/**
 * Updates the font config path based on the detected router configuration
 */
const getFontConfigPath = async (editorEngine) => {
    const routerConfig = await editorEngine.activeSandbox.getRouterConfig();
    if (routerConfig) {
        let fontConfigPath;
        if (routerConfig.type === models_1.RouterType.APP) {
            fontConfigPath = (0, helpers_1.normalizePath)(`${routerConfig.basePath}/fonts.ts`);
        }
        else {
            // For pages router, place fonts.ts in the appropriate directory
            if (routerConfig.basePath.startsWith('src/')) {
                fontConfigPath = (0, helpers_1.normalizePath)('src/fonts.ts');
            }
            else {
                fontConfigPath = (0, helpers_1.normalizePath)('fonts.ts');
            }
        }
        return fontConfigPath;
    }
    else {
        console.error('Could not get router config');
        return null;
    }
};
exports.getFontConfigPath = getFontConfigPath;
//# sourceMappingURL=font-config.js.map