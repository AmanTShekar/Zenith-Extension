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
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("@babel/types"));
const utils_1 = require("../electron/main/assets/fonts/utils");
describe('removeFontsFromClassName', () => {
    describe('string literal className', () => {
        it('should remove all font classes when removeAll is true', () => {
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('font-inter text-lg font-bold'));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { removeAll: true });
            expect(result).toBe(true);
            expect(t.isStringLiteral(classNameAttr.value)).toBe(true);
            const stringValue = classNameAttr.value;
            expect(stringValue.value).toBe('text-lg font-bold');
        });
        it('should remove specific font class when fontId is provided', () => {
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('font-inter text-lg font-roboto'));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { fontIds: ['inter'] });
            expect(result).toBe(true);
            expect(t.isStringLiteral(classNameAttr.value)).toBe(true);
            const stringValue = classNameAttr.value;
            expect(stringValue.value).toBe('text-lg font-roboto');
        });
    });
    describe('template literal className', () => {
        it('should remove font variable expressions when removeAll is true', () => {
            const templateLiteral = t.templateLiteral([
                t.templateElement({ raw: 'text-lg ', cooked: 'text-lg ' }, false),
                t.templateElement({ raw: ' font-bold', cooked: ' font-bold' }, true),
            ], [t.memberExpression(t.identifier('inter'), t.identifier('variable'))]);
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(templateLiteral));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { removeAll: true });
            expect(result).toBe(true);
            expect(t.isStringLiteral(classNameAttr.value)).toBe(true);
            const stringValue = classNameAttr.value;
            expect(stringValue.value).toBe('text-lg font-bold');
        });
        it('should remove specific font variable expression when fontId is provided', () => {
            const templateLiteral = t.templateLiteral([
                t.templateElement({ raw: 'text-lg ', cooked: 'text-lg ' }, false),
                t.templateElement({ raw: ' ', cooked: ' ' }, false),
                t.templateElement({ raw: ' font-bold', cooked: ' font-bold' }, true),
            ], [
                t.memberExpression(t.identifier('inter'), t.identifier('variable')),
                t.memberExpression(t.identifier('roboto'), t.identifier('variable')),
            ]);
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(templateLiteral));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { fontIds: ['inter'] });
            expect(result).toBe(true);
            expect(t.isJSXExpressionContainer(classNameAttr.value)).toBe(true);
            const exprContainer = classNameAttr.value;
            const expr = exprContainer.expression;
            expect(t.isTemplateLiteral(expr)).toBe(true);
            const templateExpr = expr;
            expect(templateExpr.expressions.length).toBe(1);
            const memberExpr = templateExpr.expressions[0];
            const obj = memberExpr.object;
            expect(obj.name).toBe('roboto');
        });
        it('should handle complex template literal with multiple fonts and static class', () => {
            const templateLiteral = t.templateLiteral([
                t.templateElement({ raw: 'font-arOneSans ', cooked: 'font-arOneSans ' }, false),
                t.templateElement({ raw: ' ', cooked: ' ' }, false),
                t.templateElement({ raw: ' ', cooked: ' ' }, false),
                t.templateElement({ raw: '', cooked: '' }, true),
            ], [
                t.memberExpression(t.identifier('arOneSans'), t.identifier('variable')),
                t.memberExpression(t.identifier('acme'), t.identifier('variable')),
                t.memberExpression(t.identifier('actor'), t.identifier('variable')),
            ]);
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(templateLiteral));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { fontIds: ['arOneSans'] });
            expect(result).toBe(true);
            expect(t.isJSXExpressionContainer(classNameAttr.value)).toBe(true);
            const exprContainer = classNameAttr.value;
            const expr = exprContainer.expression;
            expect(t.isTemplateLiteral(expr)).toBe(true);
            const templateExpr = expr;
            // Should have removed the arOneSans variable but kept the others
            expect(templateExpr.expressions.length).toBe(2);
            // Check that the static 'font-arOneSans' class was removed
            expect(templateExpr.quasis[0].value.raw).not.toContain('font-arOneSans');
            // Check that the remaining expressions are for acme and actor
            const firstExpr = templateExpr.expressions[0];
            const firstObj = firstExpr.object;
            expect(firstObj.name).toBe('acme');
            const secondExpr = templateExpr.expressions[1];
            const secondObj = secondExpr.object;
            expect(secondObj.name).toBe('actor');
        });
    });
    describe('member expression className', () => {
        it('should remove font member expression when removeAll is true', () => {
            const memberExpr = t.memberExpression(t.identifier('inter'), t.identifier('className'));
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(memberExpr));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { removeAll: true });
            expect(result).toBe(true);
        });
        it('should remove specific font member expression when fontId is provided', () => {
            const memberExpr = t.memberExpression(t.identifier('inter'), t.identifier('className'));
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(memberExpr));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { fontIds: ['inter'] });
            expect(result).toBe(true);
        });
        it('should not remove font member expression when fontId does not match', () => {
            const memberExpr = t.memberExpression(t.identifier('inter'), t.identifier('className'));
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(memberExpr));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { fontIds: ['roboto'] });
            expect(result).toBe(false);
        });
    });
    describe('edge cases', () => {
        it('should handle non-string literal and non-expression container values', () => {
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.jsxExpressionContainer(t.nullLiteral()));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { removeAll: true });
            expect(result).toBe(false);
        });
        it('should handle empty className', () => {
            const classNameAttr = t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(''));
            const result = (0, utils_1.removeFontsFromClassName)(classNameAttr, { removeAll: true });
            expect(result).toBe(true);
            expect(t.isStringLiteral(classNameAttr.value)).toBe(true);
            const stringValue = classNameAttr.value;
            expect(stringValue.value).toBe('');
        });
    });
});
//# sourceMappingURL=babel.test.js.map