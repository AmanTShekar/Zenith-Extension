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
exports.removeBuiltWithScriptFromLayout = removeBuiltWithScriptFromLayout;
exports.removeBuiltWithScript = removeBuiltWithScript;
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Removes the Built with Onlook script from a Next.js layout file
 * @param projectPath Path to the project root
 */
async function removeBuiltWithScriptFromLayout(projectPath) {
    try {
        // Find the layout file
        const layoutPath = path.join(projectPath, 'app', 'layout.tsx');
        if (!fs.existsSync(layoutPath)) {
            console.error('Layout file not found at', layoutPath);
            return false;
        }
        // Read the layout file
        const layoutContent = fs.readFileSync(layoutPath, 'utf8');
        // Parse the layout file
        const ast = (0, parser_1.parse)(layoutContent, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        });
        let scriptImportRemoved = false;
        let scriptElementRemoved = false;
        let hasOtherScriptElements = false;
        // Remove Script component from the body
        (0, traverse_1.default)(ast, {
            JSXElement(path) {
                // Check if this is the body element
                const openingElement = path.node.openingElement;
                if (t.isJSXIdentifier(openingElement.name) &&
                    openingElement.name.name.toLowerCase() === 'body') {
                    // Find and remove the Script element for builtwith.js
                    const children = path.node.children;
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        if (t.isJSXElement(child) &&
                            t.isJSXIdentifier(child.openingElement.name) &&
                            child.openingElement.name.name === 'Script') {
                            // Check if this is the builtwith.js script
                            const hasSrcAttr = child.openingElement.attributes.some((attr) => t.isJSXAttribute(attr) &&
                                t.isJSXIdentifier(attr.name) &&
                                attr.name.name === 'src' &&
                                t.isStringLiteral(attr.value) &&
                                attr.value.value === '/builtwith.js');
                            if (hasSrcAttr) {
                                // Remove this Script element
                                children.splice(i, 1);
                                // Also remove whitespace/newline nodes before/after if they exist
                                if (i > 0 &&
                                    t.isJSXText(children[i - 1]) &&
                                    children[i - 1].value.trim() === '') {
                                    children.splice(i - 1, 1);
                                    i--;
                                }
                                if (i < children.length &&
                                    t.isJSXText(children[i]) &&
                                    children[i].value.trim() === '') {
                                    children.splice(i, 1);
                                }
                                scriptElementRemoved = true;
                            }
                            else {
                                // There's another Script element
                                hasOtherScriptElements = true;
                            }
                        }
                    }
                }
            },
        });
        // Only remove the Script import if there are no other Script elements
        if (scriptElementRemoved && !hasOtherScriptElements) {
            (0, traverse_1.default)(ast, {
                ImportDeclaration(path) {
                    if (path.node.source.value === 'next/script' &&
                        path.node.specifiers.some((specifier) => t.isImportDefaultSpecifier(specifier) &&
                            t.isIdentifier(specifier.local) &&
                            specifier.local.name === 'Script')) {
                        path.remove();
                        scriptImportRemoved = true;
                    }
                },
            });
        }
        if (scriptElementRemoved || scriptImportRemoved) {
            // Generate the modified code
            const output = (0, generator_1.default)(ast, {}, layoutContent);
            // Write the modified code back to the file
            fs.writeFileSync(layoutPath, output.code, 'utf8');
            console.log('Successfully removed Script from layout.tsx');
            return true;
        }
        else {
            console.log('No Script for builtwith.js found in layout.tsx');
            return false;
        }
    }
    catch (error) {
        console.error('Error removing Script from layout.tsx:', error);
        return false;
    }
}
/**
 * Removes the builtwith.js script from the project's public folder
 * @param projectPath Path to the project root
 */
async function removeBuiltWithScript(projectPath) {
    try {
        // Path to the builtwith.js script in the project's public folder
        const scriptPath = path.join(projectPath, 'public', 'builtwith.js');
        // Check if the file exists
        if (fs.existsSync(scriptPath)) {
            // Remove the file
            fs.unlinkSync(scriptPath);
            console.log('Successfully removed builtwith.js from public folder');
            return true;
        }
        else {
            console.log('builtwith.js not found in public folder');
            return false;
        }
    }
    catch (error) {
        console.error('Error removing builtwith.js from public folder:', error);
        return false;
    }
}
//# sourceMappingURL=remove.js.map