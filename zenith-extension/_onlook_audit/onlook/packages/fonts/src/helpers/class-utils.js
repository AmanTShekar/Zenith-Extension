"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFontClass = findFontClass;
exports.filterFontClasses = filterFontClasses;
exports.createStringLiteralWithFont = createStringLiteralWithFont;
exports.createTemplateLiteralWithFont = createTemplateLiteralWithFont;
exports.removeFontsFromClassName = removeFontsFromClassName;
exports.updateClassNameWithFontVar = updateClassNameWithFontVar;
exports.updateStringLiteralClassNameWithFont = updateStringLiteralClassNameWithFont;
exports.updateJSXExpressionClassNameWithFont = updateJSXExpressionClassNameWithFont;
exports.updateTemplateLiteralWithFontClass = updateTemplateLiteralWithFontClass;
const parser_1 = require("@onlook/parser");
const FONT_WEIGHT_REGEX = /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/;
/**
 * Helper function to find font class in a string of class names
 */
function findFontClass(classString) {
    if (!classString)
        return null;
    const fontClassMatch = /font-([a-zA-Z0-9_-]+)/.exec(classString);
    return fontClassMatch?.[1] ?? null;
}
/**
 * Filters out font-related classes from a className string, keeping only font weight classes
 */
function filterFontClasses(className) {
    return className.split(' ').filter((c) => !c.startsWith('font-') || FONT_WEIGHT_REGEX.exec(c));
}
/**
 * Helper function to create a string literal with a font class
 */
function createStringLiteralWithFont(fontClassName, originalClassName) {
    // Check if there's already a font class
    const classes = originalClassName.split(' ');
    const fontClassIndex = classes.findIndex((cls) => cls.startsWith('font-'));
    if (fontClassIndex >= 0) {
        classes[fontClassIndex] = fontClassName;
    }
    else {
        classes.unshift(fontClassName);
    }
    return parser_1.t.stringLiteral(classes.join(' ').trim());
}
/**
 * Helper function to create a template literal that includes a font variable
 */
function createTemplateLiteralWithFont(fontVarExpr, originalExpr) {
    if (parser_1.t.isStringLiteral(originalExpr)) {
        const quasis = [
            parser_1.t.templateElement({ raw: '', cooked: '' }, false),
            parser_1.t.templateElement({
                raw: ' ' + originalExpr.value,
                cooked: ' ' + originalExpr.value,
            }, true),
        ];
        return parser_1.t.templateLiteral(quasis, [fontVarExpr]);
    }
    else {
        const quasis = [
            parser_1.t.templateElement({ raw: '', cooked: '' }, false),
            parser_1.t.templateElement({ raw: ' ', cooked: ' ' }, false),
            parser_1.t.templateElement({ raw: '', cooked: '' }, true),
        ];
        return parser_1.t.templateLiteral(quasis, [fontVarExpr, originalExpr]);
    }
}
/**
 * Removes font variables and classes from a className attribute
 * @param classNameAttr The className attribute to modify
 * @param options Configuration options for font removal
 * @returns true if the attribute was modified
 */
function removeFontsFromClassName(classNameAttr, options) {
    if (!classNameAttr?.value) {
        return false;
    }
    try {
        if (parser_1.t.isStringLiteral(classNameAttr.value)) {
            return removeFontFromStringLiteral(classNameAttr, options);
        }
        if (!parser_1.t.isJSXExpressionContainer(classNameAttr.value)) {
            return false;
        }
        // Make sure expression is not null or undefined
        if (!classNameAttr.value.expression) {
            return false;
        }
        const expr = classNameAttr.value.expression;
        // Handle template literals
        if (parser_1.t.isTemplateLiteral(expr)) {
            const result = removeFontFromTemplateLiteral(expr, options);
            // If template literal has no expressions left, convert to string literal
            if (expr.expressions.length === 0) {
                const allText = expr.quasis.map((q) => q.value.raw || '').join('');
                const cleanedText = allText.replace(/\s+/g, ' ').trim();
                classNameAttr.value = parser_1.t.stringLiteral(cleanedText);
                return true;
            }
            return result;
        }
        if (parser_1.t.isMemberExpression(expr)) {
            try {
                if (!expr.property || !expr.object) {
                    return false;
                }
                if (parser_1.t.isIdentifier(expr.property) &&
                    (expr.property.name === 'className' || expr.property.name === 'variable')) {
                    if (options.fontIds && options.fontIds.length > 0) {
                        if (parser_1.t.isIdentifier(expr.object) &&
                            options.fontIds.includes(expr.object.name)) {
                            classNameAttr.value = parser_1.t.stringLiteral('');
                            return true;
                        }
                    }
                    else if (options.removeAll) {
                        classNameAttr.value = parser_1.t.stringLiteral('');
                        return true;
                    }
                }
            }
            catch (memberExprError) {
                console.error('Error processing member expression:', memberExprError);
                return false;
            }
        }
        return false;
    }
    catch (error) {
        console.error('Error in removeFontsFromClassName:', error);
        return false;
    }
}
/**
 * Helper to update className attribute value with font variable
 */
