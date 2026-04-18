"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const parser_1 = require("@onlook/parser");
const src_1 = require("../src");
const test_utils_1 = require("./test-utils");
const __dirname = import.meta.dir;
async function processClassNameAttribute(inputContent, processor, fontName = 'inter') {
    const ast = (0, parser_1.parse)(inputContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
    });
    const fontVarExpr = parser_1.t.memberExpression(parser_1.t.identifier(fontName), parser_1.t.identifier('variable'));
    // Find the first JSX element with a className attribute
    let classNameAttr = null;
    const findClassNameAttr = (node) => {
        if (parser_1.t.isJSXElement(node)) {
            const attr = node.openingElement.attributes.find((attr) => parser_1.t.isJSXAttribute(attr) && attr.name?.name === 'className');
            if (attr && !classNameAttr) {
                classNameAttr = attr;
            }
        }
    };
    // Traverse the AST to find className attributes
    const traverse = (node) => {
        if (node && typeof node === 'object') {
            findClassNameAttr(node);
            for (const key in node) {
                if (Array.isArray(node[key])) {
                    node[key].forEach(traverse);
                }
                else if (typeof node[key] === 'object') {
                    traverse(node[key]);
                }
            }
        }
    };
    traverse(ast);
    if (classNameAttr) {
        const shouldSkipCodeGeneration = processor(classNameAttr, fontVarExpr, fontName);
        if (shouldSkipCodeGeneration) {
            return inputContent;
        }
    }
    const { code } = (0, parser_1.generate)(ast);
    return code;
}
async function processTestCase(inputContent, functionName, fontName = 'inter') {
    return processClassNameAttribute(inputContent, (classNameAttr, fontVarExpr, fontName) => {
        if (functionName === 'updateStringLiteralClassNameWithFont') {
            (0, src_1.updateStringLiteralClassNameWithFont)(classNameAttr, fontVarExpr);
        }
        else {
            (0, src_1.updateJSXExpressionClassNameWithFont)(classNameAttr, fontVarExpr, fontName);
        }
    }, fontName);
}
async function processRemoveFontsTestCase(inputContent, options) {
    return processClassNameAttribute(inputContent, (classNameAttr) => {
        (0, src_1.removeFontsFromClassName)(classNameAttr, options);
    });
}
async function processCreateTemplateLiteralTestCase(inputContent, fontName = 'inter') {
    return processClassNameAttribute(inputContent, (classNameAttr, fontVarExpr) => {
        if (!classNameAttr.value)
            return true;
        let originalExpr;
        const attrValue = classNameAttr.value;
        if (parser_1.t.isStringLiteral(attrValue)) {
            originalExpr = attrValue;
        }
        else if (parser_1.t.isJSXExpressionContainer(attrValue) &&
            parser_1.t.isExpression(attrValue.expression)) {
            originalExpr = attrValue.expression;
        }
        else {
            return true;
        }
        const newTemplateLiteral = (0, src_1.createTemplateLiteralWithFont)(fontVarExpr, originalExpr);
        classNameAttr.value = parser_1.t.jsxExpressionContainer(newTemplateLiteral);
    }, fontName);
}
(0, bun_test_1.describe)('removeFontsFromClassName', () => {
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/remove-fonts-classname'),
    }, async (inputContent, filePath) => {
        // Extract config from the same directory as the input file
        let options = {};
        if (filePath) {
            const caseDir = path_1.default.dirname(filePath);
            const files = fs_1.default.readdirSync(caseDir);
            const configFile = files.find((f) => f.startsWith('config.'));
            if (configFile) {
                const configPath = path_1.default.resolve(caseDir, configFile);
                const configContent = await Bun.file(configPath).text();
                options = JSON.parse(configContent);
            }
        }
        return processRemoveFontsTestCase(inputContent, options);
    });
});
(0, bun_test_1.describe)('createTemplateLiteralWithFont', () => {
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/create-template-literal-with-font'),
    }, (inputContent) => processCreateTemplateLiteralTestCase(inputContent));
});
(0, bun_test_1.describe)('updateStringLiteralClassNameWithFont', () => {
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/update-classname-with-font-var/string-literal-classname'),
    }, (inputContent) => processTestCase(inputContent, 'updateStringLiteralClassNameWithFont'));
});
(0, bun_test_1.describe)('updateJSXExpressionClassNameWithFont', () => {
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/update-classname-with-font-var/jsx-expression-classname'),
    }, (inputContent) => processTestCase(inputContent, 'updateJSXExpressionClassNameWithFont'));
});
(0, bun_test_1.describe)('createStringLiteralWithFont', () => {
    (0, bun_test_1.test)('should add font class when no font class exists', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', 'text-lg text-gray-900');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-inter text-lg text-gray-900');
    });
    (0, bun_test_1.test)('should replace existing font class when one exists', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-roboto', 'font-inter text-lg text-gray-900');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-roboto text-lg text-gray-900');
    });
    (0, bun_test_1.test)('should handle empty className string', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', '');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-inter');
    });
    (0, bun_test_1.test)('should handle className with only whitespace', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', '   ');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-inter');
    });
    (0, bun_test_1.test)('should handle className with multiple spaces between classes', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', 'text-lg   text-gray-900');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-inter text-lg   text-gray-900');
    });
    (0, bun_test_1.test)('should handle font class that starts with font- but is not at the beginning', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', 'text-lg font-bold text-gray-900');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('text-lg font-inter text-gray-900');
    });
    (0, bun_test_1.test)('should handle complex className with various font-related classes', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', 'font-sans font-bold text-lg text-gray-900 hover:text-black');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-inter font-bold text-lg text-gray-900 hover:text-black');
    });
    (0, bun_test_1.test)('should handle className that ends with font class', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', 'text-lg font-sans');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('text-lg font-inter');
    });
    (0, bun_test_1.test)('should handle className with only a font class', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', 'font-sans');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-inter');
    });
    (0, bun_test_1.test)('should handle className with leading and trailing spaces', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', '  text-lg text-gray-900  ');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-inter   text-lg text-gray-900');
    });
    (0, bun_test_1.test)('should handle multiple font classes and replace only the first one', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', 'font-sans font-bold font-extrabold text-lg');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('font-inter font-bold font-extrabold text-lg');
    });
    (0, bun_test_1.test)('should handle font class with numbers and special characters', () => {
        const result = (0, src_1.createStringLiteralWithFont)('font-inter', 'text-lg font-roboto-400 text-gray-900');
        (0, bun_test_1.expect)(result.type).toBe('StringLiteral');
        (0, bun_test_1.expect)(result.value).toBe('text-lg font-inter text-gray-900');
    });
});
(0, bun_test_1.describe)('updateTemplateLiteralWithFontClass', () => {
    (0, test_utils_1.runDataDrivenTests)({
        casesDir: path_1.default.resolve(__dirname, 'data/update-template-literal-with-font-class'),
    }, (inputContent) => processClassNameAttribute(inputContent, (classNameAttr) => {
        const fontClassName = 'font-inter';
        if (parser_1.t.isJSXExpressionContainer(classNameAttr.value)) {
            const expr = classNameAttr.value.expression;
            if (parser_1.t.isTemplateLiteral(expr)) {
                const result = (0, src_1.updateTemplateLiteralWithFontClass)(expr, fontClassName);
                if (!result) {
                    console.warn('Failed to update template literal with font class');
                }
            }
        }
    }));
});
//# sourceMappingURL=class-utils.test.js.map