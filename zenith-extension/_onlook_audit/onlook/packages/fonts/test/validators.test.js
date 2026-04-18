"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const parser_1 = require("@onlook/parser");
const validators_1 = require("../src/helpers/validators");
// Helper to get NodePath for a property
function getObjectPropertyPath(ast, key) {
    let foundPath = null;
    (0, parser_1.traverse)(ast, {
        ObjectProperty(path) {
            if (parser_1.t.isIdentifier(path.node.key) && path.node.key.name === key) {
                foundPath = path;
                path.stop();
            }
        },
    });
    return foundPath;
}
(0, bun_test_1.describe)('isTailwindThemeProperty', () => {
    (0, bun_test_1.test)('returns true for theme property in object', () => {
        const ast = (0, parser_1.parse)('const config = { theme: {} }');
        const path = getObjectPropertyPath(ast, 'theme');
        (0, bun_test_1.expect)(path).not.toBeNull();
        if (path)
            (0, bun_test_1.expect)((0, validators_1.isTailwindThemeProperty)(path)).toBe(true);
    });
    (0, bun_test_1.test)('returns false for non-theme property', () => {
        const ast = (0, parser_1.parse)('const config = { fontFamily: {} }');
        const path = getObjectPropertyPath(ast, 'fontFamily');
        (0, bun_test_1.expect)(path).not.toBeNull();
        if (path)
            (0, bun_test_1.expect)((0, validators_1.isTailwindThemeProperty)(path)).toBe(false);
    });
});
(0, bun_test_1.describe)('hasPropertyName', () => {
    (0, bun_test_1.test)('returns true for matching property name', () => {
        const ast = (0, parser_1.parse)('const obj = { src: "foo" }');
        const path = getObjectPropertyPath(ast, 'src');
        (0, bun_test_1.expect)(path).not.toBeNull();
        if (path && path.node)
            (0, bun_test_1.expect)((0, validators_1.hasPropertyName)(path.node, 'src')).toBe(true);
    });
    (0, bun_test_1.test)('returns false for non-matching property name', () => {
        const ast = (0, parser_1.parse)('const obj = { variable: "bar" }');
        const path = getObjectPropertyPath(ast, 'variable');
        (0, bun_test_1.expect)(path).not.toBeNull();
        if (path && path.node)
            (0, bun_test_1.expect)((0, validators_1.hasPropertyName)(path.node, 'src')).toBe(false);
    });
});
(0, bun_test_1.describe)('isValidLocalFontDeclaration', () => {
    (0, bun_test_1.test)('returns true for valid localFont declaration', () => {
        const ast = (0, parser_1.parse)('const myFont = localFont({ src: "foo.woff2" })');
        const declStmt = ast.program.body[0];
        if (parser_1.t.isVariableDeclaration(declStmt)) {
            const decl = declStmt.declarations[0];
            (0, bun_test_1.expect)((0, validators_1.isValidLocalFontDeclaration)(decl, 'myFont')).toBe(true);
        }
    });
    (0, bun_test_1.test)('returns false for wrong variable name', () => {
        const ast = (0, parser_1.parse)('const otherFont = localFont({ src: "foo.woff2" })');
        const declStmt = ast.program.body[0];
        if (parser_1.t.isVariableDeclaration(declStmt)) {
            const decl = declStmt.declarations[0];
            (0, bun_test_1.expect)((0, validators_1.isValidLocalFontDeclaration)(decl, 'myFont')).toBe(false);
        }
    });
    (0, bun_test_1.test)('returns false for non-localFont call', () => {
        const ast = (0, parser_1.parse)('const myFont = notLocalFont({ src: "foo.woff2" })');
        const declStmt = ast.program.body[0];
        if (parser_1.t.isVariableDeclaration(declStmt)) {
            const decl = declStmt.declarations[0];
            (0, bun_test_1.expect)((0, validators_1.isValidLocalFontDeclaration)(decl, 'myFont')).toBe(false);
        }
    });
    (0, bun_test_1.test)('returns false for missing object config', () => {
        const ast = (0, parser_1.parse)('const myFont = localFont()');
        const declStmt = ast.program.body[0];
        if (parser_1.t.isVariableDeclaration(declStmt)) {
            const decl = declStmt.declarations[0];
            (0, bun_test_1.expect)((0, validators_1.isValidLocalFontDeclaration)(decl, 'myFont')).toBe(false);
        }
    });
});
(0, bun_test_1.describe)('hasLocalFontImport', () => {
    (0, bun_test_1.test)('returns true if import exists', () => {
        const ast = (0, parser_1.parse)("import localFont from 'next/font/local';", { sourceType: 'module' });
        (0, bun_test_1.expect)((0, validators_1.hasLocalFontImport)(ast)).toBe(true);
    });
    (0, bun_test_1.test)('returns false if import does not exist', () => {
        const ast = (0, parser_1.parse)("import { Inter } from 'next/font/google';", { sourceType: 'module' });
        (0, bun_test_1.expect)((0, validators_1.hasLocalFontImport)(ast)).toBe(false);
    });
});
(0, bun_test_1.describe)('findFontExportDeclaration', () => {
    (0, bun_test_1.test)('finds export declaration for font', () => {
        const ast = (0, parser_1.parse)('export const myFont = localFont({ src: "foo.woff2" });', {
            sourceType: 'module',
        });
        const { fontNameExists, existingFontNode } = (0, validators_1.findFontExportDeclaration)(ast, 'myFont');
        (0, bun_test_1.expect)(fontNameExists).toBe(true);
        (0, bun_test_1.expect)(existingFontNode).toBeTruthy();
    });
    (0, bun_test_1.test)('returns false if export not found', () => {
        const ast = (0, parser_1.parse)('export const otherFont = localFont({ src: "foo.woff2" });', {
            sourceType: 'module',
        });
        const { fontNameExists, existingFontNode } = (0, validators_1.findFontExportDeclaration)(ast, 'myFont');
        (0, bun_test_1.expect)(fontNameExists).toBe(false);
        (0, bun_test_1.expect)(existingFontNode).toBeNull();
    });
});
(0, bun_test_1.describe)('validateGoogleFontSetup', () => {
    const content = `import { Inter, Roboto } from 'next/font/google';
export const inter = Inter({ subsets: ['latin'] });`;
    (0, bun_test_1.test)('returns all true for valid setup', () => {
        const result = (0, validators_1.validateGoogleFontSetup)(content, 'Inter', 'inter');
        (0, bun_test_1.expect)(result).toEqual({
            hasGoogleFontImport: true,
            hasImportName: true,
            hasFontExport: true,
        });
    });
    (0, bun_test_1.test)('returns false for missing import', () => {
        const result = (0, validators_1.validateGoogleFontSetup)('export const inter = Inter({})', 'Inter', 'inter');
        (0, bun_test_1.expect)(result).toEqual({
            hasGoogleFontImport: false,
            hasImportName: false,
            hasFontExport: true,
        });
    });
    (0, bun_test_1.test)('returns false for missing import name', () => {
        const result = (0, validators_1.validateGoogleFontSetup)('import { Roboto } from "next/font/google"; export const inter = Inter({})', 'Inter', 'inter');
        (0, bun_test_1.expect)(result).toEqual({
            hasGoogleFontImport: true,
            hasImportName: false,
            hasFontExport: true,
        });
    });
    (0, bun_test_1.test)('returns false for missing export', () => {
        const result = (0, validators_1.validateGoogleFontSetup)('import { Inter } from "next/font/google";', 'Inter', 'inter');
        (0, bun_test_1.expect)(result).toEqual({
            hasGoogleFontImport: true,
            hasImportName: true,
            hasFontExport: false,
        });
    });
    (0, bun_test_1.test)('returns all false for empty content', () => {
        const result = (0, validators_1.validateGoogleFontSetup)('', 'Inter', 'inter');
        (0, bun_test_1.expect)(result).toEqual({
            hasGoogleFontImport: false,
            hasImportName: false,
            hasFontExport: false,
        });
    });
});
//# sourceMappingURL=validators.test.js.map