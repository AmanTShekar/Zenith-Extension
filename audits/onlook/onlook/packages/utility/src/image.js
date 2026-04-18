"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressImageInBrowser = compressImageInBrowser;
exports.base64ToBlob = base64ToBlob;
exports.addBase64Prefix = addBase64Prefix;
exports.urlToRelativePath = urlToRelativePath;
exports.canHaveBackgroundImage = canHaveBackgroundImage;
exports.stripImageFolderPrefix = stripImageFolderPrefix;
exports.addImageFolderPrefix = addImageFolderPrefix;
const constants_1 = require("@onlook/constants");
const browser_image_compression_1 = __importDefault(require("browser-image-compression"));
const file_1 = require("./file");
const folder_1 = require("./folder");
// Browser-side image compression
async function compressImageInBrowser(file, compressionOptions) {
    const options = {
        maxSizeMB: compressionOptions?.maxSizeMB ?? 0.2,
        maxWidthOrHeight: compressionOptions?.maxWidthOrHeight ?? 512,
        quality: compressionOptions?.quality ?? 0.6,
    };
    try {
        const compressedFile = await (0, browser_image_compression_1.default)(file, options);
        const base64URL = browser_image_compression_1.default.getDataUrlFromFile(compressedFile);
        console.log(`Image size reduced from ${file.size} to ${compressedFile.size} (bytes)`);
        return base64URL;
    }
    catch (error) {
        console.error('Error compressing image:', error);
    }
}
function base64ToBlob(base64, mimeType) {
    const byteString = atob(base64.split(',')[1] ?? '');
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeType });
}
function addBase64Prefix(mimeType, base64) {
    if (base64.startsWith('data:')) {
        // If the base64 already has a prefix, return it
        return base64;
    }
    return `data:${mimeType};base64,${base64}`;
}
/**
 * Converts a CSS background-image URL from full URL to relative path
 * Example: url("https://xxx-3000.csb.app/images/a.jpg") -> url("/images/c.jpg")
 */
function urlToRelativePath(url) {
    const urlMatch = url.match(/url\s*\(\s*["']?([^"')]+)["']?\s*\)/);
    // If it's not a url() function or no URL found, return as is
    if (!urlMatch || !urlMatch[1]) {
        return url;
    }
    const fullUrl = urlMatch[1];
    // Extract the pathname (e.g., "/images/c.jpg")
    try {
        const newUrl = new URL(fullUrl);
        return `url('${newUrl.pathname}')`;
    }
    catch (error) {
        return url;
    }
}
function canHaveBackgroundImage(tagName) {
    const tag = tagName.toLowerCase();
    const backgroundElements = ['div', 'section', 'header', 'footer', 'main', 'article', 'aside'];
    return backgroundElements.includes(tag);
}
/**
 * Convert image path to relative path by removing the image folder path
 * Example: public/images/a.jpg -> /images/a.jpg
 * @param imagePath
 * @returns url
 */
function stripImageFolderPrefix(imagePath) {
    return imagePath.replace(new RegExp(`^${constants_1.DefaultSettings.IMAGE_FOLDER}\/`), '');
}
/**
 * Convert image path to absolute path by adding the image folder path
 * Example: /images/a.jpg -> public/images/a.jpg
 *          public/images/a.jpg -> public/images/a.jpg
 *          images/a.jpg -> public/images/a.jpg
 *          url("/images/a.jpg") -> public/images/a.jpg
 *          url("https://example.com/images/a.jpg") -> public/images/a.jpg
 *
 * @param imagePath
 * @returns url
 */
function addImageFolderPrefix(imagePath) {
    const relativePath = urlToRelativePath(imagePath);
    // Remove url() wrapper
    const path = relativePath.replace(/url\s*\(\s*["']?([^"')]+)["']?\s*\)/, '$1');
    if (!(0, file_1.isImageFile)(path)) {
        return '';
    }
    if (path.startsWith(constants_1.DefaultSettings.IMAGE_FOLDER)) {
        return (0, folder_1.normalizePath)(path);
    }
    return (0, folder_1.normalizePath)(`${constants_1.DefaultSettings.IMAGE_FOLDER}/${path}`);
}
//# sourceMappingURL=image.js.map