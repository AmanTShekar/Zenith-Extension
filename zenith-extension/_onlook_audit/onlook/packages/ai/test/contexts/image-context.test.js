"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@onlook/models");
const bun_test_1 = require("bun:test");
const uuid_1 = require("uuid");
const image_1 = require("../../src/contexts/classes/image");
(0, bun_test_1.describe)('ImageContext', () => {
    const createMockImageContext = (overrides = {}) => ({
        type: models_1.MessageContextType.IMAGE,
        content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        displayName: 'Screenshot.png',
        mimeType: 'image/png',
        id: (0, uuid_1.v4)(),
        ...overrides,
    });
    (0, bun_test_1.describe)('static properties', () => {
        (0, bun_test_1.test)('should have correct context type', () => {
            (0, bun_test_1.expect)(image_1.ImageContext.contextType).toBe(models_1.MessageContextType.IMAGE);
        });
        (0, bun_test_1.test)('should have correct display name', () => {
            (0, bun_test_1.expect)(image_1.ImageContext.displayName).toBe('Image');
        });
        (0, bun_test_1.test)('should have an icon', () => {
            (0, bun_test_1.expect)(image_1.ImageContext.icon).toBeDefined();
        });
    });
    (0, bun_test_1.describe)('getPrompt', () => {
        (0, bun_test_1.test)('should generate correct prompt format for PNG', () => {
            const context = createMockImageContext();
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/png]');
        });
        (0, bun_test_1.test)('should generate correct prompt format for JPEG', () => {
            const context = createMockImageContext({
                mimeType: 'image/jpeg',
                content: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDX/9k=',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/jpeg]');
        });
        (0, bun_test_1.test)('should generate correct prompt format for GIF', () => {
            const context = createMockImageContext({
                mimeType: 'image/gif',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/gif]');
        });
        (0, bun_test_1.test)('should generate correct prompt format for WebP', () => {
            const context = createMockImageContext({
                mimeType: 'image/webp',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/webp]');
        });
        (0, bun_test_1.test)('should generate correct prompt format for SVG', () => {
            const context = createMockImageContext({
                mimeType: 'image/svg+xml',
                content: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/svg+xml]');
        });
        (0, bun_test_1.test)('should handle unknown mime types', () => {
            const context = createMockImageContext({
                mimeType: 'image/unknown',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/unknown]');
        });
        (0, bun_test_1.test)('should handle empty mime type', () => {
            const context = createMockImageContext({
                mimeType: '',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: ]');
        });
        (0, bun_test_1.test)('should handle mime type with charset', () => {
            const context = createMockImageContext({
                mimeType: 'image/svg+xml; charset=utf-8',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/svg+xml; charset=utf-8]');
        });
        (0, bun_test_1.test)('should handle non-standard mime types', () => {
            const context = createMockImageContext({
                mimeType: 'application/octet-stream',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: application/octet-stream]');
        });
    });
    (0, bun_test_1.describe)('getLabel', () => {
        (0, bun_test_1.test)('should use displayName when available', () => {
            const context = createMockImageContext({
                displayName: 'Profile Picture',
            });
            const label = image_1.ImageContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Profile Picture');
        });
        (0, bun_test_1.test)('should fallback to "Image" when no displayName', () => {
            const context = createMockImageContext({
                displayName: '',
            });
            const label = image_1.ImageContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Image');
        });
        (0, bun_test_1.test)('should fallback to "Image" when displayName is undefined', () => {
            const context = createMockImageContext();
            delete context.displayName;
            const label = image_1.ImageContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Image');
        });
        (0, bun_test_1.test)('should handle displayName with special characters', () => {
            const context = createMockImageContext({
                displayName: 'Screenshot & Design #1.png',
            });
            const label = image_1.ImageContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('Screenshot & Design #1.png');
        });
        (0, bun_test_1.test)('should handle displayName with unicode characters', () => {
            const context = createMockImageContext({
                displayName: '图片文件.jpg',
            });
            const label = image_1.ImageContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('图片文件.jpg');
        });
        (0, bun_test_1.test)('should handle whitespace-only displayName', () => {
            const context = createMockImageContext({
                displayName: '   \t\n   ',
            });
            const label = image_1.ImageContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe('   \t\n   ');
        });
        (0, bun_test_1.test)('should handle very long displayName', () => {
            const longName = 'Very long image filename that might be generated by some applications ' + 'a'.repeat(100) + '.png';
            const context = createMockImageContext({
                displayName: longName,
            });
            const label = image_1.ImageContext.getLabel(context);
            (0, bun_test_1.expect)(label).toBe(longName);
        });
    });
    (0, bun_test_1.describe)('toFileUIParts', () => {
        (0, bun_test_1.test)('should convert single image to file UI part', () => {
            const images = [createMockImageContext()];
            const parts = image_1.ImageContext.toFileUIParts(images);
            (0, bun_test_1.expect)(parts).toHaveLength(1);
            (0, bun_test_1.expect)(parts[0]).toEqual({
                type: 'file',
                mediaType: 'image/png',
                url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
            });
        });
        (0, bun_test_1.test)('should convert multiple images to file UI parts', () => {
            const images = [
                createMockImageContext({
                    mimeType: 'image/jpeg',
                    content: 'data:image/jpeg;base64,jpeg-data',
                }),
                createMockImageContext({
                    mimeType: 'image/gif',
                    content: 'data:image/gif;base64,gif-data',
                }),
                createMockImageContext({
                    mimeType: 'image/webp',
                    content: 'data:image/webp;base64,webp-data',
                }),
            ];
            const parts = image_1.ImageContext.toFileUIParts(images);
            (0, bun_test_1.expect)(parts).toHaveLength(3);
            (0, bun_test_1.expect)(parts[0]).toEqual({
                type: 'file',
                mediaType: 'image/jpeg',
                url: 'data:image/jpeg;base64,jpeg-data',
            });
            (0, bun_test_1.expect)(parts[1]).toEqual({
                type: 'file',
                mediaType: 'image/gif',
                url: 'data:image/gif;base64,gif-data',
            });
            (0, bun_test_1.expect)(parts[2]).toEqual({
                type: 'file',
                mediaType: 'image/webp',
                url: 'data:image/webp;base64,webp-data',
            });
        });
        (0, bun_test_1.test)('should handle empty images array', () => {
            const parts = image_1.ImageContext.toFileUIParts([]);
            (0, bun_test_1.expect)(parts).toHaveLength(0);
            (0, bun_test_1.expect)(parts).toEqual([]);
        });
        (0, bun_test_1.test)('should preserve order of images', () => {
            const images = [
                createMockImageContext({ content: 'first-image-data' }),
                createMockImageContext({ content: 'second-image-data' }),
                createMockImageContext({ content: 'third-image-data' }),
            ];
            const parts = image_1.ImageContext.toFileUIParts(images);
            (0, bun_test_1.expect)(parts[0].url).toBe('first-image-data');
            (0, bun_test_1.expect)(parts[1].url).toBe('second-image-data');
            (0, bun_test_1.expect)(parts[2].url).toBe('third-image-data');
        });
        (0, bun_test_1.test)('should handle images with various mime types', () => {
            const images = [
                createMockImageContext({ mimeType: 'image/png' }),
                createMockImageContext({ mimeType: 'image/svg+xml' }),
                createMockImageContext({ mimeType: 'image/bmp' }),
                createMockImageContext({ mimeType: 'image/tiff' }),
            ];
            const parts = image_1.ImageContext.toFileUIParts(images);
            (0, bun_test_1.expect)(parts[0].mediaType).toBe('image/png');
            (0, bun_test_1.expect)(parts[1].mediaType).toBe('image/svg+xml');
            (0, bun_test_1.expect)(parts[2].mediaType).toBe('image/bmp');
            (0, bun_test_1.expect)(parts[3].mediaType).toBe('image/tiff');
        });
        (0, bun_test_1.test)('should handle images with URL content (not data URLs)', () => {
            const images = [
                createMockImageContext({
                    content: 'https://example.com/image1.png',
                    mimeType: 'image/png',
                }),
                createMockImageContext({
                    content: '/uploads/image2.jpg',
                    mimeType: 'image/jpeg',
                }),
            ];
            const parts = image_1.ImageContext.toFileUIParts(images);
            (0, bun_test_1.expect)(parts[0].url).toBe('https://example.com/image1.png');
            (0, bun_test_1.expect)(parts[1].url).toBe('/uploads/image2.jpg');
        });
        (0, bun_test_1.test)('should handle images with empty content', () => {
            const images = [
                createMockImageContext({ content: '' }),
            ];
            const parts = image_1.ImageContext.toFileUIParts(images);
            (0, bun_test_1.expect)(parts[0].url).toBe('');
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.test)('should handle null or undefined properties gracefully', () => {
            const context = {
                type: models_1.MessageContextType.IMAGE,
                content: 'test-content',
                displayName: null,
                mimeType: undefined,
            };
            (0, bun_test_1.expect)(() => image_1.ImageContext.getPrompt(context)).not.toThrow();
            (0, bun_test_1.expect)(() => image_1.ImageContext.getLabel(context)).not.toThrow();
        });
        (0, bun_test_1.test)('should handle very long base64 data', () => {
            const longBase64 = 'data:image/png;base64,' + 'A'.repeat(100000);
            const context = createMockImageContext({
                content: longBase64,
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/png]');
        });
        (0, bun_test_1.test)('should handle SVG with inline content', () => {
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="blue" />
                <text x="50" y="50" fill="white" text-anchor="middle">Hello</text>
            </svg>`;
            const context = createMockImageContext({
                content: svgContent,
                mimeType: 'image/svg+xml',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/svg+xml]');
        });
        (0, bun_test_1.test)('should handle mime type with parameters', () => {
            const context = createMockImageContext({
                mimeType: 'image/png; quality=0.9; compression=lossless',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: image/png; quality=0.9; compression=lossless]');
        });
        (0, bun_test_1.test)('should handle blob URLs', () => {
            const context = createMockImageContext({
                content: 'blob:https://example.com/12345678-1234-1234-1234-123456789abc',
            });
            const parts = image_1.ImageContext.toFileUIParts([context]);
            (0, bun_test_1.expect)(parts[0].url).toBe('blob:https://example.com/12345678-1234-1234-1234-123456789abc');
        });
        (0, bun_test_1.test)('should handle file:// URLs', () => {
            const context = createMockImageContext({
                content: 'file:///path/to/local/image.png',
            });
            const parts = image_1.ImageContext.toFileUIParts([context]);
            (0, bun_test_1.expect)(parts[0].url).toBe('file:///path/to/local/image.png');
        });
        (0, bun_test_1.test)('should handle case-sensitive mime types', () => {
            const context = createMockImageContext({
                mimeType: 'IMAGE/PNG',
            });
            const prompt = image_1.ImageContext.getPrompt(context);
            (0, bun_test_1.expect)(prompt).toBe('[Image: IMAGE/PNG]');
        });
        (0, bun_test_1.test)('should handle unicode characters in displayName and content', () => {
            const context = createMockImageContext({
                displayName: '屏幕截图 🖼️.png',
                content: 'data:image/png;base64,unicode-test-data',
            });
            const label = image_1.ImageContext.getLabel(context);
            const parts = image_1.ImageContext.toFileUIParts([context]);
            (0, bun_test_1.expect)(label).toBe('屏幕截图 🖼️.png');
            (0, bun_test_1.expect)(parts[0].url).toBe('data:image/png;base64,unicode-test-data');
        });
    });
});
//# sourceMappingURL=image-context.test.js.map