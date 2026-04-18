"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectBuiltWithScript = injectBuiltWithScript;
exports.addBuiltWithScript = addBuiltWithScript;
const parser_1 = require("@onlook/parser");
const helpers_1 = require("./helpers");
const script_1 = require("./script");
/**
 * Injects the Built with Onlook script into a Next.js layout file
 * @param projectPath Path to the project root
 * @param fileOps File operations interface
 */
async function injectBuiltWithScript(projectPath, fileOps) {
    try {
        // Find the layout file - check both app/ and src/app/ directories
        const layoutPath = await (0, helpers_1.getLayoutPath)(projectPath, fileOps.fileExists);
        if (!layoutPath) {
            console.error('Layout file not found');
            return false;
        }
        // Read the layout file
        const layoutContent = await fileOps.readFile(layoutPath);
        if (!layoutContent) {
            console.error('Failed to read layout file');
            return false;
        }
        // Parse the layout file
        const ast = (0, parser_1.getAstFromContent)(layoutContent);
        if (!ast) {
            throw new Error(`Failed to parse file in injectBuiltWithScript`);
        }
        let hasScriptImport = false;
        let scriptAdded = false;
        // Check if Script is already imported
        (0, parser_1.traverse)(ast, {
            ImportDeclaration(path) {
                if (path.node.source.value === 'next/script') {
                    hasScriptImport = true;
                }
            },
        });
        // Add Script import if it doesn't exist
        if (!hasScriptImport) {
            const scriptImport = parser_1.t.importDeclaration([parser_1.t.importDefaultSpecifier(parser_1.t.identifier('Script'))], parser_1.t.stringLiteral('next/script'));
            // Find the position to insert the import
            let insertIndex = 0;
            for (let i = 0; i < ast.program.body.length; i++) {
                const node = ast.program.body[i];
                if (parser_1.t.isImportDeclaration(node)) {
                    insertIndex = i + 1;
                }
                else {
                    break;
                }
            }
            ast.program.body.splice(insertIndex, 0, scriptImport);
        }
        // Add Script component to the body
        (0, parser_1.traverse)(ast, {
            JSXElement(path) {
                // Check if this is the body element
                const openingElement = path.node.openingElement;
                if (parser_1.t.isJSXIdentifier(openingElement.name) &&
                    openingElement.name.name.toLowerCase() === 'body') {
                    // Check if Script is already added
                    const hasScript = path.node.children.some((child) => parser_1.t.isJSXElement(child) &&
                        parser_1.t.isJSXIdentifier(child.openingElement.name) &&
                        child.openingElement.name.name === 'Script' &&
                        child.openingElement.attributes.some((attr) => parser_1.t.isJSXAttribute(attr) &&
                            parser_1.t.isJSXIdentifier(attr.name) &&
                            attr.name.name === 'src' &&
                            parser_1.t.isStringLiteral(attr.value) &&
                            attr.value.value === '/builtwith.js'));
                    if (!hasScript) {
                        // Create Script element
                        const scriptElement = parser_1.t.jsxElement(parser_1.t.jsxOpeningElement(parser_1.t.jsxIdentifier('Script'), [
                            parser_1.t.jsxAttribute(parser_1.t.jsxIdentifier('src'), parser_1.t.stringLiteral('/builtwith.js')),
                            parser_1.t.jsxAttribute(parser_1.t.jsxIdentifier('strategy'), parser_1.t.stringLiteral('afterInteractive')),
                        ], true), null, [], true);
                        // Add Script element after children
                        path.node.children.push(parser_1.t.jsxText('\n                '));
                        path.node.children.push(scriptElement);
                        path.node.children.push(parser_1.t.jsxText('\n            '));
                        scriptAdded = true;
                    }
                }
            },
        });
        if (scriptAdded) {
            // Generate the modified code
            const output = (0, parser_1.generate)(ast, {}, layoutContent);
            // Write the modified code back to the file
            const writeSuccess = await fileOps.writeFile(layoutPath, output.code);
            if (writeSuccess) {
                console.log('Successfully added Script to layout.tsx');
                return true;
            }
            else {
                console.error('Failed to write modified layout.tsx');
                return false;
            }
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
 * @param fileOps File operations interface
 */
async function addBuiltWithScript(projectPath, fileOps) {
    try {
        // Path to the destination in the project's public folder
        const destPath = `${projectPath}/public/builtwith.js`;
        // Write the script content directly
        const writeSuccess = await fileOps.writeFile(destPath, script_1.builtWithScript);
        if (writeSuccess) {
            console.log('Successfully added builtwith.js to public folder');
            return true;
        }
        else {
            console.error('Failed to write builtwith.js to public folder');
            return false;
        }
    }
    catch (error) {
        console.error('Error adding builtwith.js to public folder:', error);
        return false;
    }
}
//# sourceMappingURL=inject.js.map