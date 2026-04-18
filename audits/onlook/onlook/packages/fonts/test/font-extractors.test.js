"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const font_extractors_1 = require("../src/helpers/font-extractors");
const test_utils_1 = require("./test-utils");
const parser_1 = require("@onlook/parser");
const path_1 = __importDefault(require("path"));
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('parseFontDeclarations', () => {
    const processParseFontDeclarations = (content) => {
        const fonts = (0, font_extractors_1.parseFontDeclarations)(content);
        return JSON.stringify(fonts, null, 4);
    };
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/font-extractors/parse-font-declarations'),
        inputFileName: 'input',
        expectedFileName: 'expected',
    }, processParseFontDeclarations);
    (0, bun_test_1.test)('should handle empty content', () => {
        const result = (0, font_extractors_1.parseFontDeclarations)('');
        (0, bun_test_1.expect)(result).toEqual([]);
    });
    (0, bun_test_1.test)('should handle content with no font imports', () => {
        const content = `
            import React from 'react';
            const Component = () => <div>Hello</div>;
        `;
        const result = (0, font_extractors_1.parseFontDeclarations)(content);
        (0, bun_test_1.expect)(result).toEqual([]);
    });
    (0, bun_test_1.test)('should handle invalid syntax gracefully', () => {
        const content = 'invalid javascript syntax {';
        (0, bun_test_1.expect)(() => (0, font_extractors_1.parseFontDeclarations)(content)).toThrow();
    });
});
(0, bun_test_1.describe)('buildFontConfiguration', () => {
    (0, bun_test_1.test)('should build Google font configuration', () => {
        const content = `
            const config = {
                subsets: ['latin', 'latin-ext'],
                weight: ['400', '700'],
                style: ['normal', 'italic'],
                variable: '--font-inter',
                display: 'swap'
            };
        `;
        const ast = (0, parser_1.parse)(content);
        let configArg = null;
        // Extract the object expression from the AST
        (0, parser_1.traverse)(ast, {
            ObjectExpression(path) {
                configArg = path.node;
                path.stop();
            },
        });
        if (configArg) {
            const result = (0, font_extractors_1.buildFontConfiguration)('inter', 'Inter', configArg);
            (0, bun_test_1.expect)(result).toEqual({
                id: 'inter',
                family: 'Inter',
                type: 'google',
                subsets: ['latin', 'latin-ext'],
                weight: ['400', '700'],
                styles: ['normal', 'italic'],
                variable: '--font-inter',
            });
        }
        else {
            throw new Error('Could not find object expression in test AST');
        }
    });
    (0, bun_test_1.test)('should build local font configuration', () => {
        const content = `
            const config = {
                src: [
                    { path: './fonts/custom-regular.woff2', weight: '400', style: 'normal' },
                    { path: './fonts/custom-bold.woff2', weight: '700', style: 'normal' }
                ],
                variable: '--font-custom',
                display: 'swap'
            };
        `;
        const ast = (0, parser_1.parse)(content);
        let configArg = null;
        // Extract the object expression from the AST
        (0, parser_1.traverse)(ast, {
            ObjectExpression(path) {
                configArg = path.node;
                path.stop();
            },
        });
        if (configArg) {
            const result = (0, font_extractors_1.buildFontConfiguration)('customFont', 'localFont', configArg);
            (0, bun_test_1.expect)(result).toEqual({
                id: 'customFont',
                family: 'customFont',
                type: 'local',
                subsets: [],
                weight: ['400', '700'],
                styles: ['normal'],
                variable: '--font-custom',
            });
        }
        else {
            throw new Error('Could not find object expression in test AST');
        }
    });
    (0, bun_test_1.test)('should handle empty configuration object', () => {
        const content = 'const config = {};';
        const ast = (0, parser_1.parse)(content);
        let configArg = null;
        (0, parser_1.traverse)(ast, {
            ObjectExpression(path) {
                configArg = path.node;
                path.stop();
            },
        });
        if (configArg) {
            const result = (0, font_extractors_1.buildFontConfiguration)('testFont', 'TestFont', configArg);
            (0, bun_test_1.expect)(result).toEqual({
                id: 'testFont',
                family: 'TestFont',
                type: 'google',
                subsets: [],
                weight: [],
                styles: [],
                variable: '',
            });
        }
    });
});
(0, bun_test_1.describe)('migrateFontsFromLayout', () => {
    let originalConsoleError;
    (0, bun_test_1.beforeEach)(() => {
        originalConsoleError = console.error;
    });
    (0, bun_test_1.afterEach)(() => {
        console.error = originalConsoleError;
    });
    const processMigrateFontsFromLayout = (content) => {
        const result = (0, font_extractors_1.migrateFontsFromLayout)(content);
        return JSON.stringify({
            layoutContent: result.layoutContent,
            fonts: result.fonts,
        }, null, 4);
    };
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/font-extractors/migrate-fonts-from-layout'),
        inputFileName: 'input',
        expectedFileName: 'expected',
    }, processMigrateFontsFromLayout);
    (0, bun_test_1.test)('should handle layout with no fonts', () => {
        const content = `
            import React from 'react';
            
            export default function Layout({ children }: { children: React.ReactNode }) {
                return (
                    <html>
                        <body>{children}</body>
                    </html>
                );
            }
        `;
        const result = (0, font_extractors_1.migrateFontsFromLayout)(content);
        (0, bun_test_1.expect)(result.fonts).toEqual([]);
        (0, bun_test_1.expect)(result.layoutContent).toContain("import React from 'react';");
    });
    (0, bun_test_1.test)('should handle invalid syntax gracefully', () => {
        // Suppress console.error for expected parsing error
        console.error = () => { };
        const content = 'invalid javascript syntax {';
        const result = (0, font_extractors_1.migrateFontsFromLayout)(content);
        (0, bun_test_1.expect)(result.layoutContent).toBe(content);
        (0, bun_test_1.expect)(result.fonts).toEqual([]);
    });
    (0, bun_test_1.test)('should generate default variable if not provided', () => {
        const content = `
            import { Inter } from 'next/font/google';
            
            export const inter = Inter({
                subsets: ['latin'],
                weight: ['400']
            });
        `;
        const result = (0, font_extractors_1.migrateFontsFromLayout)(content);
        (0, bun_test_1.expect)(result.fonts).toHaveLength(1);
        (0, bun_test_1.expect)(result.fonts[0].variable).toBe('--font-inter');
    });
});
//# sourceMappingURL=font-extractors.test.js.map