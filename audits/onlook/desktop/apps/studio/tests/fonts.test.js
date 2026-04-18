"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("@onlook/utility");
describe('Font Utilities', () => {
    describe('extractFontParts', () => {
        it('should extract font parts from various file formats', () => {
            expect((0, utility_1.extractFontParts)('Roboto.ttf')).toEqual({
                family: 'Roboto',
                weight: '400',
                style: 'normal',
            });
            expect((0, utility_1.extractFontParts)('OpenSans.woff2')).toEqual({
                family: 'Open Sans',
                weight: '400',
                style: 'normal',
            });
            expect((0, utility_1.extractFontParts)('Montserrat-Regular.otf')).toEqual({
                family: 'Montserrat',
                weight: '400',
                style: 'normal',
            });
        });
        it('should handle weight indicators', () => {
            expect((0, utility_1.extractFontParts)('Roboto-Bold.ttf')).toEqual({
                family: 'Roboto',
                weight: '700',
                style: 'normal',
            });
            expect((0, utility_1.extractFontParts)('OpenSans-ExtraLight.woff2')).toEqual({
                family: 'Open Sans',
                weight: '200',
                style: 'normal',
            });
            expect((0, utility_1.extractFontParts)('Montserrat-BlackItalic.otf')).toEqual({
                family: 'Montserrat',
                weight: '900',
                style: 'italic',
            });
        });
        it('should handle numeric weights', () => {
            expect((0, utility_1.extractFontParts)('Roboto-700.ttf')).toEqual({
                family: 'Roboto',
                weight: '700',
                style: 'normal',
            });
            expect((0, utility_1.extractFontParts)('OpenSans-300wt.woff2')).toEqual({
                family: 'Open Sans',
                weight: '300',
                style: 'normal',
            });
            expect((0, utility_1.extractFontParts)('Montserrat-400weight.otf')).toEqual({
                family: 'Montserrat',
                weight: '400',
                style: 'normal',
            });
        });
        it('should handle style indicators', () => {
            expect((0, utility_1.extractFontParts)('Roboto-Italic.ttf')).toEqual({
                family: 'Roboto',
                weight: '400',
                style: 'italic',
            });
            expect((0, utility_1.extractFontParts)('OpenSans-Oblique.woff2')).toEqual({
                family: 'Open Sans',
                weight: '400',
                style: 'oblique',
            });
            expect((0, utility_1.extractFontParts)('Montserrat-Slanted.otf')).toEqual({
                family: 'Montserrat',
                weight: '400',
                style: 'slanted',
            });
        });
        it('should handle complex combinations', () => {
            expect((0, utility_1.extractFontParts)('Roboto-BoldItalic-700.ttf')).toEqual({
                family: 'Roboto',
                weight: '700',
                style: 'italic',
            });
            expect((0, utility_1.extractFontParts)('OpenSans-ExtraLightOblique-200.woff2')).toEqual({
                family: 'Open Sans',
                weight: '200',
                style: 'oblique',
            });
            expect((0, utility_1.extractFontParts)('Montserrat-BlackItalic-900weight.otf')).toEqual({
                family: 'Montserrat',
                weight: '900',
                style: 'italic',
            });
        });
        it('should handle various separators', () => {
            expect((0, utility_1.extractFontParts)('Roboto_Bold.ttf')).toEqual({
                family: 'Roboto',
                weight: '700',
                style: 'normal',
            });
            expect((0, utility_1.extractFontParts)('Open Sans Extra Light.woff2')).toEqual({
                family: 'Open Sans Extra Light',
                weight: '',
                style: '',
            });
            expect((0, utility_1.extractFontParts)('Montserrat-Black_Italic.otf')).toEqual({
                family: 'Montserrat',
                weight: '900',
                style: 'italic',
            });
        });
    });
    describe('getFontFileName', () => {
        it('should generate correct filenames for regular weights', () => {
            expect((0, utility_1.getFontFileName)('Roboto', '400', 'normal')).toBe('RobotoRegular');
            expect((0, utility_1.getFontFileName)('OpenSans', '400', 'normal')).toBe('OpenSansRegular');
        });
        it('should handle different weights', () => {
            expect((0, utility_1.getFontFileName)('Roboto', '700', 'normal')).toBe('RobotoBold');
            expect((0, utility_1.getFontFileName)('OpenSans', '300', 'normal')).toBe('OpenSansLight');
            expect((0, utility_1.getFontFileName)('Montserrat', '900', 'normal')).toBe('MontserratBlack');
        });
        it('should handle italic styles', () => {
            expect((0, utility_1.getFontFileName)('Roboto', '400', 'italic')).toBe('RobotoRegularItalic');
            expect((0, utility_1.getFontFileName)('OpenSans', '700', 'italic')).toBe('OpenSansBoldItalic');
        });
        it('should handle combinations of weights and styles', () => {
            expect((0, utility_1.getFontFileName)('Roboto', '700', 'italic')).toBe('RobotoBoldItalic');
            expect((0, utility_1.getFontFileName)('OpenSans', '300', 'italic')).toBe('OpenSansLightItalic');
            expect((0, utility_1.getFontFileName)('Montserrat', '900', 'italic')).toBe('MontserratBlackItalic');
        });
        it('should handle unknown weights', () => {
            expect((0, utility_1.getFontFileName)('Roboto', '450', 'normal')).toBe('Roboto450');
            expect((0, utility_1.getFontFileName)('OpenSans', '550', 'italic')).toBe('OpenSans550Italic');
        });
    });
    describe('convertFontString', () => {
        it('should handle empty string', () => {
            expect((0, utility_1.convertFontString)('')).toBe('');
        });
        it('should convert basic font strings', () => {
            expect((0, utility_1.convertFontString)('__Advent_Pro_bf3a91')).toBe('adventPro');
            expect((0, utility_1.convertFontString)('__Open_Sans_1a2b3c')).toBe('openSans');
            expect((0, utility_1.convertFontString)('__Roboto_Mono_def456')).toBe('robotoMono');
        });
        it('should handle font strings with fallback', () => {
            expect((0, utility_1.convertFontString)('__Advent_Pro_abc123, __Advent_Pro_Fallback_abc123, sans-serif')).toBe('adventPro');
            expect((0, utility_1.convertFontString)('__Open_Sans_92fcab, __Open_Sans_Fallback_92fcab, system-ui')).toBe('openSans');
        });
        it('should handle font strings with special characters', () => {
            expect((0, utility_1.convertFontString)('__Noto_Sans_JP_abc123')).toBe('notoSansJp');
            expect((0, utility_1.convertFontString)('__Source_Code_Pro_7e4f1a')).toBe('sourceCodePro');
        });
    });
});
//# sourceMappingURL=fonts.test.js.map