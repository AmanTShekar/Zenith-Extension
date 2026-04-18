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
exports.updateTailwindFontConfig = updateTailwindFontConfig;
exports.removeFontFromTailwindConfig = removeFontFromTailwindConfig;
const fs = __importStar(require("fs"));
const t = __importStar(require("@babel/types"));
const helpers_1 = require("../helpers");
const lodash_1 = require("lodash");
const files_1 = require("../../code/files");
/**
 * Updates the Tailwind configuration to include the new font family
 * Adds the font variable and fallback to the theme.fontFamily configuration
 */
async function updateTailwindFontConfig(projectRoot, font) {
    try {
        const { configPath } = (0, helpers_1.getConfigPath)(projectRoot);
        if (!configPath) {
            console.log('No Tailwind config file found');
            return;
        }
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const { isUpdated, output } = (0, helpers_1.modifyTailwindConfig)(configContent, {
            visitor: (path) => {
                // Find the theme property
                if (t.isIdentifier(path.node.key) &&
                    path.node.key.name === 'theme' &&
                    t.isObjectExpression(path.node.value)) {
                    // Look for fontFamily inside theme
                    const themeProps = path.node.value.properties;
                    let fontFamilyProp = themeProps.find((prop) => t.isObjectProperty(prop) &&
                        t.isIdentifier(prop.key) &&
                        prop.key.name === 'fontFamily');
                    // If fontFamily doesn't exist, create it
                    if (!fontFamilyProp) {
                        fontFamilyProp = t.objectProperty(t.identifier('fontFamily'), t.objectExpression([]));
                        themeProps.push(fontFamilyProp);
                    }
                    if (t.isObjectExpression(fontFamilyProp.value)) {
                        const fontExists = fontFamilyProp.value.properties.some((prop) => t.isObjectProperty(prop) &&
                            t.isIdentifier(prop.key) &&
                            prop.key.name === font.id);
                        if (!fontExists) {
                            const fontVarName = `var(--font-${(0, lodash_1.kebabCase)(font.id)})`;
                            const fallback = font.type === 'google' ? 'sans-serif' : 'monospace';
                            const fontArray = t.arrayExpression([
                                t.stringLiteral(fontVarName),
                                t.stringLiteral(fallback),
                            ]);
                            // Add the new font property to fontFamily
                            fontFamilyProp.value.properties.push(t.objectProperty(t.identifier((0, lodash_1.camelCase)(font.id)), fontArray));
                            return true;
                        }
                    }
                }
                return false;
            },
        });
        if (isUpdated) {
            const formattedOutput = await (0, files_1.formatContent)(configPath, output);
            await (0, files_1.writeFile)(configPath, formattedOutput);
        }
        else {
            console.log(`Font ${font.id} already exists in Tailwind config or couldn't update the config`);
        }
    }
    catch (error) {
        console.error('Error updating Tailwind config with font:', error);
    }
}
/**
 * Removes a font configuration from the Tailwind config file
 * Cleans up the theme.fontFamily configuration by removing the specified font
 */
async function removeFontFromTailwindConfig(projectRoot, font) {
    try {
        const { configPath } = (0, helpers_1.getConfigPath)(projectRoot);
        if (!configPath) {
            console.log('No Tailwind config file found');
            return;
        }
        const configContent = fs.readFileSync(configPath, 'utf-8');
        // Use the new modifyTailwindConfig utility
        const { isUpdated, output } = (0, helpers_1.modifyTailwindConfig)(configContent, {
            visitor: (path) => {
                // Find the theme property
                if (t.isIdentifier(path.node.key) &&
                    path.node.key.name === 'theme' &&
                    t.isObjectExpression(path.node.value)) {
                    // Look for fontFamily inside theme
                    const themeProps = path.node.value.properties;
                    const fontFamilyProp = themeProps.find((prop) => t.isObjectProperty(prop) &&
                        t.isIdentifier(prop.key) &&
                        prop.key.name === 'fontFamily');
                    if (fontFamilyProp && t.isObjectExpression(fontFamilyProp.value)) {
                        // Find the font to remove
                        const properties = fontFamilyProp.value.properties;
                        const fontIndex = properties.findIndex((prop) => t.isObjectProperty(prop) &&
                            t.isIdentifier(prop.key) &&
                            prop.key.name === font.id);
                        // If the font is found, remove it
                        if (fontIndex !== -1) {
                            properties.splice(fontIndex, 1);
                            return true; // Signal that we updated the config
                        }
                    }
                }
                return false;
            },
        });
        if (isUpdated) {
            const formattedOutput = await (0, files_1.formatContent)(configPath, output);
            await (0, files_1.writeFile)(configPath, formattedOutput);
        }
        else {
            console.log(`Font ${font.id} not found in Tailwind config or couldn't update the config`);
        }
    }
    catch (error) {
        console.error('Error removing font from Tailwind config:', error);
    }
}
//# sourceMappingURL=tailwind.js.map