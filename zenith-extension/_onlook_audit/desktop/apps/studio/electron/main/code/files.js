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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.formatContent = formatContent;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const prettier_1 = __importDefault(require("prettier"));
async function readFile(filePath) {
    try {
        const fullPath = path.resolve(filePath);
        const data = await fs_1.promises.readFile(fullPath, 'utf8');
        return data;
    }
    catch (error) {
        // Return null if file doesn't exist, otherwise throw the error
        if (error.code === 'ENOENT') {
            return null;
        }
        console.error('Error reading file:', error);
        throw error;
    }
}
async function writeFile(filePath, content, encoding = 'utf8') {
    if (!filePath) {
        throw new Error('File path is required');
    }
    try {
        const fullPath = path.resolve(filePath);
        const isNewFile = !(0, fs_1.existsSync)(fullPath);
        let fileContent = content;
        if (encoding === 'base64') {
            try {
                // Strip data URL prefix if present and validate base64
                const base64Data = content.replace(/^data:[^,]+,/, '');
                if (!isValidBase64(base64Data)) {
                    throw new Error('Invalid base64 content');
                }
                fileContent = Buffer.from(base64Data, 'base64');
            }
            catch (e) {
                throw new Error(`Invalid base64 content: ${e.message}`);
            }
        }
        // Ensure parent directory exists
        const parentDir = path.dirname(fullPath);
        await fs_1.promises.mkdir(parentDir, { recursive: true });
        await fs_1.promises.writeFile(fullPath, fileContent, { encoding });
        if (isNewFile) {
            console.log('New file created:', fullPath);
        }
    }
    catch (error) {
        const errorMessage = `Failed to write to ${filePath}: ${error.message}`;
        console.error(errorMessage);
        throw error;
    }
}
// Helper function to validate base64 strings
function isValidBase64(str) {
    try {
        return Buffer.from(str, 'base64').toString('base64') === str;
    }
    catch {
        return false;
    }
}
async function formatContent(filePath, content) {
    try {
        const config = (await prettier_1.default.resolveConfig(filePath)) || {};
        const formattedContent = await prettier_1.default.format(content, {
            ...config,
            filepath: filePath,
            plugins: [], // This prevents us from using plugins we don't have installed
        });
        return formattedContent;
    }
    catch (error) {
        console.error('Error formatting file:', error);
        return content;
    }
}
//# sourceMappingURL=files.js.map