function updateClassNameWithFontVar(classNameAttr, fontName) {
    const fontVarExpr = parser_1.t.memberExpression(parser_1.t.identifier(fontName), parser_1.t.identifier('variable'));
    if (parser_1.t.isStringLiteral(classNameAttr.value)) {
        return updateStringLiteralClassNameWithFont(classNameAttr, fontVarExpr);
    }
    else if (parser_1.t.isJSXExpressionContainer(classNameAttr.value)) {
        return updateJSXExpressionClassNameWithFont(classNameAttr, fontVarExpr, fontName);
    }
    return false;
}
/**
 * Updates className attribute with font variable when it's a StringLiteral
 */
function updateStringLiteralClassNameWithFont(classNameAttr, fontVarExpr) {
    if (!parser_1.t.isStringLiteral(classNameAttr.value)) {
        return false;
    }
    if (classNameAttr.value.value === '') {
        classNameAttr.value = parser_1.t.jsxExpressionContainer(parser_1.t.templateLiteral([
            parser_1.t.templateElement({ raw: '', cooked: '' }, false),
            parser_1.t.templateElement({ raw: '', cooked: '' }, true),
        ], [fontVarExpr]));
    }
    else {
        classNameAttr.value = parser_1.t.jsxExpressionContainer(createTemplateLiteralWithFont(fontVarExpr, parser_1.t.stringLiteral(classNameAttr.value.value)));
    }
    return true;
}
/**
 * Updates className attribute with font variable when it's a JSXExpressionContainer
 */
function updateJSXExpressionClassNameWithFont(classNameAttr, fontVarExpr, fontName) {
    if (!parser_1.t.isJSXExpressionContainer(classNameAttr.value)) {
        return false;
    }
    const expr = classNameAttr.value.expression;
    if (parser_1.t.isTemplateLiteral(expr)) {
        const isFontAlreadyPresent = expr.expressions.some((e) => parser_1.t.isMemberExpression(e) &&
            parser_1.t.isIdentifier(e.object) &&
            e.object.name === fontName &&
            parser_1.t.isIdentifier(e.property) &&
            e.property.name === 'variable');
        if (isFontAlreadyPresent) {
            return false;
        }
        if (expr.expressions.length > 0) {
            // Add space to the last quasi if it exists
            const lastQuasi = expr.quasis[expr.quasis.length - 1];
            if (lastQuasi) {
                lastQuasi.value.raw = lastQuasi.value.raw + ' ';
                lastQuasi.value.cooked = lastQuasi.value.cooked + ' ';
            }
        }
        expr.expressions.push(fontVarExpr);
        // Add a new quasi if there are more expressions than quasis
        if (expr.quasis.length <= expr.expressions.length) {
            expr.quasis.push(parser_1.t.templateElement({ raw: '', cooked: '' }, true));
        }
        return true;
    }
    if (parser_1.t.isIdentifier(expr) || parser_1.t.isMemberExpression(expr)) {
        classNameAttr.value = parser_1.t.jsxExpressionContainer(createTemplateLiteralWithFont(fontVarExpr, expr));
        return true;
    }
    return false;
}
/**
 * Updates a template literal expression to prepend a font class name to the first quasi
 * @param expr The template literal expression to modify
 * @param fontClassName The font class name to prepend
 * @returns true if the expression was modified
 */
