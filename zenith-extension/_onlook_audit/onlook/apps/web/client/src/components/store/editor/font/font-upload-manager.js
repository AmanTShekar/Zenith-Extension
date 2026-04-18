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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAstWithFontConfig = exports.processFontFiles = exports.uploadFonts = void 0;
const constants_1 = require("@onlook/constants");
const fonts_1 = require("@onlook/fonts");
const parser_1 = require("@onlook/parser");
const utility_1 = require("@onlook/utility");
const lodash_1 = require("lodash");
const pathModule = __importStar(require("path"));
/**
 * Uploads font files to the project
 */
const uploadFonts = async (editorEngine, fontFiles, basePath, fontConfigAst) => {
    try {
        if (fontFiles.length === 0) {
            return {
                success: false,
                fontConfigAst,
            };
        }
        const baseFontName = fontFiles[0]?.name.split('.')[0] ?? 'custom-font';
        const fontName = (0, lodash_1.camelCase)(`custom-${baseFontName}`);
        const { fontNameExists, existingFontNode } = (0, fonts_1.findFontExportDeclaration)(fontConfigAst, fontName);
        const fontConfigs = await (0, exports.processFontFiles)(editorEngine, fontFiles, baseFontName, basePath);
        const fontsSrc = (0, fonts_1.createFontSrcObjects)(fontConfigs);
        await (0, exports.updateAstWithFontConfig)(fontConfigAst, fontName, fontsSrc, fontNameExists, existingFontNode);
        return {
            success: true,
            fontConfigAst,
        };
    }
    catch (error) {
        console.error('Error uploading fonts:', error);
        return {
            success: false,
            fontConfigAst,
        };
    }
};
exports.uploadFonts = uploadFonts;
/**
 * Processes font files and saves them to the project
 */
const processFontFiles = async (editorEngine, fontFiles, baseFontName, basePath) => {
    return Promise.all(fontFiles.map(async (fontFile) => {
        const weight = fontFile.weight;
        const style = fontFile.style.toLowerCase();
        const fileName = (0, utility_1.getFontFileName)(baseFontName, weight, style);
        const sanitizedOriginalName = (0, utility_1.sanitizeFilename)(fontFile.file.name);
        const fileExtension = sanitizedOriginalName.split('.').pop();
        const filePath = pathModule.join(basePath, constants_1.DefaultSettings.FONT_FOLDER, `${fileName}.${fileExtension}`);
        const buffer = Buffer.from(fontFile.file.buffer);
        await editorEngine.activeSandbox.writeFile(filePath, buffer);
        return {
            path: pathModule.posix.join('./fonts', `${fileName}.${fileExtension}`),
            weight,
            style,
        };
    }));
};
exports.processFontFiles = processFontFiles;
/**
 * Updates AST with font configuration
 */
const updateAstWithFontConfig = async (ast, fontName, fontsSrc, fontNameExists, existingFontNode) => {
    const hasImport = (0, fonts_1.hasLocalFontImport)(ast);
    if (fontNameExists && existingFontNode) {
        (0, fonts_1.mergeLocalFontSources)(ast, existingFontNode, fontName, fontsSrc);
    }
    else {
        (0, fonts_1.createLocalFontConfig)(ast, fontName, fontsSrc);
        if (!hasImport) {
            const importDeclaration = parser_1.t.importDeclaration([parser_1.t.importDefaultSpecifier(parser_1.t.identifier('localFont'))], parser_1.t.stringLiteral('next/font/local'));
            ast.program.body.unshift(importDeclaration);
        }
    }
};
exports.updateAstWithFontConfig = updateAstWithFontConfig;
//# sourceMappingURL=font-upload-manager.js.map