"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateImageReferences = updateImageReferences;
const parser_1 = require("@onlook/parser");
const path_1 = __importDefault(require("path"));
/**
 * Update all image references in a file from oldPath to newPath
 * Uses AST manipulation to update src attributes, className (including Tailwind), and style props
 */
async function updateImageReferences(content, oldImagePath, newImagePath) {
    const ast = (0, parser_1.getAstFromContent)(content);
    if (!ast) {
        return content;
    }
    const oldFileName = path_1.default.basename(oldImagePath);
    const newFileName = path_1.default.basename(newImagePath);
    let hasChanges = false;
    (0, parser_1.traverse)(ast, {
        JSXOpeningElement(nodePath) {
            const { node } = nodePath;
            for (const attr of node.attributes) {
                if (!parser_1.t.isJSXAttribute(attr) || !parser_1.t.isJSXIdentifier(attr.name)) {
                    continue;
                }
                const attrName = attr.name.name;
                // Update src attribute
                if (attrName === 'src' && parser_1.t.isStringLiteral(attr.value)) {
                    const srcValue = attr.value.value;
                    if (srcValue.includes(oldImagePath)) {
                        attr.value.value = srcValue.replace(oldImagePath, newImagePath);
                        hasChanges = true;
                    }
                    else if (srcValue.includes(oldFileName)) {
                        attr.value.value = srcValue.replace(oldFileName, newFileName);
                        hasChanges = true;
                    }
                }
                // Update className (handles Tailwind and other class-based images)
                if (attrName === 'className' && parser_1.t.isStringLiteral(attr.value)) {
                    const className = attr.value.value;
                    // Check if contains image filename before processing
                    if (className.includes(oldFileName) || className.includes(oldImagePath)) {
                        const updated = replaceImageInString(className, oldImagePath, newImagePath, oldFileName, newFileName);
                        if (updated !== className) {
                            attr.value.value = updated;
                            hasChanges = true;
                        }
                    }
                }
                // Update className in template literals
                if (attrName === 'className' && parser_1.t.isJSXExpressionContainer(attr.value)) {
                    const expression = attr.value.expression;
                    if (parser_1.t.isTemplateLiteral(expression)) {
                        for (const quasi of expression.quasis) {
                            const rawValue = quasi.value.raw;
                            if (rawValue.includes(oldImagePath)) {
                                quasi.value.raw = rawValue.replace(oldImagePath, newImagePath);
                                quasi.value.cooked = quasi.value.raw;
                                hasChanges = true;
                            }
                            else if (rawValue.includes(oldFileName)) {
                                quasi.value.raw = rawValue.replace(oldFileName, newFileName);
                                quasi.value.cooked = quasi.value.raw;
                                hasChanges = true;
                            }
                        }
                    }
                }
                // Update style prop backgroundImage
                if (attrName === 'style' && parser_1.t.isJSXExpressionContainer(attr.value)) {
                    const expression = attr.value.expression;
                    if (parser_1.t.isObjectExpression(expression)) {
                        for (const prop of expression.properties) {
                            if (parser_1.t.isObjectProperty(prop) &&
                                parser_1.t.isIdentifier(prop.key) &&
                                prop.key.name === 'backgroundImage' &&
                                parser_1.t.isStringLiteral(prop.value)) {
                                const bgValue = prop.value.value;
                                if (bgValue.includes(oldImagePath)) {
                                    prop.value.value = bgValue.replace(oldImagePath, newImagePath);
                                    hasChanges = true;
                                }
                                else if (bgValue.includes(oldFileName)) {
                                    prop.value.value = bgValue.replace(oldFileName, newFileName);
                                    hasChanges = true;
                                }
                            }
                        }
                    }
                }
            }
        },
    });
    if (!hasChanges) {
        return content;
    }
    return await (0, parser_1.getContentFromAst)(ast, content);
}
/**
 * Replace image paths in a string (used for className updates)
 * Handles both full paths and filenames, avoiding double replacement
 */
function replaceImageInString(str, oldPath, newPath, oldFilename, newFilename) {
    let result = str;
    // Replace full path first if it exists
    if (result.includes(oldPath)) {
        result = result.replace(new RegExp(escapeRegExp(oldPath), 'g'), newPath);
    }
    else if (result.includes(oldFilename)) {
        // Only replace filename if full path wasn't found (to avoid double replacement)
        result = result.replace(new RegExp(escapeRegExp(oldFilename), 'g'), newFilename);
    }
    return result;
}
/**
 * Escape special regex characters in a string
 */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=image-references.js.map