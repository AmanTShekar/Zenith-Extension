"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const parser_1 = require("@onlook/parser");
const import_export_manager_1 = require("../src/helpers/import-export-manager");
const FONT_IMPORT_PATH = './fonts';
(0, bun_test_1.describe)('removeFontImportFromFile', () => {
    (0, bun_test_1.test)('removes a single named import (removes the whole line)', () => {
        const content = "import { Inter } from './fonts';\nconst x = 1;";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.removeFontImportFromFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toBe('const x = 1;');
    });
    (0, bun_test_1.test)('removes one of multiple named imports', () => {
        const content = "import { Inter, Roboto } from './fonts';\nconst x = 1;";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.removeFontImportFromFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('import { Roboto } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
        (0, bun_test_1.expect)(result).not.toContain('Inter');
    });
    (0, bun_test_1.test)('removes a named import with alias', () => {
        const content = "import { Inter as MyInter, Roboto } from './fonts';\nconst x = 1;";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.removeFontImportFromFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('import { Roboto } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
        (0, bun_test_1.expect)(result).not.toContain('Inter as MyInter');
    });
    (0, bun_test_1.test)('removes import with extra spaces and newlines', () => {
        const content = `import {\n  Inter,\n  Roboto\n} from './fonts';\nconst x = 1;`;
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.removeFontImportFromFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('Roboto');
        (0, bun_test_1.expect)(result).not.toContain('Inter');
    });
    (0, bun_test_1.test)('returns null if import is not found', () => {
        const content = "import { Roboto } from './fonts';\nconst x = 1;";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.removeFontImportFromFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toBeNull();
    });
    (0, bun_test_1.test)('does not remove anything if import path does not match', () => {
        const content = "import { Inter } from 'next/font/local';\nconst x = 1;";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.removeFontImportFromFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toBeNull();
    });
});
(0, bun_test_1.describe)('addFontImportToFile', () => {
    (0, bun_test_1.test)('creates new import statement when none exists', () => {
        const content = 'const Hello = () => { return <div>Hello</div>; }';
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('import { Inter } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
        (0, bun_test_1.expect)(result?.indexOf('import')).toBe(0);
    });
    (0, bun_test_1.test)('adds font to existing import statement', () => {
        const content = "import { Roboto } from './fonts';\nconst Hello = () => { return <div>Hello</div>; }";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('import { Roboto, Inter } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
    });
    (0, bun_test_1.test)('returns null when font already exists in imports', () => {
        const content = "import { Inter, Roboto } from './fonts';\nconst Hello = () => { return <div>Hello</div>; }";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toBeNull();
    });
    (0, bun_test_1.test)('adds font to existing import with multiple fonts', () => {
        const content = "import { Inter, Roboto } from './fonts';\nconst Hello = () => { return <div>Hello</div>; }";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Lato', ast);
        (0, bun_test_1.expect)(result).toContain('import { Inter, Roboto, Lato } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
    });
    (0, bun_test_1.test)('handles imports with extra spaces and formatting', () => {
        const content = `import {\n  Inter,\n  Roboto\n} from './fonts';\nconst Hello = () => { return <div>Hello</div>; }`;
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Lato', ast);
        (0, bun_test_1.expect)(result).toContain('Lato');
        (0, bun_test_1.expect)(result).toContain('Inter');
        (0, bun_test_1.expect)(result).toContain('Roboto');
    });
    (0, bun_test_1.test)('does not add if import path does not match', () => {
        const content = "import { Inter } from 'next/font/local';\nconst Hello = () => { return <div>Hello</div>; }";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Roboto', ast);
        (0, bun_test_1.expect)(result).toContain('import { Roboto } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
        (0, bun_test_1.expect)(result).toContain('import { Inter } from');
        (0, bun_test_1.expect)(result).toContain('next/font/local');
    });
    (0, bun_test_1.test)('handles empty file content', () => {
        const content = '';
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('import { Inter } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
        (0, bun_test_1.expect)(result?.trim().startsWith('import')).toBe(true);
    });
    (0, bun_test_1.test)('preserves existing code when adding new import', () => {
        const content = 'const Hello = () => { return <div>Hello</div>; }';
        const originalAst = (0, parser_1.parse)(content, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
        });
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('import { Inter } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
        (0, bun_test_1.expect)(result).toContain((0, parser_1.generate)(originalAst).code);
    });
    (0, bun_test_1.test)('handles different quote styles in import path', () => {
        const content = 'import { Roboto } from "./fonts";\nconst Hello = () => { return <div>Hello</div>; }';
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('Roboto');
        (0, bun_test_1.expect)(result).toContain('Inter');
        (0, bun_test_1.expect)(result).toContain('./fonts');
    });
    (0, bun_test_1.test)('cleans up comma formatting when adding to imports', () => {
        const content = "import { Roboto, } from './fonts';\nconst Hello = () => { return <div>Hello</div>; }";
        const ast = (0, parser_1.parse)(content, { sourceType: 'module', plugins: ['typescript', 'jsx'] });
        const result = (0, import_export_manager_1.addFontImportToFile)(FONT_IMPORT_PATH, 'Inter', ast);
        (0, bun_test_1.expect)(result).toContain('import { Roboto, Inter } from');
        (0, bun_test_1.expect)(result).toContain('./fonts');
        (0, bun_test_1.expect)(result).not.toContain('Roboto, ,');
    });
});
//# sourceMappingURL=import-export-manager.test.js.map