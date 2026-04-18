"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToBase64DataUrl = exports.convertToBase64 = exports.isVideoFile = exports.isImageFile = exports.getMimeType = exports.getBaseName = exports.getDirName = exports.updateGitignore = exports.isBinaryFile = void 0;
const constants_1 = require("@onlook/constants");
const mime_lite_1 = __importDefault(require("mime-lite"));
/**
 * Check if a file is binary based on its extension
 * @param filename - The filename to check
 * @returns True if the file is binary, false otherwise
 */
const isBinaryFile = (filename) => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return constants_1.BINARY_EXTENSIONS.includes(ext);
};
exports.isBinaryFile = isBinaryFile;
/**
 * Updates .gitignore file to include a target entry
 * @param target - The entry to add to .gitignore
 * @param fileOps - File operations interface
 * @returns True if successfully updated, false otherwise
 */
const updateGitignore = async (target, fileOps) => {
    const gitignorePath = '.gitignore';
    try {
        // Check if .gitignore exists
        const gitignoreExists = await fileOps.fileExists(gitignorePath);
        if (!gitignoreExists) {
            // Create .gitignore with the target
            await fileOps.writeFile(gitignorePath, target + '\n');
            return true;
        }
        // Read existing .gitignore content
        const gitignoreContent = await fileOps.readFile(gitignorePath);
        if (gitignoreContent === null) {
            return false;
        }
        const lines = gitignoreContent.split(/\r?\n/);
        // Look for exact match of target
        if (!lines.some((line) => line.trim() === target)) {
            // Ensure there's a newline before adding if the file doesn't end with one
            const separator = gitignoreContent.endsWith('\n') ? '' : '\n';
            await fileOps.writeFile(gitignorePath, gitignoreContent + `${separator}${target}\n`);
        }
        return true;
    }
    catch (error) {
        console.error(`Failed to update .gitignore: ${error}`);
        return false;
    }
};
exports.updateGitignore = updateGitignore;
const getDirName = (filePath) => {
    const parts = filePath.split('/');
    if (parts.length <= 1)
        return '.';
    return parts.slice(0, -1).join('/') || '.';
};
exports.getDirName = getDirName;
const getBaseName = (filePath) => {
    const parts = filePath.split('/');
    return parts.pop() || '';
};
exports.getBaseName = getBaseName;
const getMimeType = (fileName) => {
    const lowerCasedFileName = fileName.toLowerCase();
    // Image formats
    if (lowerCasedFileName.endsWith('.ico'))
        return 'image/x-icon';
    if (lowerCasedFileName.endsWith('.png'))
        return 'image/png';
    if (lowerCasedFileName.endsWith('.jpg') || lowerCasedFileName.endsWith('.jpeg'))
        return 'image/jpeg';
    if (lowerCasedFileName.endsWith('.svg'))
        return 'image/svg+xml';
    if (lowerCasedFileName.endsWith('.gif'))
        return 'image/gif';
    if (lowerCasedFileName.endsWith('.webp'))
        return 'image/webp';
    if (lowerCasedFileName.endsWith('.bmp'))
        return 'image/bmp';
    // Video formats
    if (lowerCasedFileName.endsWith('.mp4'))
        return 'video/mp4';
    if (lowerCasedFileName.endsWith('.webm'))
        return 'video/webm';
    if (lowerCasedFileName.endsWith('.ogg') || lowerCasedFileName.endsWith('.ogv'))
        return 'video/ogg';
    if (lowerCasedFileName.endsWith('.mov'))
        return 'video/quicktime';
    if (lowerCasedFileName.endsWith('.avi'))
        return 'video/x-msvideo';
    const res = mime_lite_1.default.getType(fileName);
    if (res)
        return res;
    return 'application/octet-stream';
};
exports.getMimeType = getMimeType;
const isImageFile = (fileName) => {
    const mimeType = (0, exports.getMimeType)(fileName);
    return constants_1.IMAGE_EXTENSIONS.includes(mimeType);
};
exports.isImageFile = isImageFile;
/**
 * Check if a file is a video based on its filename or MIME type
 * @param fileNameOrMimeType - The filename (e.g., "video.mp4") or MIME type (e.g., "video/mp4")
 * @returns True if the file is a video, false otherwise
 */
const isVideoFile = (fileNameOrMimeType) => {
    // If it looks like a MIME type (starts with 'video/' pattern), check it directly
    if (fileNameOrMimeType.startsWith('video/') || fileNameOrMimeType.startsWith('audio/') || fileNameOrMimeType.startsWith('image/')) {
        return fileNameOrMimeType.toLowerCase().startsWith('video/');
    }
    // Otherwise, treat it as a filename or file path
    const mimeType = (0, exports.getMimeType)(fileNameOrMimeType);
    return mimeType.startsWith('video/');
};
exports.isVideoFile = isVideoFile;
const convertToBase64 = (content) => {
    return btoa(Array.from(content)
        .map((byte) => String.fromCharCode(byte))
        .join(''));
};
exports.convertToBase64 = convertToBase64;
/**
 * Convert file content (string or binary) to a base64 data URL
 * @param content - File content (string for text files, Uint8Array for binary)
 * @param mimeType - MIME type of the file
 * @returns Base64 data URL
 */
const convertToBase64DataUrl = (content, mimeType) => {
    // Convert string to UTF-8 bytes to handle Unicode safely (e.g., emoji, localized text in SVGs)
    const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content;
    const base64 = (0, exports.convertToBase64)(bytes);
    return `data:${mimeType};base64,${base64}`;
};
exports.convertToBase64DataUrl = convertToBase64DataUrl;
//# sourceMappingURL=file.js.map