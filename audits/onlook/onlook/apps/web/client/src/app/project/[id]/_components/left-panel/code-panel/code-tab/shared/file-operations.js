"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFolderName = exports.validateFileName = exports.FILE_CONSTRAINTS = exports.INVALID_CHARS_REGEX = exports.RESERVED_NAMES = void 0;
// System reserved names (Windows compatibility)
exports.RESERVED_NAMES = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
];
// Invalid characters for file/folder names across platforms
exports.INVALID_CHARS_REGEX = /[<>:"|?*\\/]/;
exports.FILE_CONSTRAINTS = {
    MAX_NAME_LENGTH: 255,
    MIN_NAME_LENGTH: 1,
    INVALID_CHARS: ['<', '>', ':', '"', '|', '?', '*', '\\', '/'],
    RESERVED_NAMES: exports.RESERVED_NAMES,
};
const validateFileName = (fileName) => {
    if (!fileName) {
        return { valid: false, error: 'File name is required' };
    }
    // Check for invalid characters
    if (exports.INVALID_CHARS_REGEX.test(fileName)) {
        return { valid: false, error: 'File name contains invalid characters' };
    }
    // Check for reserved names
    if (exports.FILE_CONSTRAINTS.RESERVED_NAMES.includes(fileName.toUpperCase())) {
        return { valid: false, error: 'File name is reserved' };
    }
    // Check length
    if (fileName.length > 255) {
        return { valid: false, error: 'File name is too long' };
    }
    return { valid: true };
};
exports.validateFileName = validateFileName;
const validateFolderName = (folderName) => {
    if (!folderName) {
        return { valid: false, error: 'Folder name is required' };
    }
    // Check for invalid characters
    if (exports.INVALID_CHARS_REGEX.test(folderName)) {
        return { valid: false, error: 'Folder name contains invalid characters' };
    }
    // Check for reserved names
    if (exports.RESERVED_NAMES.includes(folderName.toUpperCase())) {
        return { valid: false, error: 'Folder name is reserved' };
    }
    // Check length
    if (folderName.length > 255) {
        return { valid: false, error: 'Folder name is too long' };
    }
    return { valid: true };
};
exports.validateFolderName = validateFolderName;
//# sourceMappingURL=file-operations.js.map