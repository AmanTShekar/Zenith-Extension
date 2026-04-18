"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@onlook/utility");
const lodash_1 = require("lodash");
describe('toNormalCase', () => {
    it('should handle empty string', () => {
        expect((0, utility_1.toNormalCase)('')).toBe('');
    });
    it('should handle null or undefined', () => {
        expect((0, utility_1.toNormalCase)(null)).toBe('');
        expect((0, utility_1.toNormalCase)(undefined)).toBe('');
    });
    it('should convert camelCase to normal case', () => {
        expect((0, utility_1.toNormalCase)('camelCase')).toBe('Camel Case');
        expect((0, utility_1.toNormalCase)('thisIsATest')).toBe('This Is A Test');
    });
    it('should convert PascalCase to normal case', () => {
        expect((0, utility_1.toNormalCase)('PascalCase')).toBe('Pascal Case');
        expect((0, utility_1.toNormalCase)('ThisIsATest')).toBe('This Is A Test');
    });
    it('should handle single word', () => {
        expect((0, utility_1.toNormalCase)('test')).toBe('Test');
        expect((0, utility_1.toNormalCase)('Test')).toBe('Test');
    });
    it('should handle already normal case', () => {
        expect((0, utility_1.toNormalCase)('Normal Case')).toBe('Normal Case');
    });
    it('should handle mixed case', () => {
        expect((0, utility_1.toNormalCase)('mixedCaseWithPascal')).toBe('Mixed Case With Pascal');
    });
});
describe('camelCase', () => {
    it('should handle empty string', () => {
        expect((0, lodash_1.camelCase)('')).toBe('');
    });
    it('should handle null or undefined', () => {
        expect((0, lodash_1.camelCase)(null)).toBe('');
        expect((0, lodash_1.camelCase)(undefined)).toBe('');
    });
    it('should convert normal case to camelCase', () => {
        expect((0, lodash_1.camelCase)('normal case')).toBe('normalCase');
        expect((0, lodash_1.camelCase)('this is a test')).toBe('thisIsATest');
    });
    it('should convert PascalCase to camelCase', () => {
        expect((0, lodash_1.camelCase)('PascalCase')).toBe('pascalCase');
        expect((0, lodash_1.camelCase)('ThisIsATest')).toBe('thisIsATest');
    });
    it('should handle single word', () => {
        expect((0, lodash_1.camelCase)('test')).toBe('test');
        expect((0, lodash_1.camelCase)('Test')).toBe('test');
    });
    it('should handle already camelCase', () => {
        expect((0, lodash_1.camelCase)('camelCase')).toBe('camelCase');
    });
    it('should handle mixed separators', () => {
        expect((0, lodash_1.camelCase)('mixed-case_with spaces')).toBe('mixedCaseWithSpaces');
        expect((0, lodash_1.camelCase)('mixed_case-with spaces')).toBe('mixedCaseWithSpaces');
    });
    it('should handle numbers', () => {
        expect((0, lodash_1.camelCase)('test 123')).toBe('test123');
        expect((0, lodash_1.camelCase)('123 test')).toBe('123Test');
    });
    it('should handle multiple consecutive separators', () => {
        expect((0, lodash_1.camelCase)('test--case')).toBe('testCase');
        expect((0, lodash_1.camelCase)('test__case')).toBe('testCase');
        expect((0, lodash_1.camelCase)('test  case')).toBe('testCase');
    });
    it('should convert UPPERCASE to camelCase', () => {
        expect((0, lodash_1.camelCase)('UPPERCASE')).toBe('uppercase');
        expect((0, lodash_1.camelCase)('MULTIPLE WORDS')).toBe('multipleWords');
    });
    it('should convert Capitalized to camelCase', () => {
        expect((0, lodash_1.camelCase)('Capitalized')).toBe('capitalized');
        expect((0, lodash_1.camelCase)('Capitalized Words')).toBe('capitalizedWords');
    });
});
//# sourceMappingURL=helpers.test.js.map