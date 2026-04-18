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
exports.injectBuiltWithScript = injectBuiltWithScript;
exports.addBuiltWithScript = addBuiltWithScript;
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const script_1 = require("./script");
/**
 * Injects the Built with Onlook script into a Next.js layout file
 * @param projectPath Path to the project root
 */
async function injectBuiltWithScript(projectPath) {
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
        let hasScriptImport = false;
        let scriptAdded = false;
        // Check if Script is already imported
        (0, traverse_1.default)(ast, {
            ImportDeclaration(path) {
                if (path.node.source.value === 'next/script') {
                    hasScriptImport = true;
                }
            },
        });
        // Add Script import if it doesn't exist
        if (!hasScriptImport) {
            const scriptImport = t.importDeclaration([t.importDefaultSpecifier(t.identifier('Script'))], t.stringLiteral('next/script'));
            // Find the position to insert the import
            let insertIndex = 0;
            for (let i = 0; i < ast.program.body.length; i++) {
                const node = ast.program.body[i];
                if (t.isImportDeclaration(node)) {
                    insertIndex = i + 1;
                }
                else {
                    break;
                }
            }
            ast.program.body.splice(insertIndex, 0, scriptImport);
        }
        // Add Script component to the body
        (0, traverse_1.default)(ast, {
            JSXElement(path) {
                // Check if this is the body element
                const openingElement = path.node.openingElement;
                if (t.isJSXIdentifier(openingElement.name) &&
                    openingElement.name.name.toLowerCase() === 'body') {
                    // Check if Script is already added
                    const hasScript = path.node.children.some((child) => t.isJSXElement(child) &&
                        t.isJSXIdentifier(child.openingElement.name) &&
                        child.openingElement.name.name === 'Script' &&
                        child.openingElement.attributes.some((attr) => t.isJSXAttribute(attr) &&
                            t.isJSXIdentifier(attr.name) &&
                            attr.name.name === 'src' &&
                            t.isStringLiteral(attr.value) &&
                            attr.value.value === '/builtwith.js'));
                    if (!hasScript) {
                        // Create Script element
                        const scriptElement = t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier('Script'), [
                            t.jsxAttribute(t.jsxIdentifier('src'), t.stringLiteral('/builtwith.js')),
                            t.jsxAttribute(t.jsxIdentifier('strategy'), t.stringLiteral('afterInteractive')),
                        ], true), null, [], true);
                        // Add Script element after children
                        path.node.children.push(t.jsxText('\n                '));
                        path.node.children.push(scriptElement);
                        path.node.children.push(t.jsxText('\n            '));
                        scriptAdded = true;
                    }
                }
            },
        });
        if (scriptAdded) {
            // Generate the modified code
            const output = (0, generator_1.default)(ast, {}, layoutContent);
            // Write the modified code back to the file
            fs.writeFileSync(layoutPath, output.code, 'utf8');
            console.log('Successfully added Script to layout.tsx');
            return true;
        }
        else {
            console.log('Script already exists in layout.tsx or body tag not found');
            return false;
        }
    }
    catch (error) {
        console.error('Error injecting Script into layout.tsx:', error);
        return false;
    }
}
/**
 * Copies the builtwith.js script to the project's public folder
 * @param projectPath Path to the project root
 */
async function addBuiltWithScript(projectPath) {
    try {
        // Ensure the public directory exists
        const publicDir = path.join(projectPath, 'public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        // Path to the destination in the project's public folder
        const destPath = path.join(publicDir, 'builtwith.js');
        // Read the content and write it directly
        fs.writeFileSync(destPath, script_1.builtWithScript, 'utf8');
        console.log('Successfully added builtwith.js to public folder');
        return true;
    }
    catch (error) {
        console.error('Error adding builtwith.js to public folder:', error);
        return false;
    }
}
//# sourceMappingURL=inject.js.map