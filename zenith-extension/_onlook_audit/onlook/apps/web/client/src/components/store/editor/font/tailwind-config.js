"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewTailwindConfigFile = exports.ensureTailwindConfigExists = exports.addFontToTailwindConfig = exports.removeFontFromTailwindConfig = void 0;
const constants_1 = require("@onlook/constants");
const fonts_1 = require("@onlook/fonts");
const helpers_1 = require("../sandbox/helpers");
const tailwindConfigPath = (0, helpers_1.normalizePath)(constants_1.DefaultSettings.TAILWIND_CONFIG);
/**
 * Removes a font from the Tailwind config
 */
const removeFontFromTailwindConfig = async (font, sandbox) => {
    try {
        const file = await sandbox.readFile(tailwindConfigPath);
        if (typeof file !== 'string') {
            console.error("Tailwind config file is not text");
            return false;
        }
        const content = file;
        const result = (0, fonts_1.removeFontFromTailwindTheme)(font.id, content);
        if (!result) {
            return false;
        }
        await sandbox.writeFile(tailwindConfigPath, result);
        return true;
    }
    catch (error) {
        console.error('Error removing font from Tailwind config:', error);
        return false;
    }
};
exports.removeFontFromTailwindConfig = removeFontFromTailwindConfig;
/**
 * Add a font to the Tailwind config
 */
const addFontToTailwindConfig = async (font, sandbox) => {
    try {
        const file = await sandbox.readFile(tailwindConfigPath);
        if (typeof file !== 'string') {
            console.error("Tailwind config file is not text");
            return false;
        }
        const content = file;
        const result = (0, fonts_1.addFontToTailwindTheme)(font, content);
        if (!result) {
            return false;
        }
        await sandbox.writeFile(tailwindConfigPath, result);
        return true;
    }
    catch (error) {
        console.error('Error updating Tailwind font config:', error);
        return false;
    }
};
exports.addFontToTailwindConfig = addFontToTailwindConfig;
/**
 * Ensures Tailwind config file exists
 */
const ensureTailwindConfigExists = async (sandbox) => {
    const tailwindConfigExists = await sandbox.fileExists(tailwindConfigPath);
    if (!tailwindConfigExists) {
        await (0, exports.createNewTailwindConfigFile)(sandbox);
    }
};
exports.ensureTailwindConfigExists = ensureTailwindConfigExists;
/**
 * Creates a new Tailwind config file
 */
const createNewTailwindConfigFile = async (sandbox) => {
    const tailwindConfigContent = `import type { Config } from 'tailwindcss';
const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        fontFamily: {},
    },
    plugins: [require('tailwindcss-animate')],
};

export default config;
`;
    try {
        await sandbox.writeFile(tailwindConfigPath, tailwindConfigContent);
        console.log(`Created new Tailwind config file at: ${tailwindConfigPath}`);
    }
    catch (error) {
        console.error('Error creating new Tailwind config file:', error);
    }
};
exports.createNewTailwindConfigFile = createNewTailwindConfigFile;
//# sourceMappingURL=tailwind-config.js.map