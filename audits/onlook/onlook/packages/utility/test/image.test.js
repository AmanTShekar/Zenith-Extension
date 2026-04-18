"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const image_1 = require("../src/image");
(0, bun_test_1.describe)('addImageFolderPrefix', () => {
    (0, bun_test_1.describe)('with regular file paths', () => {
        (0, bun_test_1.it)('converts relative path to absolute path', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('images/photo.jpg')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('converts web-relative path to absolute path', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('/images/photo.jpg')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles nested directory paths', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('/images/subfolder/photo.jpg')).toBe('public/images/subfolder/photo.jpg');
        });
        (0, bun_test_1.it)('returns absolute path as-is when already absolute', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('public/images/photo.jpg')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles paths with public prefix correctly', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('public/images/subfolder/photo.jpg')).toBe('public/images/subfolder/photo.jpg');
        });
    });
    (0, bun_test_1.describe)('with CSS url() functions (non-URLs)', () => {
        (0, bun_test_1.it)('treats url() without full URL as path and adds public prefix', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url("/images/photo.jpg")')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('treats url() with single quotes as path and adds public prefix', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)("url('/images/photo.jpg')")).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('treats url() without quotes as path and adds public prefix', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url(/images/photo.jpg)')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles url() with spaces', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url( "/images/photo.jpg" )')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles nested directory paths in url()', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url("/images/subfolder/photo.jpg")')).toBe('public/images/subfolder/photo.jpg');
        });
    });
    (0, bun_test_1.describe)('with full URLs in url() functions', () => {
        (0, bun_test_1.it)('extracts pathname from full URL', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url("https://example.com/images/photo.jpg")')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles localhost URLs', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url("http://localhost:3000/images/photo.jpg")')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles CodeSandbox URLs', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url("https://xxx-3000.csb.app/images/photo.jpg")')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles URLs with query parameters', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url("https://example.com/images/photo.jpg?v=1")')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles URLs with fragments', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url("https://example.com/images/photo.jpg#section")')).toBe('public/images/photo.jpg');
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.it)('handles empty string', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('')).toBe('');
        });
        (0, bun_test_1.it)('handles single slash', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('/')).toBe('');
        });
        (0, bun_test_1.it)('handles paths with multiple slashes', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('//images//photo.jpg')).toBe('public/images/photo.jpg');
        });
        (0, bun_test_1.it)('returns non-url strings as empty string', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('not-a-url')).toBe('');
        });
        (0, bun_test_1.it)('handles malformed url() functions', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url(')).toBe('');
        });
        (0, bun_test_1.it)('handles url() with empty content', () => {
            (0, bun_test_1.expect)((0, image_1.addImageFolderPrefix)('url("")')).toBe('');
        });
    });
});
(0, bun_test_1.describe)('stripImageFolderPrefix', () => {
    (0, bun_test_1.describe)('with public folder prefix', () => {
        (0, bun_test_1.it)('removes public folder prefix from image path', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/images/photo.jpg')).toBe('images/photo.jpg');
        });
        (0, bun_test_1.it)('handles nested directories within public folder', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/images/subfolder/photo.jpg')).toBe('images/subfolder/photo.jpg');
        });
        (0, bun_test_1.it)('handles deeply nested directories', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/images/assets/icons/logo.png')).toBe('images/assets/icons/logo.png');
        });
        (0, bun_test_1.it)('handles files directly in public folder', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/favicon.ico')).toBe('favicon.ico');
        });
        (0, bun_test_1.it)('handles paths with special characters in filenames', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/images/photo-1_2.jpg')).toBe('images/photo-1_2.jpg');
        });
        (0, bun_test_1.it)('handles paths with spaces in filenames', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/images/my photo.jpg')).toBe('images/my photo.jpg');
        });
    });
    (0, bun_test_1.describe)('without public folder prefix', () => {
        (0, bun_test_1.it)('returns path unchanged when no public prefix', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('images/photo.jpg')).toBe('images/photo.jpg');
        });
        (0, bun_test_1.it)('returns path unchanged for relative paths', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('assets/photo.jpg')).toBe('assets/photo.jpg');
        });
        (0, bun_test_1.it)('returns path unchanged for absolute paths without public', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('/images/photo.jpg')).toBe('/images/photo.jpg');
        });
        (0, bun_test_1.it)('does not remove partial matches', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public-test/images/photo.jpg')).toBe('public-test/images/photo.jpg');
        });
        (0, bun_test_1.it)('does not remove public when not at start', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('assets/public/images/photo.jpg')).toBe('assets/public/images/photo.jpg');
        });
    });
    (0, bun_test_1.describe)('edge cases', () => {
        (0, bun_test_1.it)('handles empty string', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('')).toBe('');
        });
        (0, bun_test_1.it)('handles just public folder', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/')).toBe('');
        });
        (0, bun_test_1.it)('handles public folder without trailing slash', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public')).toBe('public');
        });
        (0, bun_test_1.it)('handles paths starting with public but not followed by slash', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('publicfolder/images/photo.jpg')).toBe('publicfolder/images/photo.jpg');
        });
        (0, bun_test_1.it)('handles multiple slashes after public', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public//images//photo.jpg')).toBe('/images//photo.jpg');
        });
        (0, bun_test_1.it)('handles paths with only public/ prefix', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/logo.png')).toBe('logo.png');
        });
        (0, bun_test_1.it)('preserves leading slash when removing public prefix', () => {
            (0, bun_test_1.expect)((0, image_1.stripImageFolderPrefix)('public/images/photo.jpg')).toBe('images/photo.jpg');
        });
    });
});
(0, bun_test_1.describe)('urlToRelativePath', () => {
    (0, bun_test_1.it)('converts full URL to relative path in url() wrapper', () => {
        (0, bun_test_1.expect)((0, image_1.urlToRelativePath)('url("https://example.com/images/photo.jpg")')).toBe("url('/images/photo.jpg')");
    });
    (0, bun_test_1.it)('returns non-url strings unchanged', () => {
        (0, bun_test_1.expect)((0, image_1.urlToRelativePath)('/images/photo.jpg')).toBe('/images/photo.jpg');
    });
    (0, bun_test_1.it)('returns url() with relative paths unchanged', () => {
        (0, bun_test_1.expect)((0, image_1.urlToRelativePath)('url("/images/photo.jpg")')).toBe('url("/images/photo.jpg")');
    });
    (0, bun_test_1.it)('handles malformed URLs gracefully', () => {
        (0, bun_test_1.expect)((0, image_1.urlToRelativePath)('url("not-a-valid-url")')).toBe('url("not-a-valid-url")');
    });
});
//# sourceMappingURL=image.test.js.map