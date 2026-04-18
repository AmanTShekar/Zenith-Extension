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
const t = __importStar(require("@babel/types"));
const constants_1 = require("@onlook/constants");
const bun_test_1 = require("bun:test");
const path_1 = __importDefault(require("path"));
const src_1 = require("src");
const __dirname = import.meta.dir;
(0, bun_test_1.describe)('Environment-dependent behavior', () => {
    (0, bun_test_1.test)('should remove correct deprecated scripts for current environment', async () => {
        const input = `import Script from 'next/script';
export default function Document() {
    return (
        <html>
            <head>
                <Script type="module" src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}" />
                <Script type="module" src="${constants_1.DEPRECATED_PRELOAD_SCRIPT_SRCS[0]}" />
            </head>
            <body>
                <main />
            </body>
        </html>
    );
}`;
        const ast = (0, src_1.getAstFromContent)(input);
        if (!ast)
            throw new Error('Failed to parse input code');
        (0, src_1.removeDeprecatedPreloadScripts)(ast);
        const result = await (0, src_1.getContentFromAst)(ast, input);
        // Current environment script should remain
        (0, bun_test_1.expect)(result).toContain(`src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}"`);
        // Deprecated script for current environment should be removed
        (0, bun_test_1.expect)(result).not.toContain(`src="${constants_1.DEPRECATED_PRELOAD_SCRIPT_SRCS[0]}"`);
        // Other deprecated scripts should also be removed
        (0, bun_test_1.expect)(result).not.toContain(`src="${constants_1.DEPRECATED_PRELOAD_SCRIPT_SRCS[0]}"`);
    });
    (0, bun_test_1.test)('should scan correctly for production environment script', async () => {
        const input = `import Script from 'next/script';
export default function Document() {
    return (
        <html>
            <body>
                <Script type="module" src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}" />
            </body>
        </html>
    );
}`;
        const ast = (0, src_1.getAstFromContent)(input);
        if (!ast)
            throw new Error('Failed to parse input code');
        const result = (0, src_1.scanForPreloadScript)(ast);
        (0, bun_test_1.expect)(result.scriptCount).toBe(1);
        (0, bun_test_1.expect)(result.deprecatedScriptCount).toBe(0);
        (0, bun_test_1.expect)(result.injectedCorrectly).toBe(true);
    });
    (0, bun_test_1.test)('should identify deprecated script as deprecated for production environment', async () => {
        const input = `import Script from 'next/script';
export default function Document() {
    return (
        <html>
            <body>
                <Script type="module" src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}" />
                <Script type="module" src="${constants_1.DEPRECATED_PRELOAD_SCRIPT_SRCS[0]}" />
            </body>
        </html>
    );
}`;
        const ast = (0, src_1.getAstFromContent)(input);
        if (!ast)
            throw new Error('Failed to parse input code');
        const result = (0, src_1.scanForPreloadScript)(ast);
        (0, bun_test_1.expect)(result.scriptCount).toBe(1);
        (0, bun_test_1.expect)(result.deprecatedScriptCount).toBe(1);
        (0, bun_test_1.expect)(result.injectedCorrectly).toBe(true);
    });
    (0, bun_test_1.test)('should handle mixed current and deprecated scripts for development environment', async () => {
        process.env.NODE_ENV = 'development';
        const input = `import Script from 'next/script';
export default function Document() {
    return (
        <html>
            <body>
                <Script type="module" src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}" />
            </body>
        </html>
    );
}`;
        const ast = (0, src_1.getAstFromContent)(input);
        if (!ast)
            throw new Error('Failed to parse input code');
        const result = (0, src_1.scanForPreloadScript)(ast);
        (0, bun_test_1.expect)(result.scriptCount).toBe(1);
        (0, bun_test_1.expect)(result.deprecatedScriptCount).toBe(0);
        (0, bun_test_1.expect)(result.injectedCorrectly).toBe(true);
    });
});
(0, bun_test_1.describe)('removeDeprecatedPreloadScripts', () => {
    // Test additional cases to ensure the function only removes deprecated scripts
    (0, bun_test_1.test)('should not remove non-deprecated scripts', async () => {
        const input = `import Script from 'next/script';
export default function Document() {
    return (
        <html>
            <head>
                <Script type="module" src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}" />
                <Script type="module" src="https://example.com/other-script.js" />
            </head>
            <body>
                <main />
            </body>
        </html>
    );
}`;
        const ast = (0, src_1.getAstFromContent)(input);
        if (!ast)
            throw new Error('Failed to parse input code');
        (0, src_1.removeDeprecatedPreloadScripts)(ast);
        const result = await (0, src_1.getContentFromAst)(ast, input);
        // Should keep both scripts since neither is deprecated
        (0, bun_test_1.expect)(result).toContain(`src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}"`);
        (0, bun_test_1.expect)(result).toContain('src="https://example.com/other-script.js"');
    });
    (0, bun_test_1.test)('should remove only deprecated scripts and keep current ones', async () => {
        const input = `import Script from 'next/script';
export default function Document() {
    return (
        <html>
            <head>
                <Script type="module" src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}" />
                <Script type="module" src="${constants_1.DEPRECATED_PRELOAD_SCRIPT_SRCS[0]}" />
            </head>
            <body>
                <main />
            </body>
        </html>
    );
}`;
        const ast = (0, src_1.getAstFromContent)(input);
        if (!ast)
            throw new Error('Failed to parse input code');
        (0, src_1.removeDeprecatedPreloadScripts)(ast);
        const result = await (0, src_1.getContentFromAst)(ast, input);
        // Should keep the current script
        (0, bun_test_1.expect)(result).toContain(`src="${constants_1.ONLOOK_PRELOAD_SCRIPT_SRC}"`);
        // Should remove deprecated scripts
        (0, bun_test_1.expect)(result).not.toContain(`src="${constants_1.DEPRECATED_PRELOAD_SCRIPT_SRCS[0]}"`);
    });
});
(0, bun_test_1.describe)('scanForPreloadScript', () => {
    const layoutCasesDir = path_1.default.resolve(__dirname, 'data/layout');
    // Test cases using existing layout test data
    const testCaseExpectations = {
        'adds-script-if-missing': {
            scriptCount: 0,
            deprecatedScriptCount: 0,
            injectedCorrectly: false,
        },
        'does-not-duplicate': {
            scriptCount: 0,
            deprecatedScriptCount: 2,
            injectedCorrectly: false,
        },
        'removes-deprecated-script': {
            scriptCount: 0,
            deprecatedScriptCount: 0,
            injectedCorrectly: false,
        },
        'removes-deprecated-script-multiple': {
            scriptCount: 0,
            deprecatedScriptCount: 0,
            injectedCorrectly: false,
        },
        'injects-at-bottom': {
            scriptCount: 0,
            deprecatedScriptCount: 0,
            injectedCorrectly: false,
        },
    };
    for (const [testCase, expected] of Object.entries(testCaseExpectations)) {
        (0, bun_test_1.test)(`should correctly scan ${testCase}`, async () => {
            const caseDir = path_1.default.resolve(layoutCasesDir, testCase);
            const inputPath = path_1.default.resolve(caseDir, 'input.tsx');
            const inputContent = await Bun.file(inputPath).text();
            const ast = (0, src_1.getAstFromContent)(inputContent);
            if (!ast)
                throw new Error('Failed to parse input code');
            const result = (0, src_1.scanForPreloadScript)(ast);
            (0, bun_test_1.expect)(result.scriptCount).toBe(expected.scriptCount);
            (0, bun_test_1.expect)(result.deprecatedScriptCount).toBe(expected.deprecatedScriptCount);
            (0, bun_test_1.expect)(result.injectedCorrectly).toBe(expected.injectedCorrectly);
        });
    }
    function createMockAst(body) {
        return t.file(t.program(body), [], []);
    }
    function createScriptElement(src, parentElement) {
        const scriptElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('Script'), [t.jsxAttribute(t.jsxIdentifier('src'), t.stringLiteral(src))], false), t.jsxClosingElement(t.jsxIdentifier('Script')), [], false);
        if (parentElement) {
            const parent = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(parentElement), [], false), t.jsxClosingElement(t.jsxIdentifier(parentElement)), [scriptElement], false);
            return parent;
        }
        return scriptElement;
    }
    function createComponentWithJSX(jsxElement) {
        const returnStatement = t.returnStatement(jsxElement);
        const arrowFunction = t.arrowFunctionExpression([], t.blockStatement([returnStatement]));
        const exportDeclaration = t.exportDefaultDeclaration(arrowFunction);
        return createMockAst([exportDeclaration]);
    }
    (0, bun_test_1.test)('should handle exactly one valid script in body as injected correctly', () => {
        const bodyWithScript = createScriptElement(constants_1.ONLOOK_PRELOAD_SCRIPT_SRC, 'body');
        const ast = createComponentWithJSX(bodyWithScript);
        const result = (0, src_1.scanForPreloadScript)(ast);
        (0, bun_test_1.expect)(result.scriptCount).toBe(1);
        (0, bun_test_1.expect)(result.deprecatedScriptCount).toBe(0);
        (0, bun_test_1.expect)(result.injectedCorrectly).toBe(true);
    });
    (0, bun_test_1.test)('should handle valid script outside body as not injected correctly', () => {
        const scriptElement = createScriptElement(constants_1.ONLOOK_PRELOAD_SCRIPT_SRC);
        const divWithScript = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('div'), [], false), t.jsxClosingElement(t.jsxIdentifier('div')), [scriptElement], false);
        const ast = createComponentWithJSX(divWithScript);
        const result = (0, src_1.scanForPreloadScript)(ast);
        (0, bun_test_1.expect)(result.scriptCount).toBe(1);
        (0, bun_test_1.expect)(result.deprecatedScriptCount).toBe(0);
        (0, bun_test_1.expect)(result.injectedCorrectly).toBe(false);
    });
    (0, bun_test_1.test)('should ignore Script elements without src attribute', () => {
        const scriptWithoutSrc = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('Script'), [t.jsxAttribute(t.jsxIdentifier('strategy'), t.stringLiteral('afterInteractive'))], false), t.jsxClosingElement(t.jsxIdentifier('Script')), [], false);
        const ast = createComponentWithJSX(scriptWithoutSrc);
        const result = (0, src_1.scanForPreloadScript)(ast);
        (0, bun_test_1.expect)(result.scriptCount).toBe(0);
        (0, bun_test_1.expect)(result.deprecatedScriptCount).toBe(0);
        (0, bun_test_1.expect)(result.injectedCorrectly).toBe(false);
    });
    (0, bun_test_1.test)('should ignore Script elements with non-string src attribute', () => {
        const scriptWithExpressionSrc = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('Script'), [
            t.jsxAttribute(t.jsxIdentifier('src'), t.jsxExpressionContainer(t.identifier('scriptSrc'))),
        ], false), t.jsxClosingElement(t.jsxIdentifier('Script')), [], false);
        const ast = createComponentWithJSX(scriptWithExpressionSrc);
        const result = (0, src_1.scanForPreloadScript)(ast);
        (0, bun_test_1.expect)(result.scriptCount).toBe(0);
        (0, bun_test_1.expect)(result.deprecatedScriptCount).toBe(0);
        (0, bun_test_1.expect)(result.injectedCorrectly).toBe(false);
    });
});
//# sourceMappingURL=preload.test.js.map