function updateTemplateLiteralWithFontClass(expr, fontClassName) {
    if (!parser_1.t.isTemplateLiteral(expr) || !expr.quasis || expr.quasis.length === 0) {
        return false;
    }
    const firstQuasi = expr.quasis[0];
    if (!firstQuasi) {
        return false;
    }
    const originalText = firstQuasi.value.raw || '';
    const filteredClasses = filterFontClasses(originalText.trim());
    const cleanedFilteredClasses = filteredClasses.filter((c) => c.trim() !== '');
    let newText = fontClassName;
    if (cleanedFilteredClasses.length > 0) {
        newText += ' ' + cleanedFilteredClasses.join(' ');
    }
    if (originalText.endsWith(' ') || (originalText.trim() === '' && expr.expressions.length > 0)) {
        newText += ' ';
    }
    const newFirstQuasi = parser_1.t.templateElement({
        raw: newText,
        cooked: newText,
    }, firstQuasi.tail);
    expr.quasis[0] = newFirstQuasi;
    return true;
}
function removeFontFromStringLiteral(classNameAttr, options) {
    if (!classNameAttr.value) {
        return false;
    }
    if (!parser_1.t.isStringLiteral(classNameAttr.value)) {
        return false;
    }
    const value = classNameAttr.value.value;
    let classes;
    if (options.fontIds && options.fontIds.length > 0) {
        // Remove only specific font classes
        const fontClassPatterns = options.fontIds.map((id) => `font-${id}\\b`).join('|');
        const fontClassRegex = new RegExp(fontClassPatterns, 'g');
        classes = value.split(' ').filter((c) => !fontClassRegex.test(c));
    }
    else if (options.removeAll) {
        // Remove all font classes
        classes = filterFontClasses(value);
    }
    else {
        // No removal requested
        return false;
    }
    classNameAttr.value = parser_1.t.stringLiteral(classes.join(' '));
    return true;
}
function removeFontFromTemplateLiteral(expr, options) {
    if (!expr.quasis || !expr.expressions)
        return false;
    try {
        // Filter expressions to keep (only process actual expressions, not TSTypes)
        const validExpressions = getValidExpressions(expr);
        const keptExpressions = filterExpressionsToKeep(validExpressions, options);
        if (keptExpressions.length === 0) {
            return convertToSimpleTemplate(expr, options);
        }
        // Rebuild template with kept expressions
        const newQuasis = [];
        const newExpressions = [];
        let accumulatedText = '';
        const addQuasi = (quasi) => {
            if (quasi) {
                accumulatedText += quasi.value.raw || '';
            }
        };
        for (let i = 0; i < expr.expressions.length; i++) {
            const e = expr.expressions[i];
            const quasis = expr.quasis[i];
            if (!parser_1.t.isExpression(e))
                continue;
            // Add the quasi before this expression
            addQuasi(quasis);
            if (!shouldRemoveExpression(e, options)) {
                let cleanedText = cleanFontClasses(accumulatedText, options);
                if (newQuasis.length === 0) {
                    cleanedText = cleanedText.replace(/^\s+/, '');
                }
                newQuasis.push(parser_1.t.templateElement({ raw: cleanedText, cooked: cleanedText }, false));
                newExpressions.push(e);
                accumulatedText = '';
            }
        }
        if (expr.quasis.length > expr.expressions.length) {
            const finalQuasi = expr.quasis[expr.quasis.length - 1];
            addQuasi(finalQuasi);
        }
        let finalText = cleanFontClasses(accumulatedText, options);
        finalText = finalText.replace(/\s+$/, '');
        newQuasis.push(parser_1.t.templateElement({ raw: finalText, cooked: finalText }, true));
        expr.expressions = newExpressions;
        expr.quasis = newQuasis;
        return true;
    }
    catch (error) {
        console.error('Error processing template literal:', error);
        return false;
    }
}
function cleanFontClasses(text, options) {
    if (options.fontIds?.length) {
        return cleanSpecificFontClasses(text, options.fontIds);
    }
    if (options.removeAll) {
        return cleanAllFontClasses(text);
    }
    return text;
}
function cleanSpecificFontClasses(text, fontIds) {
    const pattern = fontIds.map((id) => `font-${id}\\b`).join('|');
    return text.replace(new RegExp(pattern, 'g'), '');
}
function cleanAllFontClasses(text) {
    return text.replace(/font-\w+\b/g, (match) => (FONT_WEIGHT_REGEX.test(match) ? match : ''));
}
function filterExpressionsToKeep(expressions, options) {
    return expressions.filter((expr) => !shouldRemoveExpression(expr, options));
}
function shouldRemoveExpression(e, options) {
    if (!parser_1.t.isMemberExpression(e) || !e.object)
        return false;
    if (options.fontIds?.length) {
        return parser_1.t.isIdentifier(e.object) && options.fontIds.includes(e.object.name);
    }
    if (options.removeAll && e.property) {
        return parser_1.t.isIdentifier(e.property) && ['variable', 'className'].includes(e.property.name);
    }
    return false;
}
function getValidExpressions(expr) {
    return expr.expressions.filter((e) => parser_1.t.isExpression(e));
}
function convertToSimpleTemplate(expr, options) {
    const allText = expr.quasis.map((q) => q.value.raw || '').join('');
    const cleanedText = cleanFontClasses(allText, options).replace(/\s+/g, ' ').trim();
    expr.quasis = [parser_1.t.templateElement({ raw: cleanedText, cooked: cleanedText }, true)];
    expr.expressions = [];
    return true;
}
//# sourceMappingURL=class-utils.js.map