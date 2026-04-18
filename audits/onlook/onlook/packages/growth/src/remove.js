"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBuiltWithScriptFromLayout = removeBuiltWithScriptFromLayout;
exports.removeBuiltWithScript = removeBuiltWithScript;
const parser_1 = require("@onlook/parser");
const helpers_1 = require("./helpers");
/**
 * Removes the Built with Onlook script from a Next.js layout file
 * @param projectPath Path to the project root
 * @param fileOps File operations interface
 */
async function removeBuiltWithScriptFromLayout(projectPath, fileOps) {
    try {
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
            throw new Error(`Failed to parse file ${layoutPath}`);
        }
        let scriptImportRemoved = false;
        let scriptElementRemoved = false;
        let hasOtherScriptElements = false;
        // Remove Script component from the body
        (0, parser_1.traverse)(ast, {
            JSXElement(path) {
                // Check if this is the body element
                const openingElement = path.node.openingElement;
                if (parser_1.t.isJSXIdentifier(openingElement.name) &&
                    openingElement.name.name.toLowerCase() === 'body') {
                    // Find and remove the Script element for builtwith.js
                    const children = path.node.children;
                    // Remove all <Script src="/builtwith.js" ... /> elements
                    for (let i = 0; i < children.length;) {
                        const child = children[i];
                        if (parser_1.t.isJSXElement(child) &&
                            parser_1.t.isJSXIdentifier(child.openingElement.name) &&
                            child.openingElement.name.name === 'Script') {
                            // Check if this is the builtwith.js script
                            const hasSrcAttr = child.openingElement.attributes.some((attr) => parser_1.t.isJSXAttribute(attr) &&
                                parser_1.t.isJSXIdentifier(attr.name) &&
                                attr.name.name === 'src' &&
                                parser_1.t.isStringLiteral(attr.value) &&
                                attr.value.value === '/builtwith.js');
                            if (hasSrcAttr) {
                                // Remove this Script element
                                children.splice(i, 1);
                                // Also remove whitespace/newline nodes before/after if they exist
                                if (i > 0 &&
                                    parser_1.t.isJSXText(children[i - 1]) &&
                                    children[i - 1].value.trim() === '') {
                                    children.splice(i - 1, 1);
                                    i--;
                                }
                                if (i < children.length &&
                                    parser_1.t.isJSXText(children[i]) &&
                                    children[i].value.trim() === '') {
                                    children.splice(i, 1);
                                }
                                scriptElementRemoved = true;
                                continue; // Don't increment i, as we just removed an element
                            }
                        }
                        i++;
                    }
                }
            },
        });
        // After removal, check if any <Script> elements remain in the entire AST
        hasOtherScriptElements = false;
        (0, parser_1.traverse)(ast, {
            JSXElement(path) {
                if (parser_1.t.isJSXIdentifier(path.node.openingElement.name) &&
                    path.node.openingElement.name.name === 'Script') {
                    hasOtherScriptElements = true;
                    path.stop();
                }
            },
        });
        // Only remove the Script import if there are no other Script elements
        if (scriptElementRemoved && !hasOtherScriptElements) {
            (0, parser_1.traverse)(ast, {
                ImportDeclaration(path) {
                    if (path.node.source.value === 'next/script' &&
                        path.node.specifiers.some((specifier) => parser_1.t.isImportDefaultSpecifier(specifier) &&
                            parser_1.t.isIdentifier(specifier.local) &&
                            specifier.local.name === 'Script')) {
                        path.remove();
                        scriptImportRemoved = true;
                    }
                },
            });
        }
        if (scriptElementRemoved || scriptImportRemoved) {
            // Generate the modified code
            const output = (0, parser_1.generate)(ast, {}, layoutContent);
            // Write the modified code back to the file
            const writeSuccess = await fileOps.writeFile(layoutPath, output.code);
            if (writeSuccess) {
                console.log('Successfully removed Script from layout.tsx');
                return true;
            }
            else {
                console.error('Failed to write modified layout.tsx');
                return false;
            }
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
 * @param fileOps File operations interface
 */
async function removeBuiltWithScript(projectPath, fileOps) {
    try {
        // Path to the builtwith.js script in the project's public folder
        const scriptPath = `${projectPath}/public/builtwith.js`;
        // Check if the file exists
        const fileExists = await fileOps.fileExists(scriptPath);
        if (fileExists) {
            const deleteSuccess = await fileOps.delete(scriptPath, true);
            if (deleteSuccess) {
                console.log('Successfully removed builtwith.js from public folder');
                return true;
            }
            else {
                console.error('Failed to delete builtwith.js from public folder');
                return false;
            }
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