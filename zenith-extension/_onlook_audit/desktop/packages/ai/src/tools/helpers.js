"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IGNORE_PATHS = void 0;
exports.getAllFiles = getAllFiles;
const fast_glob_1 = __importDefault(require("fast-glob"));
exports.IGNORE_PATHS = [
    'node_modules/**',
    'dist/**',
    'build/**',
    'public/**',
    'static/**',
    '.next/**',
    '.git/**',
    '.vscode/**',
    '.idea/**',
    '.DS_Store',
    '.env',
];
async function getAllFiles(dirPath, options = {
    patterns: ['**/*'],
    ignore: exports.IGNORE_PATHS,
    maxDepth: 5,
}) {
    try {
        const files = await (0, fast_glob_1.default)(options.patterns, {
            cwd: dirPath,
            ignore: options.ignore,
            deep: options.maxDepth,
        });
        return { success: true, files };
    }
    catch (error) {
        console.error(error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
//# sourceMappingURL=helpers.js.map